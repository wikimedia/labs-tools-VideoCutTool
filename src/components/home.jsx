import { useContext, useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';
import { Message } from '@wikimedia/react.i18n';

import UrlBox from './UrlBox';
import Results from './Results';
import Header from './Header';
import VideoSettings from './VideoSettings';
import { AppContext } from '../context';
import { socket } from '../utils/socket';
import Notification from './Notification';
import { clearItems, getStoredItem, storeItem } from '../utils/storage';
import ENV_SETTINGS from '../env';

import logo from '../logo.svg';
import '../style/main.scss';
import '../style/dark-theme.scss';

const { backend_url: backendUrl, phab_link, base_wiki_url } = ENV_SETTINGS();
const currentUser = getStoredItem('user');

socket.on('connect', () => {
	if (currentUser) {
		socket.emit('join', currentUser);
	}
	console.log('check 2', socket.connected);
});

socket.on('connect_error', err => {
	console.log(`connect_error due to ${err.message}`);
});

function Home() {
	const { appState, updateAppState } = useContext(AppContext);
	const { current_step: currentStep, notifications } = appState || {};
	const [showHeader, setShowHeader] = useState(false);
	const [title, setTitle] = useState('');
	const [currentUser, setCurrentUser] = useState(getStoredItem('user') || null);

	socket.on('update', data => {
		const { socketId, ...rest } = data;
		storeItem('user', rest);
		setCurrentUser(rest);
		updateAppState({ socketId });
		const location = window.location.href;
		if (location.indexOf('?') !== -1) {
			setTitle(`${base_wiki_url}/wiki/File:${location.split('?')[1].split('=')[1]}`);
		} else {
			setTitle('');
		}
	});

	useEffect(() => {
		// Clear localstorage
		clearItems([
			'video-manipulations',
			'video-settings',
			'video-trim-hash',
			'video-trims',
			'video-crop'
		]);

		// Update socket reference
		updateAppState({ socket });

		if (currentUser) {
			updateAppState({ user: currentUser });
		} else {
			updateAppState({ user: null });
		}
	}, [currentUser]);

	const toggleHeader = () => {
		const status = !showHeader;
		document.body.setAttribute('data-sidebar', status ? 'show' : 'hide');
		setShowHeader(status);
	};

	return (
		<div id="main-container">
			<Header apiUrl={backendUrl} />
			<div id="content" className="flex-column">
				<div className="logo-wrapper flex-sm-row">
					<span className="menu-icon" data-testid="sidebar-toggle-button" onClick={toggleHeader}>
						<List size="25" />
					</span>
					<Image alt="logo" src={logo} width="100" height="40" />
					<h1 className="text-white">VideoCutTool</h1>
				</div>
				{currentStep === 1 && <UrlBox title={title} />}
				{currentStep === 2 && <VideoSettings user={appState.user} />}
				{currentStep === 3 && <Results />}
				<div className="footer-wrapper">
					<div className="footer">
						© 2019-
						{new Date().getFullYear()}{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://www.mediawiki.org/wiki/User:Gopavasanth"
						>
							<span>Gopa Vasanth</span>
						</a>
						,{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://www.mediawiki.org/wiki/User:Sohom_Datta"
						>
							<span>Sohom Datta</span>
						</a>{' '}
						|{' '}
						<a target="_blank" rel="noreferrer" href={`${phab_link}`}>
							<span>
								<Message id="report-issues" />
							</span>
						</a>{' '}
						|{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://gerrit.wikimedia.org/r/admin/repos/labs/tools/VideoCutTool"
						>
							<span>
								<Message id="repository" />
							</span>
						</a>
					</div>
				</div>
			</div>

			{notifications && notifications.length > 0 && <Notification />}
		</div>
	);
}

export default Home;
