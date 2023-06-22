import PopupTools from 'popup-tools';

const onLogin = (apiUrl, setCurrentUser,updateAppState) => {
	PopupTools.popup(`${apiUrl}/login`, 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
		if (!err) {
			updateAppState({
				notification: {
					type: 'info',
					messageId: 'welcome',
					text: data.user.username
				}
			});
			setCurrentUser(data.user);
			localStorage.setItem('user', JSON.stringify(data.user));
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

const onLogOut = (updateAppState, setCurrentUser) => {
	localStorage.removeItem('user');
	setCurrentUser(null);
	updateAppState({
		notification: {
			type: 'info',
			messageId: 'logout-message'
		}
	});

	document.querySelector('#logout-button').click();
};
export { onLogin, onLogOut };
