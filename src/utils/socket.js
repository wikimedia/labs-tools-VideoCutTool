import { io } from 'socket.io-client';

import ENV_SETTINGS from '../env';
const { backend_url, socket_io_url, socket_io_path } = ENV_SETTINGS();

export const API_URL = backend_url;
export const socket = io('');
