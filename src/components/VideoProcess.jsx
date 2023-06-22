import { useState, useContext, useEffect } from 'react';
import { Message, BananaContext } from '@wikimedia/react.i18n';
import { GlobalContext } from '../context/GlobalContext';
import { VideoDetailsContext } from '../context/VideoDetailsContext';
import { socket } from '../utils/socket';
import ProgressBar from './ProgressBar';
import ENV_SETTINGS from '../env';

function VideoProcess(props) {
	const { phab_link } = ENV_SETTINGS();
	const banana = useContext(BananaContext);
	const { updateAppState } = useContext(GlobalContext);
	const { setVideos, setProcessTime, setCurrentSubStep,setCurrentStep} = useContext(VideoDetailsContext);

	const { settings } = props;

	const [progressInfo, setProgressInfo] = useState(null);
	const [currentTask, setCurrentTask] = useState(banana.i18n('task-processing'));

	
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
					if (isSettingModified('volume')) {
						tasks.push(banana.i18n('task-stage-volume'));
					}
					currentTaskString += ` (${tasks.join(', ')})`;
				}

				setCurrentTask(currentTaskString);
			} else if (status === 'done') {
				setCurrentStep(3)
				setVideos(progressData.videos);
				setProcessTime(progressData.timeTaken);
			} else if (status === 'error') {
				setCurrentSubStep('')
				updateAppState({
					notification: {
						type: 'error',
						messageId: 'error-process',
						footerId: 'notification-error-bug-call-to-action',
						link: phab_link
					}
				});
			}
		});
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
