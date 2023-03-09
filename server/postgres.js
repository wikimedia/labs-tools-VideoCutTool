const { Sequelize } = require('sequelize');
const config = require('./config.js');

const sequelize = new Sequelize(config.DB_CONNECTION_URL, { dialect: 'postgres' });
module.exports = sequelize;
