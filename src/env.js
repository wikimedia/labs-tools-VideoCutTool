const ENV_SETTINGS = () => {
	return {
		path: '/',
		home_page: '/',
		not_found_path: '/*',
		backend_url: '/api',
		socket_io_path: '/socket.io',
		base_wiki_url: 'https://commons.wikimedia.org',
		phab_link:
			'https://phabricator.wikimedia.org/maniphest/task/edit/form/43/?projects=VideoCutTool',
		file_url:'https://commons.wikimedia.org/wiki/File:'
	};
};
export default ENV_SETTINGS;
