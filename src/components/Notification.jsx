import { useContext } from 'react';
import { Toast } from 'react-bootstrap';
import { InfoCircleFill, ExclamationCircleFill, ExclamationTriangleFill, CheckCircleFill } from 'react-bootstrap-icons';
import { Message } from '@wikimedia/react.i18n';
import { AppContext } from '../context';

function Notification() {
	const { appState, updateNotification } = useContext(AppContext);
	const { notifications } = appState;

	const onToastClose = index => {
		updateNotification({ show: false }, index);
	};

	return (
		<div id="notification-wrapper">
			{notifications.map((notification, index) => (
				<Toast
					key={`notification-${index}`}
					onClose={() => onToastClose(index)}
					show={notification.show}
					data-type={notification.type}
					// eslint-disable-next-line
					{...(notification.autohide && notification.type !== 'error'
						? { delay: notification.delay, autohide: true }
						: { autohide: false })}
				>
					<div className="notification-icon">
						{notification.type === 'info' && <InfoCircleFill />}
						{notification.type === 'warning' && <ExclamationTriangleFill />}
						{notification.type === 'error' && <ExclamationCircleFill />}
						{notification.type === 'success' && <CheckCircleFill />}
					</div>
					<div className="notification-header">
						<strong className="me-auto">
							{notification.type === 'info' && <Message id="notifications-title" />}
							{notification.type === 'warning' && <Message id="notification-title-warning" />}
							{notification.type === 'error' && <Message id="notifications-title-error" />}
							{notification.type === 'success' && <Message id="notification-title-success" />}
						</strong>
						<button
							type="button"
							className="ms-2 mb-1 close"
							data-dismiss="notification-wrapper"
							aria-label="Close"
							onClick={() => onToastClose(index)}
						>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					{notification.messageId && (
						<div className="notification-body">
							{notification.text && notification.text.startsWith('https://commons.wikimedia.org/wiki/File:') ? (
								<a
									className="link"
									href={notification.text}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Message id={notification.messageId} />
								</a>
							) : (
								<Message id={notification.messageId} />
							)}
							<div className="notification-timer">
								<span />
							</div>
						</div>
					)}
					{notification.type === 'error' && (
						<div className="notification-footer">
							<Message
								id="notification-error-bug-call-to-action"
								placeholders={[
									<a
										href="https://phabricator.wikimedia.org/maniphest/task/edit/form/43/?projects=VideoCutTool"
										target="_blank"
										rel="noreferrer"
									>
										{' '}
										<Message id="notifications-error-bug-report" />
									</a>
								]}
							/>
						</div>
					)}
					<div className="notification-footer">
						{notification.type === "warning" &&
							<Message id="notification-warning-call-to-action" />
						}
						{notification.type === "success" && (
							<a
								href={notification.text}
								target="_blank"
								rel="noreferrer"
							>
								<Message id="task-uploaded-wikimedia-commons" />
							</a>
						)}
					</div>
				</Toast>
			))}
		</div>
	);
}

export default Notification;
