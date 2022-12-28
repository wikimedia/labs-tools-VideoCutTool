import mongoose from 'mongoose';

const { Schema } = mongoose;

const trimSchema = new Schema({
	from: Number,
	to: Number
});

const cropSchema = new Schema({
	width: Number,
	height: Number,
	x: Number,
	y: Number
});

const modifiedSchema = new Schema({
	mute: Boolean,
	rotate: Boolean,
	trim: Boolean,
	crop: Boolean
});

const SettingsSchema = new Schema({
	rotateValue: Number,
	trimMode: { type: String, enum: ['single', 'multiple'] },
	trims: [trimSchema],
	modified: modifiedSchema,
	crop: cropSchema
});

const VideoSchema = new Schema({
	url: String,
	videoDownloadPath: String,
	videoPublicPaths: [String],
	uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
	videoName: String,
	status: { type: String, enum: ['downloading', 'processing', 'done', 'error'] },
	stage: {
		type: String,
		enum: [
			'downloading',
			'manipulations',
			'trimming',
			'contacting',
			'converting',
			'done'
		]
	},
	errorData: String,
	settings: SettingsSchema,
	updated_at: { type: Number, default: Date.now },
	created_at: { type: Number, default: Date.now }
});

VideoSchema.pre('save', function (next) {
	const now = Date.now();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

VideoSchema.statics.isObjectId = id => mongoose.Types.ObjectId.isValid(id);

VideoSchema.statics.getObjectId = id => mongoose.Types.ObjectId(id);

const VideoModel = mongoose.model('Video', VideoSchema);
export default VideoModel;
