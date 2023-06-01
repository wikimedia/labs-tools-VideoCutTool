const path = require('path');
const { Worker } = require('worker_threads');
const fs = require('fs');
const { randomUUID } = require('crypto');
const User = require('../models/User.js');
const config = require('../config.js');
const utils = require('../utils.js');
const Video = require('../models/Video.js');
const Settings = require('../models/Settings.js');
const { blob } = require('stream/consumers');

const uploadVideos = async (req, res) => {
	const BASE_URL = 'https://commons.wikimedia.org/w/api.php';
	const { CLIENT_ID, CLIENT_SECRET } = config;
	const { user } = req.body;

	try {
		// Get refresh token from user records
		const userData = await User.findOne({
			attributes: ['refreshToken'],
			where: { mediawikiId: user.mediawikiId }
		});

		// Get access token to retrive CSRF token
		const { refreshToken } = userData;

		const params = new URLSearchParams();
		params.append('grant_type', 'refresh_token');
		params.append('refresh_token', refreshToken);
		params.append('client_id', CLIENT_ID);
		params.append('client_secret', CLIENT_SECRET);

		const getAccessToken = await fetch(
			'https://commons.wikimedia.org/w/rest.php/oauth2/access_token',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: params
			}
		);

		const tokenData = await getAccessToken.json();
		const { access_token: accessToken, refresh_token: newRefreshToken } = tokenData;

		// Update database with the new refresh token
		await User.update(
			{ refreshToken: newRefreshToken },
			{ where: { mediawikiId: user.mediawikiId } }
		);

		// Get CSRF token
		const fetchCSRFToken = await fetch(`${BASE_URL}?action=query&meta=tokens&format=json`, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${accessToken}`
			}
		});

		const getCSRFToken = await fetchCSRFToken.json();
		const csrfToken = getCSRFToken.query.tokens.csrftoken;
		const { videos } = req.body;

		// Loop through the videos and create an array of requests
		// this will allow us to upload multiple videos at once
		const concurrentRequests = videos.map(async video => {
			const { title, path: publicVideoPath, selectedOptionName, comment, text } = video;
			const filePath = path.join(__dirname, '..', publicVideoPath);
			const file = await blob(fs.createReadStream(filePath));
			const uploadParams = new FormData();

			uploadParams.append('token', csrfToken);
			uploadParams.append('file', file, { knownLength: fs.statSync(filePath).size });
			uploadParams.append('filename', title);
			uploadParams.append('text', text.join('\r\n'));
			uploadParams.append('comment', comment);

			let url = `${BASE_URL}?&action=upload&format=json`;
			if (selectedOptionName === 'overwrite') {
				url += '&ignorewarnings=true';
			}

			return fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`
				},
				body: uploadParams
			});
		});

		// Using allSettled to make sure we run the code after successful attempts
		const responseAll = await Promise.allSettled(concurrentRequests);

		// Check for errors (processing errors, not server errors)
		responseAll.forEach(async response => {
			const res = await response.value.json();
			const { upload, error } = res;

			// If warning exist then show the relevant message
			if (upload && upload.result === 'Warning') {
				const {
					warnings: { exists }
				} = upload;

				if (exists !== undefined) {
					throw new Error('File with the same name already exists');
				}
			}
		});

		// Delete files after upload
		videos.forEach(video => {
			const { path: publicVideoPath } = video;
			utils.deleteFiles(publicVideoPath);
		});

		res.json({ success: true });
	} catch (error) {
		const { response } = error;
		if (response) {
			const { data, status } = response;
			console.log('ERROR', data);
			return res.json({ success: false, message: 'An error has occurred', status });
		}
		res.json({ success: false, message: error.message }); // 'An error occurred'
	}
};

const processVideo = async (req, res) => {
	const io = req.app.get('socketio');

	const uploadedFile = req.files?.file;
	let videoIdResponse = '';
	try {
		let videoDownloadPath = null;
		// Handle file process from upload
		if (uploadedFile !== undefined) {
			const { name } = uploadedFile;
			const videoExtension = name.split('.').pop().toLowerCase();
			videoDownloadPath = path.join(
				__dirname,
				'..',
				'videos',
				`video_${Date.now()}_${parseInt(Math.random() * 10000, 10)}.${videoExtension}`
			);

			// Create a promise for the callback
			await new Promise((resolve, reject) => {
				uploadedFile.mv(videoDownloadPath, err => (err ? reject(err) : resolve()));
			});
		}

		const { crop, inputVideoUrl, trimMode, trims, modified, rotateValue, videoName } = JSON.parse(
			req.body.data
		);

		const user = JSON.parse(req.body.user);

		await User.upsert(user);
		const userDoc = await User.findOne({ mediawikiId: user.mediawikiId });

		const videoData = {
			id: randomUUID(),
			url: inputVideoUrl,
			videoDownloadPath,
			uploadedBy: userDoc.mediawikiId,
			status: 'downloading',
			videoName,
			UserMediawikiId: user.mediawikiId
		};

		const SettingsData = {
			trims,
			trimMode,
			crop,
			modified,
			rotateValue,
			VideoId: videoData.id
		};

		const videoDbObj = await Video.create(videoData);
		await videoDbObj.save();
		const videoSettingsDbObj = await Settings.create(SettingsData);
		await videoSettingsDbObj.save();
		const videoId = videoData.id;

		videoIdResponse = JSON.stringify({ videoId: videoData.id });

		const worker = new Worker(path.resolve(__dirname, '../worker.js'), {
			workerData: {
				_id: videoId,
				inputVideoUrl,
				videoDownloadPath,
				videoName,
				settings: {
					trims,
					trimMode,
					crop,
					modified,
					rotateValue
				}
			}
		});

		// Listen for a message from worker
		worker.on('message', async payload => {
			console.log(payload);
			if (payload.type.includes('frontend')) {
				io.to(req.app.get('socketid')).emit('progress:update', payload.data);
			}
			if (payload.data.status === 'processing') {
				await Video.update(
					{ status: payload.data.status, stage: payload.data.stage },
					{ where: { id: payload.videoId } }
				);
			} else if (payload.data.status === 'done') {
				Video.update(
					{ status: payload.data.status, stage: 'done', videoPublicPaths: payload.data.videos },
					{ where: { id: payload.videoId } }
				);
			} else {
				Video.update(
					{ status: payload.data.status, errorData: payload.data.error },
					{ where: { id: payload.videoId } }
				);
			}
		});

		worker.on('error', error => {
			console.log('WORKER ERROR', error);
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send('Something went wrong');
	}

	return res
		.writeHead(200, {
			'Content-Length': Buffer.byteLength(videoIdResponse),
			'Content-Type': 'text/plain'
		})
		.end(videoIdResponse);
};

const downloadVideo = (req, res) => {
	const file = `public/${req.params.videopath}`;

	// Set disposition and send it.
	res.download(file);
};

module.exports = {
	downloadVideo,
	processVideo,
	uploadVideos
};
