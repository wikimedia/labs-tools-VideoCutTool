const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { parentPort } = require('worker_threads');
const { exec } = require('child_process');

const fsPromises = fs.promises;

/**
 * Convert time to milliseconds
 *
 * @param {string} time The time string to convert to ms
 * @returns {string} Converted time string
 */
function convertTimeToMs(time) {
	const timeArr = time.split(':');
	const hour = timeArr[0] * 60 * 60 * 1000;
	const minute = timeArr[1] * 60 * 1000;
	const sec = timeArr[2].split('.')[0] * 1000;
	const ms = timeArr[2].split('.')[1] * 10;

	return hour + minute + sec + ms;
}

/**
 * Delete files
 * @param {array|string} files Array of files paths or file path string to delete
 */
function deleteFiles(files) {
	if (!Array.isArray(files)) {
		fs.unlink(files, () => { });
		return;
	}
	files.forEach(file => {
		fs.unlink(file, () => { });
	});
}

/**
 * Spawn function wrapped in Promise object
 *
 * @param {array} args Array of ffmpeg flags
 * @param {string} stage Current processing stage
 * @param {int} videoId Video ID
 * @param {obj} resolveObj Object to pass to resolve callback
 * @param {obj} trimDuration Object to calculate trim duration. Used for trimming stage
 * @returns {obj} A reject or resolve promise
 */
function spawnAsyn(args, stage, videoId, resolveObj = {}, trimDuration = {}) {
	parentPort.postMessage({
		type: 'server-side-update',
		videoId,
		data: {
			status: 'processing',
			stage
		}
	});
	return new Promise((resolve, reject) => {
		const cmd = spawn('ffmpeg', args);
		let duration = null;
		const durationRegExp = new RegExp(/Duration\s*:\s*(\d{2}:\d{2}:\d{2}.\d{2})/, 'gim');
		cmd.stderr.on('data', chunk => {
			const decodedData = chunk.toString();
			const tLines = decodedData.split('\n');

			// Parse progress data
			if (tLines.length > 1) {
				const findDuration = decodedData.match(durationRegExp);
				if (findDuration != null) {
					const cleanDuration = findDuration[0].replace(/Duration\s*:\s*/gi, '').trim();
					duration = convertTimeToMs(cleanDuration);
				}
				return;
			}

			tLines.forEach(line => {
				// find a space and = in line to parse
				const isProgress = line.search(/(?=\s)(?=.*=)/g);
				if (isProgress === -1) {
					return;
				}
				// Cleanup - remove space before and after = and double space
				const cleanLine = line
					.trim()
					.replace(/(\s+)?=(\s+)?/g, '=')
					.replace(/\s+/g, ' ');

				const splitSpacesAndEquals = cleanLine.split(' ').map(pair => pair.split('='));

				// Convert to object
				const progressInfo = splitSpacesAndEquals.reduce((acc, infoArray) => {
					const key = infoArray[0];
					const value = infoArray[1];
					acc[key] = value;
					return acc;
				}, {});
				progressInfo.duration = duration;

				// Don't proceed if time is null
				if (typeof progressInfo.time === 'undefined') {
					return;
				}

				const time = convertTimeToMs(progressInfo.time);

				// For trimming stage we have multiple videos
				// Change duration so max progress is 100
				if (stage === 'trimming') {
					let { to, from } = trimDuration;
					to *= 1000;
					from *= 1000;

					duration = to - from;
				}

				if (duration !== null) {
					progressInfo.progress = parseInt((time / duration) * 100, 10);
				}

				// Send to parent process
				parentPort.postMessage({
					type: 'frontend-update',
					videoId,
					data: {
						status: 'processing',
						video_id: videoId,
						stage,
						progress_info: progressInfo
					}
				});
			});
		});

		cmd.on('error', err => {
			console.log('ERROR', err);
			reject(err);
		});

		cmd.on('close', code => {
			if (code === 0) {
				console.log(`Stage ${stage} completed successfully`);
				return resolve(resolveObj);
			}
			console.log(`An error occurred during ${stage} stage`, code);
			return reject(code);
		});
	});
}

/**
 * Perform different manipulations on video (disable audio, rotation
 * and cropping)
 *
 * @param {obj} videoInfo Object containing video info
 * @param {obj} manipulations Type of manipulations to perform
 * @returns {obj} Promise object
 */
async function manipulateVideo({ videoId, videoPath }, manipulations) {
	const { disable_audio, rotate, crop, trim, volume } = manipulations;

	let cmdArray = [];
	if (trim !== true) {
		// if trim is enabled then these flags are already being passed
		cmdArray = ['-i', `${videoPath}`, '-c:a', 'copy'];
	}

	if (disable_audio !== undefined) {
		cmdArray.push('-an');
	}

	const audioFilters = [];
	if (volume !== undefined) {
		audioFilters.push(`volume=${volume / 100}`);
	}

	const videoFilters = [];
	if (rotate !== undefined) {
		const rotateTransposeValues = [
			'transpose=1',
			'transpose=2,transpose=2',
			`transpose=${rotate}`,
			'transpose=4'
		];
		videoFilters.push(rotateTransposeValues[rotate]);
	}

	if (crop !== undefined) {
		const { width, height, x, y } = crop;
		videoFilters.push(
			`crop=${width / 100}*in_w:${height / 100}*in_h:${x / 100}*in_w:${y / 100}*in_h`
		);
	}

	if (videoFilters.length > 0) {
		cmdArray.push('-vf');
		cmdArray.push(`${videoFilters.join(',')}`);
	}

	if (audioFilters.length > 0) {
		cmdArray.push('-af');
		cmdArray.push(`${audioFilters.join(',')}`);
	}

	if (trim !== true) {
		const videoExtension = videoPath.split('.').pop().toLowerCase();
		const destination = path.join(__dirname, 'videos', `video-${Date.now()}.${videoExtension}`);
		cmdArray.push(`${destination}`);
		return spawnAsyn(cmdArray, 'manipulations', videoId, { newVideoPath: destination });
	}
	return cmdArray;
}

