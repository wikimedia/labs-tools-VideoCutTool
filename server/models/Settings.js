const { Model, DataTypes } = require('sequelize');
const sequelize = require('../postgres.js');

class Settings extends Model {}

Settings.init(
	{
		rotateValue: DataTypes.INTEGER,
		trimMode: DataTypes.ENUM('single', 'multiple'),
		trims: DataTypes.ARRAY(DataTypes.JSONB),
		modified: DataTypes.JSONB,
		crop: DataTypes.JSONB,
		volume: DataTypes.INTEGER
	},
	{ sequelize }
);

module.exports = Settings;
