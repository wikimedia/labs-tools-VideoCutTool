import { io } from 'socket.io-client';

import ENV_SETTINGS from '../env';
const { backend_url } = ENV_SETTINGS();

export const API_URL = backend_url;
export const socket = io('');
