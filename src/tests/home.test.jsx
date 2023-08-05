import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from '../pages/home';
import { vi } from 'vitest';
import { GlobalContext } from '../context/GlobalContext';
import { UserContext } from '../context/UserContext';
import { VideoDetailsContext } from '../context/VideoDetailsContext';
import { clearItems, getStoredItem } from '../utils/storage';
import ENV_SETTINGS from '../env';
import { Message } from '@wikimedia/react.i18n';

vi.mock('../utils/storage', () => ({
	clearItems: vi.fn(),
	getStoredItem: vi.fn()
}));

vi.mock('../utils/socket', () => {
	return {
		socket: {
			on: vi.fn(),
			emit: vi.fn(),
			disconnect: vi.fn(),
			connected: true
		}
	};
});

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		__esModule: true,
		BrowserRouter: ({ children }) => <div>{children}</div>,
		Routes: ({ children }) => <div>{children}</div>,
		Route: ({ element }) => element,
		useNavigate: vi.fn(),
	};
});


describe('Home component', () => {
	it('should toggle sidebar on click', () => {
		const mockUpdateAppState = vi.fn();
		const mockAppState = { current_step: 1, notifications: [] };
		const setCurrentUser = vi.fn();
		const currentUser = null;
		const file = null;
		const setFile = vi.fn();
		const videos = [];
		const setVideos = vi.fn();
		const videoDetails = {};
		const setVideoDetails = vi.fn();
		const videoUrl = '';
		const setVideoUrl = vi.fn();

		render(
			<GlobalContext.Provider value={{ appState: mockAppState, updateAppState: mockUpdateAppState }}>
				<UserContext.Provider value={{ currentUser, setCurrentUser }}>
					<VideoDetailsContext.Provider
						value={{
							file,
							setFile,
							videos,
							setVideos,
							videoDetails,
							setVideoDetails,
							videoUrl,
							setVideoUrl
						}}
					>
						<BrowserRouter>
							<Routes>
								<Route
									exact
									path={ENV_SETTINGS().path}
									element={<Home />}
									title={<Message id="title" />}
								/>
							</Routes>
						</BrowserRouter>
					</VideoDetailsContext.Provider>
				</UserContext.Provider>
			</GlobalContext.Provider>
		);

		const sidebarToggleButton = screen.getByTestId('sidebar-toggle-button');

		fireEvent.click(sidebarToggleButton);

		expect(document.body.getAttribute('data-sidebar')).toBe('show');
	});

	it('should render without crashing', () => {
		const appState = { current_step: 1 };
		const updateAppState = vi.fn();
		const setCurrentUser = vi.fn();
		const currentUser = null;
		const file = null;
		const setFile = vi.fn();
		const videos = [];
		const setVideos = vi.fn();
		const videoDetails = {};
		const setVideoDetails = vi.fn();
		const videoUrl = '';
		const setVideoUrl = vi.fn();
		render(
			<GlobalContext.Provider value={{ appState, updateAppState }}>
				<UserContext.Provider value={{ currentUser, setCurrentUser }}>
					<VideoDetailsContext.Provider
						value={{
							file,
							setFile,
							videos,
							setVideos,
							videoDetails,
							setVideoDetails,
							videoUrl,
							setVideoUrl
						}}
					>
						<BrowserRouter>
							<Routes>
								<Route
									exact
									path={ENV_SETTINGS().path}
									element={<Home />}
									title={<Message id="title" />}
								/>
							</Routes>
						</BrowserRouter>
					</VideoDetailsContext.Provider>
				</UserContext.Provider>
			</GlobalContext.Provider>
		);
		expect(screen.getByTestId('title')).toBeInTheDocument();
	});

	it('should clear local storage', () => {
		const mockClearItems = vi.fn();
		clearItems.mockImplementation(mockClearItems);
		getStoredItem.mockImplementation(() => null);
		const setCurrentUser = vi.fn();
		const currentUser = null;
		const file = null;
		const setFile = vi.fn();
		const videos = [];
		const setVideos = vi.fn();
		const videoDetails = {};
		const setVideoDetails = vi.fn();
		const videoUrl = '';
		const setVideoUrl = vi.fn();
		render(
			<GlobalContext.Provider value={{ appState: {}, updateAppState: vi.fn() }}>
				<UserContext.Provider value={{ currentUser, setCurrentUser }}>
					<VideoDetailsContext.Provider
						value={{
							file,
							setFile,
							videos,
							setVideos,
							videoDetails,
							setVideoDetails,
							videoUrl,
							setVideoUrl
						}}
					>
						<BrowserRouter>
							<Routes>
								<Route
									exact
									path={ENV_SETTINGS().path}
									element={<Home />}
									title={<Message id="title" />}
								/>
							</Routes>
						</BrowserRouter>
					</VideoDetailsContext.Provider>
				</UserContext.Provider>
			</GlobalContext.Provider>
		);
		expect(mockClearItems).toHaveBeenCalledWith([
			'video-manipulations',
			'video-settings',
			'video-trim-hash',
			'video-trims',
			'video-crop'
		]);
	});

	it('should not set title if query param does not exist', () => {
		const mockSetTitle = vi.fn();
		getStoredItem.mockReturnValue(null);
		const mockLocation = { href: 'http://example.com' };
		const originalWindow = global.window;
		window.location = mockLocation;
		const setCurrentUser = vi.fn();
		const currentUser = null;
		const file = null;
		const setFile = vi.fn();
		const videos = [];
		const setVideos = vi.fn();
		const videoDetails = {};
		const setVideoDetails = vi.fn();
		const videoUrl = '';
		const setVideoUrl = vi.fn();
		vi.spyOn(React, 'useState').mockReturnValueOnce(['', mockSetTitle]);
		render(
			<GlobalContext.Provider value={{ appState: {}, updateAppState: vi.fn() }}>
				<UserContext.Provider value={{ currentUser, setCurrentUser }}>
					<VideoDetailsContext.Provider
						value={{
							file,
							setFile,
							videos,
							setVideos,
							videoDetails,
							setVideoDetails,
							videoUrl,
							setVideoUrl
						}}
					>
						<BrowserRouter>
							<Routes>
								<Route
									exact
									path={ENV_SETTINGS().path}
									element={<Home />}
									title={<Message id="title" />}
								/>
							</Routes>
						</BrowserRouter>
					</VideoDetailsContext.Provider>
				</UserContext.Provider>
			</GlobalContext.Provider>
		);
		expect(mockSetTitle).not.toHaveBeenCalled();
		window = originalWindow;
	});
});
