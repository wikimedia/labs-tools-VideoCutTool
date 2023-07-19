import ENV_SETTINGS from '../env';
const { phab_link, base_wiki_url } = ENV_SETTINGS();

/**
 * Get video date from either commons site or user uploads
 *
 * @param {string} videoUrl Video Path
 * @param {string} videoTitle Video Title
 * @param {function} updateAppState Update app state function
 * @returns {void}
 */
const retrieveVideoData = async (videoUrl, videoTitle, updateAppState) => {
	if (!videoUrl.includes('commons.wikimedia.org')) {
		return;
	}
	try {
		const baseUrl = `${base_wiki_url}/w/api.php?`;
		const params = {
			action: 'query',
			format: 'json',
			prop: 'videoinfo',
			titles: decodeURI(videoTitle),
			viprop: 'user|url|canonicaltitle|comment|url',
			origin: '*'
		};

		const res = await fetch(baseUrl + new URLSearchParams(params));
		const response = await res.json();
		const { pages } = response.query;
		if (Object.keys(pages)[0] !== '-1') {
			const { user, canonicaltitle, comment, url } = pages[Object.keys(pages)[0]].videoinfo[0];
			updateAppState({
				current_step: 2,
				video_url: url,
				video_details: {
					author: user,
					title: decodeURIComponent(canonicaltitle.slice(5)).replace(/\s/g, '_'),
					comment
				}
			});
		}
	} catch (err) {
		updateAppState({
			notification: {
				type: 'error',
				messageId: 'error-retrieve-data',
				footerId: 'notification-error-bug-call-to-action',
				linkTitle: 'notifications-error-bug-report',
				link: phab_link
			}
		});
	}
};

/**
 * Check that video exist on commons site
 *
 * @param {string} filePath Video path
 * @param {function} updateAppState Update app state function
 * @returns {void}
 */
const checkFileExist = async (filePath, updateAppState) => {
	// First check if pattern File:(filename) exists
	const matchPath = filePath.match(/File:(.*)$/);
	if (matchPath === null) {
		return;
	}
	const fileName = matchPath[0];
	const baseUrl = `${base_wiki_url}/w/api.php?`;
	const params = {
		action: 'query',
		titles: fileName,
		format: 'json',
		formatversion: 2,
		origin: '*'
	};
	try {
		const res = await fetch(baseUrl + new URLSearchParams(params));
		const response = await res.json();
		const pageObj = response.query.pages[0];
		if ('missing' in pageObj) {
			return;
		}
		// File exists, retrieve video data
		await retrieveVideoData(filePath, fileName, updateAppState);
	} catch (err) {
		updateAppState({
			notification: {
				type: 'error',
				messageId: 'error-file-not-exist',
				footerId: 'notification-error-bug-call-to-action',
				linkTitle: 'notifications-error-bug-report',
				link: phab_link
			}
		});
	}
};

/**
 * Process the video after manipulations
 *
 * @param {object} formData Form data
 * @param {function} updateAppState Update app state function
 * @returns {void}
 */
const processVideo = async (formData, updateAppState) => {
	const API_URL = ENV_SETTINGS().backend_url;
	try {
		const res = await fetch(`${API_URL}/process`, {
			method: 'POST',
			body: formData
		});
		const response = await res.json();
		if (!response.success) throw response;
	} catch (err) {
		// errors are catched here from the fetch call
		if (err.message) {
			updateAppState({
				current_sub_step: '',
				notification: {
					type: 'error',
					messageId: err.message,
					footerId: 'notification-error-bug-call-to-action',
					linkTitle: 'notifications-error-bug-report',
					link: phab_link
				}
			});
		}
	}
};

/**
 * Upload videos to commons site
 *
 * @param {function} setShowProgress Set show progress function
 * @param {object} videoState Video state
 * @param {object} user User object
 * @param {string} wantTitle Wanted title
 * @param {function} updateAppState Update app state function
 * @returns {void}
 */

const uploadVideos = async (setShowProgress, videoState, user, wantTitle, updateAppState) => {
	const API_URL = ENV_SETTINGS().backend_url;

	setShowProgress(true);
	const uploadData = {
		upload: true,
		videos: videoState,
		user
	};

	try {
		const uploadResponse = await fetch(`${API_URL}/upload`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(uploadData)
		});

		const data = await uploadResponse.json();

		const { success } = data;

		if (data.type === 'Error' && !success) throw data;

		setShowProgress(false);

		if (success === true) {
			updateAppState({
				notification: {
					type: 'success',
					messageId: 'task-uploaded-wikimedia-commons',
					link: `${base_wiki_url}/wiki/File:${wantTitle}`,
					linkTitle: 'task-uploaded-wikimedia-commons-footer-cover',
					footerId: 'task-uploaded-wikimedia-commons-footer'
				},
				// Reset UI
				current_step: 1,
				current_sub_step: '',
				video_url: ''
			});
		} else {
			const { type, warnings } = data;
			if (type === 'Warning') {
				// Show all concerned warnings
				for (let warning of warnings) {
					updateAppState({
						notification: {
							type: 'warning',
							messageId: `${warning}-message`,
							footerId: `${warning}-footer`,

							// conditional adding of the link attribute, if present
							...(warning === 'badfilename' && {
								link: 'https://www.mediawiki.org/wiki/Manual:$wgIllegalFileChars',
								linkTitle: 'warning-badfilename-footer-cover'
							})
						}
					});
				}
			}
		}
	} catch (err) {
		// errors are catched here from the fetch call
		setShowProgress(false);
		updateAppState({
			notification: {
				type: 'error',
				text: err.message,
				footerId: 'notification-error-bug-call-to-action',
				linkTitle: 'notifications-error-bug-report',
				link: phab_link
			}
		});
	}
};

export { checkFileExist, processVideo, uploadVideos };
