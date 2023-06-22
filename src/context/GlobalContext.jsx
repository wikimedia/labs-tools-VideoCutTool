import { createContext, useState, useMemo } from 'react';
import { IntlProvider } from '@wikimedia/react.i18n';
import { getLanguagesFromDir } from '../utils/languages';

const GlobalContext = createContext('');

const GlobalContextProvider = function GlobalContextProvider(props) {
	const { children } = props;
	const defaultLocaleObj = {
		locale: 'en-US',
		name: 'English',
		native_name: 'English'
	};

	const initialAppState = {
		themeMode: localStorage.getItem('theme') || 'light',
		socket: null,
		socketId: null,
		current_locale: JSON.parse(localStorage.getItem('localeObj')) || defaultLocaleObj,
		notifications: []
	};
	const [appState, setAppState] = useState(initialAppState);

	const updateAppState = newState => {
		let { notifications } = appState;

		// If notification object exist add to notifications array
		if ('notification' in newState) {
			// Add extra properties to notification object to control it
			const updateNotificationState = {
				...newState.notification,
				show: true,
				autohide: 'autohide' in newState.notification ? newState.notification.autohide : true,
				delay: 'delay' in newState.notification ? newState.notification.delay : 10000
			};

			// Create new notifications array
			notifications = [...appState.notifications, updateNotificationState];

			delete newState.notification;
		}
		return setAppState({ ...appState, ...newState, notifications });
	};

	const updateNotification = (newNotificationState, index) => {
		const notifications = [...appState.notifications];
		notifications[index] = { ...notifications[index], ...newNotificationState };

		return setAppState({
			...appState,
			notifications
		});
	};

	const contextValue = useMemo(
		() => ({
			appState,
			updateAppState,
			updateNotification
		}),
		[appState, updateAppState, updateNotification]
	);

	return (
		<GlobalContext.Provider value={contextValue}>
			<IntlProvider locale={appState.current_locale.locale} messages={getLanguagesFromDir()}>
				{children}
			</IntlProvider>
		</GlobalContext.Provider>
	);
};
export { GlobalContext, GlobalContextProvider };
