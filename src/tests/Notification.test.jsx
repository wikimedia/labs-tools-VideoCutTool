import { render, screen, fireEvent } from '@testing-library/react';
import Notification from '../components/Notification';
import { AppContext } from '../context';
import { vi } from 'vitest';

describe('Notification component', () => {
	it('Notification components fallback to messageId in case of undefined notification text', () => {
		const mockUpdateNotification = vi.fn();
		const mockNotification = [{ messageId: 'testId', type: 'info', autohide: true }];
		const mockAppState = { notifications: mockNotification };
		render(
			<AppContext.Provider
				value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}
			>
				<Notification />
			</AppContext.Provider>
		);
		expect(screen.getByText('notifications-title-info')).toBeInTheDocument();
		expect(screen.getByText('testId')).toBeInTheDocument();
		const closeBtn = screen.getByRole('button', 'Close');
		expect(closeBtn).toBeInTheDocument();
		fireEvent.click(closeBtn);
		expect(mockUpdateNotification).toHaveBeenCalledWith({ show: false }, 0);
	});
	it('Notification component silently rejects for undefined messageId', () => {
		const mockUpdateNotification = vi.fn();
		const mockNotification = [{ text: 'testText', type: 'info', autohide: true }];
		const mockAppState = { notifications: mockNotification };
		render(
			<AppContext.Provider
				value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}
			>
				<Notification />
			</AppContext.Provider>
		);
		expect(screen.getByText('notifications-title-info')).toBeInTheDocument();
	});
	it('Testing the commons link is displayed if present in notification.link', () => {
		const mockUpdateNotification = vi.fn();
		const mockLink = 'https://commons.wikimedia.org/wiki/File:';
		const mockNotification = [
			{
				footerId: 'testId1 $1',
				link: mockLink,
				linkTitle: 'Wikimedia Commons',
				type: 'info',
				autohide: true
			},
			{
				footerId: 'testId2 $1',
				link: mockLink + 'mockfilename',
				linkTitle: 'Wikimedia Commons',
				type: 'info',
				autohide: true
			}
		];
		const mockAppState = { notifications: mockNotification };
		render(
			<AppContext.Provider
				value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}
			>
				<Notification />
			</AppContext.Provider>
		);
		expect(screen.getAllByText('notifications-title-info')).toHaveLength(2);
		expect(screen.getByText('testId1').querySelector('a')).toHaveAttribute('href', mockLink);
		expect(screen.getByText('testId2').querySelector('a')).toHaveAttribute(
			'href',
			mockLink + 'mockfilename'
		);
	});
	it('Testing the notification footer if notification type is not info', () => {
		const mockUpdateNotification = vi.fn();
		const mockLink =
			'https://phabricator.wikimedia.org/maniphest/task/edit/form/43/?projects=VideoCutTool';
		const mockNotification = [
			{
				messageId: 'testId',
				link: mockLink,
				linkTitle: 'Phabricator',
				footerId: 'testId1 $1',
				type: 'error',
				autohide: true
			}
		];
		const mockAppState = { notifications: mockNotification };
		render(
			<AppContext.Provider
				value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}
			>
				<Notification />
			</AppContext.Provider>
		);
		expect(screen.getByText('notifications-title-error')).toBeInTheDocument();
		expect(screen.getByText('testId')).toBeInTheDocument();
		expect(screen.getByText('testId1')).toBeInTheDocument();
		expect(screen.getByText('testId1').querySelector('a')).toHaveAttribute('href', mockLink);
	});
});
