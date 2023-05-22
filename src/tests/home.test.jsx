import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Home from '../components/home';
import { vi } from 'vitest';
import { AppContext } from '../context';
import { clearItems, getStoredItem } from '../utils/storage';

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

describe('Home component', () => {
	it('should toggle sidebar on click', () => {
		const mockUpdateAppState = vi.fn();
		const mockAppState = { current_step: 1, notifications: [] };

		render(
			<AppContext.Provider value={{ appState: mockAppState, updateAppState: mockUpdateAppState }}>
				<Home />
			</AppContext.Provider>
		);

		const sidebarToggleButton = screen.getByTestId('sidebar-toggle-button');

		fireEvent.click(sidebarToggleButton);

		expect(document.body.getAttribute('data-sidebar')).toBe('show');
	});

	it('should render without crashing', () => {
		const appState = { current_step: 1 };
		const updateAppState = vi.fn();
		render(
			<AppContext.Provider value={{ appState, updateAppState }}>
				<Home />
			</AppContext.Provider>
		);
		expect(screen.getAllByText('VideoCutTool')).toBeTruthy();
	});

	it('should clear local storage', () => {
		const mockClearItems = vi.fn();
		clearItems.mockImplementation(mockClearItems);
		getStoredItem.mockImplementation(() => null);
		render(
			<AppContext.Provider value={{ appState: {}, updateAppState: vi.fn() }}>
				<Home />
			</AppContext.Provider>
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
		vi.spyOn(React, 'useState').mockReturnValueOnce(['', mockSetTitle]);
		render(
			<AppContext.Provider value={{ appState: {}, updateAppState: vi.fn() }}>
				<Home />
			</AppContext.Provider>
		);
		expect(mockSetTitle).not.toHaveBeenCalled();
		window = originalWindow;
	});
});
