import { render, cleanup } from '@testing-library/react';
import { UserContext } from '../context/UserContext';
import Authentication from '../components/Authentication';
import { onLogOut, onLogin } from '../utils/auth';
import { Message } from '@wikimedia/react.i18n';

import PopupTools from 'popup-tools';
import ENV_SETTINGS from '../env';

const { backend_url } = ENV_SETTINGS();

afterEach(cleanup);

test('displays the login button when user is logged out', () => {
	const currentUser = null;
	const setCurrentUser = vi.fn();
	const { queryByTestId } = render(
		<UserContext.Provider value={{ currentUser, setCurrentUser }}>
			<Authentication user={currentUser} apiUrl={backend_url} />
		</UserContext.Provider>
	);
	expect(queryByTestId('login')).toBeInTheDocument();
});

test('displays the logout button when user is loggged in', () => {
	const currentUser = { username: 'testUser' };
	const setCurrentUser = vi.fn();
	const { queryByTestId } = render(
		<UserContext.Provider value={{ currentUser, setCurrentUser }}>
			<Authentication apiUrl={backend_url} />
		</UserContext.Provider>
	);
	expect(queryByTestId('login')).not.toBeInTheDocument();
});

test('to test when onLogin function is called the username is stored in localStorage', async () => {
	vi.spyOn(window.localStorage.__proto__, 'setItem');

	const mockData = { user: { name: 'John', email: 'john@example.com' } };
	const mockPopup = vi.fn((url, title, options, callback) => {
		// Simulate a successful login by calling the callback function with mock data
		callback(null, mockData);
	});
	PopupTools.popup = mockPopup;
	const mockUpdateAppState = vi.fn();
	const setCurrentUser = vi.fn();
	onLogin(backend_url, setCurrentUser, mockUpdateAppState);

	expect(mockPopup).toHaveBeenCalledWith(
		`${backend_url}/login`,
		'Wiki Connect',
		{ width: 1000, height: 600 },
		expect.any(Function)
	);

	expect(mockUpdateAppState).toHaveBeenCalledTimes(1);
	expect(mockUpdateAppState).toHaveBeenCalledWith({
		notification: {
			type: 'info',
			messageId: 'welcome',
			text: mockData.user.username
		}
	});
	expect(setCurrentUser).toHaveBeenCalledTimes(1);
	expect(setCurrentUser).toHaveBeenCalledWith(mockData.user);
	expect(localStorage.setItem).toHaveBeenCalledTimes(1);
	expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockData.user));
	expect(localStorage.getItem('user')).toBe(JSON.stringify(mockData.user));
});

test('onLogOut updates app state and removes user from local storage', () => {
	// Mock the updateAppState and setCurrentUser functions
	const mockUpdateAppState = vi.fn();
	const setCurrentUser = vi.fn();

	// Set up localStorage with a user item
	const user = { username: 'testuser' };
	localStorage.setItem('user', JSON.stringify(user));

	const mockClick = vi.fn();
	vi.spyOn(document, 'querySelector').mockReturnValue({ click: mockClick });

	// Call the onLogOut function
	onLogOut(mockUpdateAppState, setCurrentUser);

	// Check that localStorage user item was removed
	expect(localStorage.getItem('user')).toBe(null);

	// Check that updateAppState was called with the expected argument
	expect(mockUpdateAppState).toHaveBeenCalledWith({
		notification: {
			type: 'info',
			messageId: 'logout-message'
		}
	});

	// Check that setCurrentUser was called with null
	expect(setCurrentUser).toHaveBeenCalledWith(null);

	// Check that document.querySelector('#logout-button').click() was called
	expect(mockClick).toHaveBeenCalled();
});
