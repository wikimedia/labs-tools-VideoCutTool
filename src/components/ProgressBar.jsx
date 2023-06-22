import { Spinner, ProgressBar } from 'react-bootstrap';
import { Message } from '@wikimedia/react.i18n';
import '../style/progress-bar.scss';

function Progress(props) {
	const { info } = props;

	return (
		<>
			{typeof info === 'undefined' || info === null ? (
				<Spinner animation="border" />
			) : (
				<div id="progress-bar-wrapper">
					<div id="progress-bar-wrapper">
						<div className="progress-bar-info">
							<div className="progress-info-container">
								<span className="progress-info-title">
									<Message id="progress-bitrate" />
								</span>
								<span className="progress-info-value">{info?.bitrate}</span>
							</div>
							<div className="progress-info-container">
								<span className="progress-info-title">
									<Message id="progress-time" />
								</span>
								<span className="progress-info-value">{info?.time}</span>
							</div>
							<div className="progress-info-container">
								<span className="progress-info-title">
									<Message id="progress-speed" />
								</span>
								<span className="progress-info-value">{info?.speed}</span>
							</div>
							<div className="progress-info-container">
								<span className="progress-info-title">
									<Message id="progress-frame" />
								</span>
								<span className="progress-info-value">{info?.frame}</span>
							</div>
						</div>
					</div>
					{!info?.progress && <div className="progress-bar-indeterminate" />}
					{info?.progress && <ProgressBar animated now={info?.progress} />}
				</div>
			)}
		</>
	);
}
export default Progress;
