import PopupTools from 'popup-tools';
import { socket } from '../utils/socket';

const onLogin = (apiUrl, updateAppState) => {
	PopupTools.popup(`${apiUrl}/login`, 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
		if (!err) {
			updateAppState({ user: data.user });
			localStorage.setItem('user', JSON.stringify(data.user));
			socket.emit('authenticate', data.user);
		}
	});
};

const onLogOut = updateAppState => {
	localStorage.removeItem('user');
	updateAppState({
		user: null,
		notification: {
			type: 'info',
			messageId: 'Logged out successfully'
		}
	});

	document.querySelector('#logout-button').click();
};
export { onLogin, onLogOut };
