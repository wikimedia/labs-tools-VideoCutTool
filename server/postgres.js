const { Sequelize } = require('sequelize');
const config = require('./config.js');

const sequelize = new Sequelize(
	config().DB_CONNECTION_URL,
	{
		dialect: 'postgres',
		dialectOptions: {
			connectTimeout: 10 * 60 * 1000 // Wait 10 minutes before timing out
		}
	}
);
module.exports = sequelize;
