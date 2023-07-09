if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
	console.log('Client ID or Client SECRET not present in the .env file');
	process.exit(1);
}

const CONFIG = () => {
	switch (process.env.NODE_ENV) {
		case 'production':
			return {
				DB_CONNECTION_URL: process.env.DB_CONNECTION_URL,
				BACKEND_URL: process.env.BACKEND_URL,
				PORT: 4000,
				BASE_WIKI_URL: 'https://commons.wikimedia.org',

				// stored in .env.prod (OAuth 2.0 credentials)
				CLIENT_ID: process.env.CLIENT_ID,
				CLIENT_SECRET: process.env.CLIENT_SECRET
			};
		default:
			return {
				DB_CONNECTION_URL: process.env.DB_CONNECTION_URL,
				BACKEND_URL: process.env.BACKEND_URL,
				PORT: 4000,
				BASE_WIKI_URL: 'https://commons.wikimedia.org',

				// stored in .env.dev (OAuth 2.0 credentials)
				CLIENT_ID: process.env.CLIENT_ID,
				CLIENT_SECRET: process.env.CLIENT_SECRET
			}
		}
}

module.exports = CONFIG;
