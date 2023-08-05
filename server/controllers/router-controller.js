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
	const { CLIENT_ID, CLIENT_SECRET, BASE_WIKI_URL } = config();
	const BASE_URL = `${BASE_WIKI_URL}/w/api.php?`;

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

		const getAccessToken = await fetch(`${BASE_WIKI_URL}/w/rest.php/oauth2/access_token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params
		});

		const tokenData = await getAccessToken.json();
		const { access_token: accessToken, refresh_token: newRefreshToken } = tokenData;

		// Update database with the new refresh token
		await User.update(
			{ refreshToken: newRefreshToken },
			{ where: { mediawikiId: user.mediawikiId } }
		);

		// Get CSRF token
		const csrfParams = {
			action: 'query',
			meta: 'tokens',
			format: 'json'
		};
		const fetchCSRFToken = await fetch(BASE_URL + new URLSearchParams(csrfParams), {
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
			uploadParams.append('text', text);
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
		const responses = await Promise.allSettled(concurrentRequests);

		// awaiting the json() method on each response
		const responseAll = await Promise.allSettled(responses.map(val => val.value.json()));

		// Check for errors (processing errors, not server errors)
		responseAll.forEach(response => {
			const result = response.value;
			const { upload, error } = result;
			if (error) {
				let err = new Error(error.info);
				err.type = 'Error';
				err.status = 400;
				err.success = false;
				throw err;
			}
			// If warning exist then show the relevant message
			else if (upload && upload.result === 'Warning') {
				const { warnings } = upload;

				// for multiple warnings, show them all to the user, like
				// warning-exists
				// warning-badfilename
				// warning-was-deleted
				// warning-duplicate
				// warning-duplicate-archive
				const warningsArray = [];
				Object.keys(warnings).forEach(key => {
					warningsArray.push(`warning-${key}`);
				});

				if (warningsArray.length > 0) {
					const warning = new Error('Warning');
					warning.warnings = warningsArray;
					warning.success = false;
					warning.status = 201;
					warning.type = 'Warning';
					throw warning;
				}
			}
		});
		// If no errors, return success

		// Delete files after upload
		videos.forEach(video => {
			const { path: publicVideoPath } = video;
			utils.deleteFiles(publicVideoPath);
		});

		return res.status(200).send({ success: true });
	} catch (error) {
		// catching all the errors and sending them to the client
		const { message, status, type, success, warnings } = error;
		console.log('ERROR', message);
		return res.status(status).send({ success, message, type, warnings });
	}
};
const getVideoDownloadPathById = async (videoId) => {
	try {
		const video = await Video.findOne({
			where: { id: videoId },
			attributes: ['videoDownloadPath'],
		});
		if (!video) {
			throw new Error('Video not found');
		}
		return video.videoDownloadPath;
	} catch (error) {
		console.error('Error fetching videoDownloadPath:', error);
		return null;
	}
};
const processVideo = async (req, res) => {
	const io = req.app.get('socketio');

	const videoId = req.body.videoid;

	let videoIdResponse = '';
	try {
		const { crop, inputVideoUrl, trimMode, trims, modified, rotateValue, videoName, volume } =
			JSON.parse(req.body.data);

		const videoDownloadPath = await getVideoDownloadPathById(videoId);

		const user = JSON.parse(req.body.user);

		if (Object.keys(user).length === 0) {
			const e = new Error('login-alert-preview');
			e.success = false;
			e.status = 400;
			throw e;
		}

		const SettingsData = {
			trims,
			trimMode,
			crop,
			modified,
			rotateValue,
			volume,
			VideoId: videoId
		};
		await Settings.update(SettingsData, { where: { VideoId: videoId } });

		videoIdResponse = JSON.stringify({ videoId: videoId });

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
					rotateValue,
					volume
				}
			}
		});

		// Listen for a message from worker
		worker.on('message', async payload => {
			console.log(payload);
			if (payload.type.includes('frontend')) {
				io.to(user.socketId).emit('progress:update', payload.data);
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
			const workerError = new Error('error-worker');
			workerError.success = false;
			workerError.status = 400;
			throw workerError;
		});
	} catch (err) {
		console.log(err);
		const { status, message, success } = err;
		return res.status(status).send({ success, message });
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

const registerVideo = async (req, res) => {
	const videoid = randomUUID();
	const videoName = JSON.parse(req.body.title);
	const user = JSON.parse(req.body.user);
	const url = req.body.url ? req.body.url : '';
	const uploadedFile = req.files?.file;

	const videoExtension = videoName.split('.').pop().toLowerCase();
	const videoDownloadPath = path.join(
		__dirname,
		'../videos',
		`video_${Date.now()}_${parseInt(Math.random() * 10000, 10)}.${videoExtension}`
	);

	try {
		if (!user) {
			const e = new Error('login-alert-preview');
			e.success = false;
			e.status = 400;
			throw e;
		}
		if (url.includes('wikimedia')) {
			await utils.download(url, videoDownloadPath);
		}
		else {
			await new Promise((resolve, reject) => {
				uploadedFile.mv(videoDownloadPath, err => (err ? reject(err) : resolve()));
			});
		}
		await User.upsert(user);
		const userDoc = await User.findOne({ mediawikiId: user.mediawikiId });
		const videoData = {
			id: videoid,
			url: url,
			videoDownloadPath,
			uploadedBy: userDoc.mediawikiId,
			status: 'downloading',
			videoName,
			UserMediawikiId: user.mediawikiId
		};
		const SettingsData = {
			rotateValue: 0,
			trimMode: 'single',
			trims: [],
			modified: {},
			crop: {},
			volume: 0,
			VideoId: videoData.id
		};
		const videoDbObj = await Video.create(videoData);
		await videoDbObj.save();

		const videoSettingsDbObj = await Settings.create(SettingsData);
		await videoSettingsDbObj.save();

		res.send({ id: videoid });
	} catch (err) {
		console.log(err);
		const { status, message, success } = err;
		return res.status(status).send({ success, message });
	}
}

module.exports = {
	downloadVideo,
	processVideo,
	uploadVideos,
	registerVideo
};
