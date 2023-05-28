import { render, cleanup } from '@testing-library/react';
import { AppContext } from '../context';
import Authentication from '../components/Authentication';
import { onLogOut, onLogin } from '../utils/auth';
import PopupTools from 'popup-tools';
import ENV_SETTINGS from '../env';

const { backend_url } = ENV_SETTINGS();

afterEach(cleanup);

test('displays the login button when user is logged out', () => {
	const user = null;
	const addItem = vi.fn();
	const { queryByTestId } = render(
		<AppContext.Provider value={{ addItem }}>
			<Authentication user={user} apiUrl={backend_url} />
		</AppContext.Provider>
	);
	expect(queryByTestId('login')).toBeInTheDocument();
});

test('displays the logout button when user is loggged in', () => {
	const user = { username: 'testUser' };
	const addItem = vi.fn();
	const { queryByTestId } = render(
		<AppContext.Provider value={{ addItem }}>
			<Authentication user={user} apiUrl={backend_url} />
		</AppContext.Provider>
	);
	expect(queryByTestId('login')).not.toBeInTheDocument();
	expect(queryByTestId('username')).toHaveTextContent(`Welcome, ${user.username}`);
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
	onLogin(backend_url, mockUpdateAppState);

	expect(mockPopup).toHaveBeenCalledWith(
		`${backend_url}/login`,
		'Wiki Connect',
		{ width: 1000, height: 600 },
		expect.any(Function)
	);

	expect(mockUpdateAppState).toHaveBeenCalledTimes(1);
	expect(mockUpdateAppState).toHaveBeenCalledWith({ user: mockData.user });
	expect(localStorage.setItem).toHaveBeenCalledTimes(1);
	expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockData.user));
	expect(localStorage.getItem('user')).toBe(JSON.stringify(mockData.user));
});

test('onLogOut updates app state and removes user from local storage', () => {
	// Mock the updateAppState function
	const mockUpdateAppState = vi.fn();

	// Set up localStorage with a user item
	const user = { username: 'testuser' };
	localStorage.setItem('user', JSON.stringify(user));

	const mockClick = vi.fn();
	vi.spyOn(document, 'querySelector').mockReturnValue({ click: mockClick });

	// Call the onLogOut function
	onLogOut(mockUpdateAppState);

	// Check that localStorage user item was removed
	expect(localStorage.getItem('user')).toBe(null);

	// Check that updateAppState was called with the expected argument
	expect(mockUpdateAppState).toHaveBeenCalledWith({
		user: null,
		notification: {
			type: 'info',
			messageId: 'Logged out successfully'
		}
	});
	expect(mockClick).toHaveBeenCalled();
});
