import { useState, useContext, useEffect } from 'react';
import { Message, BananaContext } from '@wikimedia/react.i18n';
import { AppContext } from '../context';
import { socket } from '../utils/socket';
import ProgressBar from './ProgressBar';
import { processVideo } from '../utils/video';
import ENV_SETTINGS from '../env';

function VideoProcess(props) {
	const banana = useContext(BananaContext);
	const { phab_link } = ENV_SETTINGS();
	const { appState, updateAppState } = useContext(AppContext);

	const { manipulations, trim, settings } = props;
	const { video_url: videoUrl, file } = appState;

	const [progressInfo, setProgressInfo] = useState(null);
	const [currentTask, setCurrentTask] = useState(banana.i18n('task-processing'));

	const settingData = {
		rotateValue: manipulations.rotate_value,
		inputVideoUrl: videoUrl,
		trimMode: trim.mode,
		trims: trim.trims,
		modified: settings.reduce((acc, setting) => {
			const { type, modified } = setting;
			acc[type] = modified;
			return acc;
		}, {}),
		crop: {
			width: manipulations.crop_width,
			height: manipulations.crop_height,
			x: manipulations.crop_x,
			y: manipulations.crop_y
		}
	};

	const isSettingModified = settingType => {
		const findSetting = settings.filter(setting => setting.type === settingType);
		return findSetting[0].modified;
	};

	useEffect(() => {
		socket.on('progress:update', data => {
			setProgressInfo(data.progress_info);
			const progressData = data;
			const { stage, status } = progressData;
			if (status === 'processing') {
				let currentTaskString = banana.i18n(`task-stage-${stage.replace(' ', '_')}`);

				if (stage === 'manipulations') {
					const tasks = [];

					if (isSettingModified('rotate')) {
						tasks.push(banana.i18n('task-stage-rotating'));
					}

					if (isSettingModified('mute')) {
						tasks.push(banana.i18n('task-stage-losing_audio'));
					}

					if (isSettingModified('crop')) {
						tasks.push(banana.i18n('task-stage-cropping'));
					}

					if (isSettingModified('trim')) {
						tasks.push(banana.i18n('task-stage-trimming'));
					}

					currentTaskString += ` (${tasks.join(', ')})`;
				}

				setCurrentTask(currentTaskString);
			} else if (status === 'done') {
				updateAppState({ current_step: 3, videos: progressData.videos });
			} else if (status === 'error') {
				updateAppState({
					current_sub_step: '',
					notification: {
						type: 'error',
						messageId: 'error-process',
						footerId: 'notification-error-bug-call-to-action',
						link: phab_link
					}
				});
			}
		});

		const formData = new FormData();
		formData.append('data', JSON.stringify(settingData));
		formData.append('user', JSON.stringify(appState.user));
		formData.append('file', file);

		const process = async () => {
			await processVideo(formData, updateAppState);
		};
		process();
	}, []);

	return (
		<div id="video-settings-process">
			<ProgressBar info={progressInfo} />
			<div className="current-process-task">
				<Message id="task-current" placeholders={[currentTask]} />
			</div>
		</div>
	);
}
export default VideoProcess;
