import React, { useContext } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { Message } from '@wikimedia/react.i18n';
import { AppContext } from '../context';
import { onLogin, onLogOut } from '../utils/auth';

function Authentication(props) {
	const { updateAppState } = useContext(AppContext);
	const { user, apiUrl } = props;

	// Login redirect URL to the back-end server
	const handleLogin = () => {
		onLogin(apiUrl, updateAppState);
	};

	const handleLogOut = () => {
		onLogOut(updateAppState);
	};

	const popover = (
		<Popover id="popover-basic">
			<Popover.Header as="h3">
				<Message id="logout-confirm-text" />
			</Popover.Header>
			<Popover.Body>
				<Button variant="primary" size="sm" onClick={handleLogOut}>
					<Message id="logout-confirm-yes" />
				</Button>
				<Button
					variant="light"
					size="sm"
					onClick={() => document.querySelector('#logout-button').click()}
				>
					<Message id="logout-confirm-no" />
				</Button>
			</Popover.Body>
		</Popover>
	);
	return (
		<div>
			{!user && (
				<div className="functionality-btn">
					<Button variant="secondary" onClick={handleLogin} data-testid="login">
						Login
					</Button>
				</div>
			)}

			{user && (
				<div className="functionality-btn">
					<span style={{ color: 'white' }} data-testid="username">
						Welcome,{' '}
						<a
							className="text-white font-weight-bold"
							href={`https://commons.wikimedia.org/wiki/user:${user.username}`}
						>
							{user.username}
						</a>
					</span>
					<span className="logout-btn">
						<OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popover}>
							<Button variant="success" id="logout-button" size="sm">
								<Message id="logout" />
							</Button>
						</OverlayTrigger>
					</span>
				</div>
			)}
		</div>
	);
}

export default Authentication;
