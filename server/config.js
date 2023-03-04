let config;

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
	console.log('Client ID or Client SECRET not present in the .env file');
	process.exit(1);
}
switch (process.env.NODE_ENV) {
	case 'production':
		config = {
			DB_CONNECTION_URL: process.env.DB_CONNECTION_URL,
			BACKEND_URL: process.env.BACKEND_URL,
			PORT: 4000,

			// stored in .env.prod (OAuth 2.0 credentials)
			CLIENT_ID: process.env.CLIENT_ID,
			CLIENT_SECRET: process.env.CLIENT_SECRET
		};
		break;
	default:
		config = {
			DB_CONNECTION_URL: process.env.DB_CONNECTION_URL,
			BACKEND_URL: process.env.BACKEND_URL,
			PORT: 4000,

			// stored in .env.dev (OAuth 2.0 credentials)
			CLIENT_ID: process.env.CLIENT_ID,
			CLIENT_SECRET: process.env.CLIENT_SECRET
		};
}

export default config;
