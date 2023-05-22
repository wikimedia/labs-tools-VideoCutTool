import axios from 'axios';

import { useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, ToggleButton, Form, InputGroup } from 'react-bootstrap';
import { Upload, Download, CardHeading, CardText, ChatLeftTextFill } from 'react-bootstrap-icons';
import { Message, BananaContext } from '@wikimedia/react.i18n';
import { AppContext } from '../context';
import VideoPlayer from './VideoPlayer';
import ProgressBar from './ProgressBar';
import ENV_SETTINGS from '../env';

const API_URL = ENV_SETTINGS().backend_url;

function Results() {
	const banana = useContext(BananaContext);
	const {
		appState,
		updateAppState,
		hourTimer,
		minuteTimer,
		secondTimer,
		setHourTimer,
		setMinuteTimer,
		setSecondTimer
	} = useContext(AppContext);
	const { videos, user, video_details: videoDetails } = appState;
	const [videoState, setVideoState] = useState([]);
	const [showProgress, setShowProgress] = useState(false);
	const [encodeTimer, setEncodeTimer] = useState('');
	const [wantTitle, setWantTitle] = useState('');

	const updateVideoState = (newState, index) => {
		const newVideoData = { ...videoState[index], ...newState };
		const newVideosState = [...videoState];
		newVideosState[index] = newVideoData;
		setVideoState(newVideosState);
	};

	useEffect(() => {
		const { title, author, comment = '' } = videoDetails;
		const [day, month, year] = new Date()
			.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			})
			.split('/');

		const user = localStorage.getItem('user');
		const { username } = JSON.parse(user);
		const actions = localStorage.getItem('video-settings');
		const changes = JSON.parse(actions);
		const rotation = localStorage.getItem('video-manipulations');
		const rotationAmount = JSON.parse(rotation).rotate_value;
		let subcomment = '';
		if (changes[0].modified === true) subcomment += 'put on mute ';
		if (changes[1].modified === true) {
			if (rotationAmount === 0) subcomment += 'rotated right ';
			else if (rotationAmount === 2) subcomment += 'rotated left ';
			else subcomment += 'rotated upsidedown ';
		}
		if (changes[2].modified === true) subcomment += 'trimmed ';
		if (changes[3].modified === true) subcomment += 'cropped ';
		if (subcomment === '') {
			subcomment += 'not edited ';
		}
		// To avoid merging actions into single words, add a space after each action name.
		const videosWithDetails = videos.map((video, index) => {
			const newTitle = title.split('.');
			const newExtension = video.split('.');
			return {
				path: video,
				title: `${newTitle[0]}_edited_${index}.${newExtension[1]}`,
				author,
				comment:
					comment ||
					`This video was ${subcomment.trimEnd()} and uploaded by ${username} with VideoCutTool`,
				text: [
					'=={{int:filedesc}}==',
					`{{Information${comment?.length > 0 ? `\n|description=${comment}` : ''}`,
					`|date=${`${year}-${month}-${day}`}`,
					`|source={{Derived from|1=${title}}}${
						author?.length > 0 ? `\n|author=[[User:${author}|${author}]]` : ''
					}`,
					'}}\n',
					'=={{int:license-header}}==',
					'{{self|cc-by-sa-4.0}}\n',
					'[[Category:VideoCutTool]]\n',
					`{{Extracted from|File:${title}}}`
				],
				selectedOptionName: 'new-file',
				displayUploadToCommons: true
			};
		});
		setVideoState(videosWithDetails);
		setWantTitle(videosWithDetails[0].title);
	}, []);

	useEffect(() => {
		const endTimer = new Date();
		let endHour = endTimer.getHours() - hourTimer;
		let endMinute = endTimer.getMinutes() - minuteTimer;
		let endSecond = endTimer.getSeconds() - secondTimer;
		if (endSecond < 0) {
			endMinute -= 1;
			endSecond += 60;
		}
		if (endMinute < 0) {
			endHour -= 1;
			endMinute += 60;
		}
		setEncodeTimer(`${endHour} hours: ${endMinute} minutes: ${endSecond} seconds`);
		setHourTimer('');
		setMinuteTimer('');
		setSecondTimer('');
	}, []);

	const updateUploadType = (index, type) => {
		const data = {
			selectedOptionName: type
		};
		updateVideoState(data, index);
	};

	const updateTitle = (index, title) => {
		updateVideoState({ title }, index);
		setWantTitle(title);
	};

	const uploadVideos = async () => {
		setShowProgress(true);
		const uploadData = {
			upload: true,
			videos: videoState,
			user
		};

		try {
			const uploadResponse = await axios.post(`${API_URL}/upload`, uploadData);
			setShowProgress(false);

			const { data } = uploadResponse;

			const { success } = data;

			if (success === true) {
				updateAppState({
					notification: {
						type: 'success',
						text: `https://commons.wikimedia.org/wiki/File:${wantTitle}`
					},
					// Reset UI
					current_step: 1,
					current_sub_step: '',
					video_url: ''
				});
			} else {
				updateAppState({
					notification: {
						type: 'warning',
						text: data.message
					}
				});
			}
		} catch (err) {
			setShowProgress(false);
			updateAppState({
				notification: {
					type: 'error',
					text: err.message
				}
			});
		}
	};

	return (
		<div id="results-container" data-show-progress={showProgress ? 'true' : 'false'}>
			<div className="videos-container">
				{videoState.map((video, index) => (
					<div className="video-results-wrapper" key={`wrapper-${index}`}>
						<div className="video-results-header">
							{video.title.length > 0 && <h5 title={video.title}>{video.title}</h5>}
							{video.title.length === 0 && <h5>(No Title)</h5>}
						</div>
						<p>
							Time Taken:
							{encodeTimer}
						</p>
						<div className={`row ${video.displayUploadToCommons === false && 'd-none'}`}>
							<div className="video-player-wrapper col-md-7">
								<VideoPlayer videoUrl={`${API_URL}/${video.path}`} />
							</div>
							<div className="video-options col-md-5">
								<div className="form-group">
									<ButtonGroup className="mb-2">
										<ToggleButton
											variant="secondary"
											onClick={() => updateUploadType(index, 'overwrite')}
											type="radio"
											name="upload-type"
											checked={video.selectedOptionName === 'overwrite'}
										>
											<span className="button-title">
												<Message id="upload-action-overwrite" />
											</span>
										</ToggleButton>
										<ToggleButton
											variant="secondary"
											onClick={() => updateUploadType(index, 'new-file')}
											type="radio"
											name="upload-type"
											checked={video.selectedOptionName === 'new-file'}
										>
											<span className="button-title">
												<Message id="upload-action-new-file" />
											</span>
										</ToggleButton>
									</ButtonGroup>
								</div>
								{video.selectedOptionName === 'new-file' && (
									<InputGroup className="mb-3" title={banana.i18n('upload-action-new-file-title')}>
										<InputGroup.Text>
											<CardHeading size="18" />
										</InputGroup.Text>

										<Form.Control
											type="text"
											defaultValue={video.title}
											onChange={e => updateTitle(index, e.target.value)}
										/>
									</InputGroup>
								)}
								<InputGroup className="mb-3" title={banana.i18n('upload-comment')}>
									<InputGroup.Text>
										<ChatLeftTextFill size="18" />
									</InputGroup.Text>

									<Form.Control type="text" defaultValue={video.comment} />
								</InputGroup>

								<InputGroup className="mb-3" title={banana.i18n('upload-text')}>
									<InputGroup.Text>
										<CardText size="18" />
									</InputGroup.Text>

									<Form.Control as="textarea" rows={15} defaultValue={video.text.join('\n')} />
								</InputGroup>
								<div className="upload-button d-flex justify-content-between">
									<Button onClick={uploadVideos}>
										<Upload />
										<span className="button-title ms-3">
											<Message id="upload-button" />
										</span>
									</Button>
									<Button
										onClick={() => {
											window.location.href = `${API_URL}/download/${video.path.replace(
												'/public',
												''
											)}`;
										}}
									>
										<Download />
										<span className="button-title ms-3">
											<Message id="step-result-choice-download" />
										</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="upload-progress-container">
				<ProgressBar />
				<div className="current-process-task mt-4">
					<Message id="task-uploading-wikimedia-commons" />
				</div>
			</div>
		</div>
	);
}
export default Results;
