const { Model, DataTypes } = require('sequelize');
const sequelize = require('../postgres.js');
const Settings = require('./Settings.js');

class Video extends Model { }

Video.init({
	id: {
		type: DataTypes.STRING,
		primaryKey: true
	},
	url: DataTypes.STRING,
	videoDownloadPath: DataTypes.STRING,
	videoPublicPaths: DataTypes.ARRAY(DataTypes.STRING),
	videoName: DataTypes.STRING,
	status: DataTypes.ENUM('downloading', 'processing', 'done', 'error'),
	stage: DataTypes.ENUM(
		'downloading',
		'manipulations',
		'trimming',
		'contacting',
		'converting',
		'done'
	),
	errorData: DataTypes.TEXT
}, { sequelize });

Video.hasOne(Settings);
Settings.belongsTo(Video);

module.exports = Video;
