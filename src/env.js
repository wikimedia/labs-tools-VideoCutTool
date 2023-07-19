const ENV_SETTINGS = () => {
	switch (process.env.NODE_ENV) {
		case 'production':
			return {
				path: '/',
				home_page: 'https://videocuttool.wmcloud.org',
				not_found_path: '/*',
				backend_url: 'https://videocuttool.wmcloud.org/api',
				socket_io_path: '/socket.io',
				socket_io_url: 'https://videocuttool.wmcloud.org:4000',
				base_wiki_url: 'https://commons.wikimedia.org',
				phab_link:
					'https://phabricator.wikimedia.org/maniphest/task/edit/form/43/?projects=VideoCutTool'
			};

		default:
			return {
				path: '/',
				home_page: '/',
				not_found_path: '/*',
				backend_url: '/api',
				socket_io_path: '/socket.io',
				socket_io_url: 'http://localhost:8000',
				base_wiki_url: 'https://commons.wikimedia.org',
				phab_link:
					'https://phabricator.wikimedia.org/maniphest/task/edit/form/43/?projects=VideoCutTool'
			};
	}
};
export default ENV_SETTINGS;
