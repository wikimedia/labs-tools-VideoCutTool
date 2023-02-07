import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../components/home';
import { AppContext } from '../context';
import { clearItems, getStoredItem } from '../utils/storage';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';


jest.mock('../utils/storage', () => ({
  clearItems: jest.fn(),
  getStoredItem: jest.fn()
}));

jest.mock('../utils/socket', () => {
  return {
    socket: {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
    },
  };
});


describe('Home component', () => {

  it('should toggle sidebar on click', () => {
    const mockUpdateAppState = jest.fn();
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
    const updateAppState = jest.fn();
    render(
      <AppContext.Provider value={{ appState, updateAppState }}>
        <Home />
      </AppContext.Provider>
    );
    expect(screen.getAllByText('VideoCutTool')).toBeTruthy();
  });


  it('should clear local storage', () => {
    const mockClearItems = jest.fn();
    clearItems.mockImplementation(mockClearItems);
    getStoredItem.mockImplementation(() => null);
    render(
      <AppContext.Provider value={{ appState: {}, updateAppState: jest.fn() }}>
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
    const mockSetTitle = jest.fn();
    getStoredItem.mockReturnValue(null);
    const mockLocation = { href: 'http://example.com' };
    const originalWindow = { ...window };
    window.location = mockLocation;
    jest.spyOn(React, 'useState').mockReturnValueOnce(['', mockSetTitle]);
    render(
      <AppContext.Provider value={{ appState: {}, updateAppState: jest.fn() }}>
        <Home />
      </AppContext.Provider>
    );
    expect(mockSetTitle).not.toHaveBeenCalled();
    window = originalWindow;
  });
});