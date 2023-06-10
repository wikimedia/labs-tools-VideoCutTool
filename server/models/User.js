const { Model, DataTypes } = require('sequelize');
const sequelize = require('../postgres.js');
const Video = require('./Video.js');

class User extends Model {}

User.init(
	{
		username: DataTypes.STRING,
		mediawikiId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		refreshToken: DataTypes.TEXT,
		mediawikiToken: DataTypes.STRING,
		mediawikiTokenSecret: DataTypes.STRING
	},
	{ sequelize }
);

User.hasMany(Video);
Video.belongsTo(User);

module.exports = User;
