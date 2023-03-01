import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Notification from '../components/Notification';
import { AppContext } from '../context';
import '@testing-library/jest-dom';

describe('Notification component', () => {

  it('Notification components fallback to messageId in case of undefined notification text', () => {
    const mockUpdateNotification = jest.fn();
    const mockNotification=[{messageId:'testId',type:'info',autohide:true}]
    const mockAppState = { notifications: mockNotification };
    render(
      <AppContext.Provider value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}>
        <Notification/>
      </AppContext.Provider>
    )
    expect(screen.getByText('notifications-title')).toBeInTheDocument()
    expect(screen.getByText('testId')).toBeInTheDocument()
    const closeBtn = screen.getByRole('button','Close')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)
    expect(mockUpdateNotification).toHaveBeenCalledWith({show:false},0)
  })
  it('Notification component silently rejects for undefined messageId',()=>{
    const mockUpdateNotification = jest.fn();
    const mockNotification=[
      {text:'testText',type:'info',autohide:true}
    ]
    const mockAppState = { notifications: mockNotification };
    render(
      <AppContext.Provider value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}>
        <Notification/>
      </AppContext.Provider>
    )
    expect(screen.getByText('notifications-title')).toBeInTheDocument()
  })
  it('Testing the commons link is displayed if present in notification.text',()=>{
    const mockUpdateNotification = jest.fn();
    const mockText='https://commons.wikimedia.org/wiki/File:'
    const mockNotification=[
      {messageId:'testId1',text:mockText,type:'info',autohide:true},
      {messageId:'testId2',text:mockText+'mockfilename',type:'info',autohide:true}
    ]
    const mockAppState = { notifications: mockNotification }
    render(
      <AppContext.Provider value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}>
        <Notification/>
      </AppContext.Provider>
    )
    expect(screen.getAllByText('notifications-title')).toHaveLength(2)
    expect(screen.getByText('testId1')).toHaveAttribute('href',mockText)
    expect(screen.getByText('testId2')).toHaveAttribute('href',mockText+'mockfilename')
  })
  it('Testing the notification footer if notification type is not info',()=>{
    const mockUpdateNotification = jest.fn();
    const mockText='https://commons.wikimedia.org/wiki/File:'
    const mockNotification=[{messageId:'testId',text:mockText,type:'error',autohide:true}]
    const mockAppState = { notifications: mockNotification }
    render(
      <AppContext.Provider value={{ appState: mockAppState, updateNotification: mockUpdateNotification }}>
        <Notification/>
      </AppContext.Provider>
    )
    expect(screen.getByText('notifications-title-error')).toBeInTheDocument()
    expect(screen.getByText('testId')).toBeInTheDocument()
    expect(screen.getByText('testId')).toHaveAttribute('href',mockText)
    expect(screen.getByText('notification-error-bug-call-to-action')).toBeInTheDocument()
  })
});