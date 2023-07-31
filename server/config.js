if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
	console.error('Client ID or Client SECRET not present in the .env file');
	process.exit(1);
  }
  
  const BASE_CONFIG = {
	DB_CONNECTION_URL: process.env.DB_CONNECTION_URL,
	BACKEND_URL: process.env.BACKEND_URL,
	PORT: 4000,
	BASE_WIKI_URL: 'https://commons.wikimedia.org',
	CLIENT_ID: process.env.CLIENT_ID,
	CLIENT_SECRET: process.env.CLIENT_SECRET,
  };
  
  const CONFIG = () => {
	switch (process.env.NODE_ENV) {
	  case 'production':
		return {
		  ...BASE_CONFIG,
		  ORIGIN: 'https://videocuttool.wmcloud.org',
		};
	  default:
		return {
		  ...BASE_CONFIG,
		  ORIGIN: 'http://localhost:3000',
		};
	}
  };
  
  module.exports = CONFIG;
  