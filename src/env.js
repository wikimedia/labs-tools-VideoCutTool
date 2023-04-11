const ENV_SETTINGS = () => {
	switch (process.env.NODE_ENV) {
		case 'production':
			return {
				path: '/',
				home_page: 'https://videocuttool.wmcloud.org',
				not_found_path: '/*',
				backend_url: 'https://videocuttool.wmcloud.org/api',
				socket_io_path: '/socket.io',
				socket_io_url: 'https://videocuttool.wmcloud.org:4000'
			};

		default:
			return {
				path: '/',
				home_page: '/',
				not_found_path: '/*',
				backend_url: '/api',
				socket_io_path: '/socket.io',
				socket_io_url: 'http://localhost:8000'
			};
	}
};
export default ENV_SETTINGS;