/**
 * Async function to trim videos as required
 *
 * @param {obj} videoInfo Object containing video info
 * @param {array} trims Array of trim settings
 * @returns {obj} Promise object
 */
async function trimVideos({ videoId, videoPath }, trims, manipulations = null) {
	const trimsLocations = [];
	const videoExtension = videoPath.split('.').pop().toLowerCase();

	const trimVideo = await trims.reduce(async (previousPromise, element) => {
		await previousPromise;
		const destination = path.join(
			__dirname,
			'videos',
			`trimmed-video-${Date.now()}.${videoExtension}`
		);
		trimsLocations.push(destination);
		let cmdArray = [
			'-i',
			videoPath,
			'-ss',
			element.from,
			'-to',
			element.to,
			'-async',
			1,
			'-strict',
			2,
			destination
		];

		if (manipulations != null) {
			// If manipulation exist then remove last element (destination)
			// Since manipulateVideo function will return that value
			cmdArray.pop();

			const addManipulations = await manipulateVideo({}, manipulations);
			cmdArray = [...cmdArray, ...addManipulations, destination];
		}

		return spawnAsyn(cmdArray, 'trimming', videoId, { trimsLocations }, element);
	}, Promise.resolve());

	return trimVideo;
}

/**
 * Concatenate video after trimming (in single mode)
 *
 * @param {obj} videoInfo Object containing video info
 * @returns {obj} Promise object
 */
async function concatVideos({ videoId, videoPaths }) {
	const videosListFileName = path.join(__dirname, 'videos', `filelist-${Date.now()}`);
	videoPaths.forEach(videoLocation => {
		fs.appendFileSync(videosListFileName, `file '${videoLocation}'\n`);
	});

	const concatenatedLocation = path.join(
		__dirname,
		'videos',
		`concatenated-video-${Date.now()}.${videoPaths[0].split('.').pop()}`
	);

	const cmdArray = [
		'-f',
		'concat',
		'-safe',
		0,
		'-i',
		videosListFileName,
		'-c',
		'copy',
		concatenatedLocation
	];
	return spawnAsyn(cmdArray, 'contacting', videoId, { concatenatedLocation });
}

/**
 * Convert video format if not webm or ogv
 *
 * @param {obj} videoInfo Object containing video info
 * @returns {obj} Promise object
 */
async function convertVideoFormat({ videoId, videoPaths }) {
	let videoPathsArray = videoPaths;
	if (!Array.isArray(videoPaths)) {
		videoPathsArray = [videoPaths];
	}

	const convertedLocations = [];
	await videoPathsArray.reduce(async (previousPromise, videoPath) => {
		await previousPromise;

		const videoExtension = videoPath.split('.').pop().toLowerCase();
		if (!['webm', 'ogv'].includes(videoExtension)) {
			const convertedLocation = path.join(
				__dirname,
				'videos',
				`converted-video-${Date.now()}.webm`
			);
			convertedLocations.push(convertedLocation);
			const cmdArray = [
				'-i',
				videoPath,
				'-c:v',
				'libvpx-vp9',
				'-crf',
				'23',
				'-b:v',
				'0',
				'-b:a',
				'128k',
				'-c:a',
				'libopus',
				convertedLocation
			];
			return spawnAsyn(cmdArray, 'converting', videoId);
		}

		console.log('video is already in supported format: ', videoExtension, ', skipping...');
		const convertedLocation = path.join(
			__dirname,
			'videos',
			`converted-video-${Date.now()}.${videoExtension}`
		);
		convertedLocations.push(convertedLocation);
		try {
			await fsPromises.rename(videoPath, convertedLocation);
			return Promise.resolve();
		} catch (error) {
			return Promise.reject(error);
		}
	}, Promise.resolve());

	return convertedLocations;
}

async function moveVideosToPublic(videoPaths) {
	const currentDate = Date.now();
	const videos = [];
	if (!Array.isArray(videoPaths)) {
		videoPaths = [videoPaths];
	}

	videoPaths.forEach((video, index) => {
		const videoName = `${currentDate}-${index}.${video.split('.').pop()}`;
		const newPath = path.join(__dirname, 'public', `publicVideo-${videoName}`);

		videos.push(`public/publicVideo-${videoName}`);
		fs.copyFile(video, newPath, err => {
			if (err) throw err;
			deleteFiles(video);
		});
	});

	return videos;
}
/**
 * Async function to download video before processing
 *
 * @param {string} url Url of the video
 * @param {string} videoDownloadPath Details of the downloaded video path
 * @returns {string} String with video path on success, or error property on failure
 */
async function download(url,videoDownloadPath) {
	const command = `ffmpeg -y -i "${url}" -vcodec copy -acodec copy '${videoDownloadPath}'`;

	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error}`);
			return;
		}

		console.log(`Standard Output:\n${stdout}`);
		console.error(`Standard Error:\n${stderr}`);

	});
	return videoDownloadPath;
}

module.exports = {
	deleteFiles,
	concatVideos,
	trimVideos,
	convertVideoFormat,
	manipulateVideo,
	moveVideosToPublic,
	download
};
