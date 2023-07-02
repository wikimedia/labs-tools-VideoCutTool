import PopupTools from 'popup-tools';
import { socket } from '../utils/socket';

const onLogin = (apiUrl, updateAppState) => {
	PopupTools.popup(`${apiUrl}/login`, 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
		if (!err) {
			updateAppState({
				user: data.user,
				notification: {
					type: 'info',
					messageId: 'welcome',
					text: data.user.username
				}
			});
			localStorage.setItem('user', JSON.stringify(data.user));
			socket.emit('authenticate', data.user);
		} else {
			updateAppState({
				notification: {
					type: 'error',
					messageId: 'login-error'
				}
			});
		}
	});
};

const onLogOut = updateAppState => {
	localStorage.removeItem('user');
	updateAppState({
		user: null,
		notification: {
			type: 'info',
			messageId: 'logout-message'
		}
	});

	document.querySelector('#logout-button').click();
};
export { onLogin, onLogOut };
