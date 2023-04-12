const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const PopupTools = require('popup-tools');

const { randomUUID } = require('crypto');
const { processVideo, uploadVideos, downloadVideo } = require('./controllers/router-controller.js');
const config = require('./config.js');
const User = require('./models/User.js');
const auth = require('./auth.js');
const Video = require('./models/Video.js');
const Settings = require('./models/Settings.js');

const app = express();

const MemoryStore = require('memorystore')(session)

app.use('/api/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: 'tmp/', // so that they're publicly accessible
		limits: { fileSize: 500 * 1024 * 1024 },
		abortOnLimit: true
	})
);

app.use(logger('dev'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Use CORS and File Upload modules here
app.use(cors());
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const sessionSecret = process.env.SESSION_SECRET || randomUUID();
app.use(
   session({
     cookie: {
       maxAge: ONE_YEAR_MS,
     },
     store: new MemoryStore({
       checkPeriod: ONE_YEAR_MS,
     }),
     saveUninitialized: true,
     secret: sessionSecret,
   })
);

/* GET home page. */
app.get('/', (req, res) => {
	res.json({ data: 'Homepage' });
});

app.get('/api/', (req, res) => {
	res.json({ data: 'Back-end is up' });
});

app.get('/user/:mediawiki_user_id', async (req, res) => {
	const userId = req.params.mediawiki_user_id;
	const user = await User.findOne({ where: { mediawikiId: userId }, include: Video });
	res.send({
		username: user.username,
		mediawiki_id: userId,
		videos: user.Videos
	});
});

app.get('/video/:videoId', async (req, res) => {
	const { videoId } = req.params;
	const videoData = await Video.findOne({ where: { id: videoId }, include: Settings });
	res.send(videoData);
});

app.get('/error', (req, res) => {
	res.render('error', { error_message: req.session.error_message });
});

app.get('/test-auth', (req, res) => {
	res.sendFile(path.join(`${__dirname}/test-auth.html`));
});

app.get('/login', (req, res) => {
	const baseUrl = 'https://commons.wikimedia.org';
	const endpoint = '/w/rest.php/oauth2/authorize';

	const url = new URL(baseUrl + endpoint);
	url.searchParams.append('response_type', 'code');
	url.searchParams.append('client_id', config.CLIENT_ID);

	res.send(res.redirect(url));
});

app.get('/auth/mediawiki/callback', auth, async (req, res) => {
	const {
		refresh_token: refreshToken,
		profile: { sub, username }
	} = res.locals;

	const userRow = {
		mediawikiId: sub,
		username,
		refreshToken
	};
	try {
		await User.upsert(userRow);
		const user = await User.findOne({ where: { mediawikiId: sub } });
		const { mediawikiId, socketId } = user;
		const returnUserData = {
			mediawikiId,
			username,
			socketId
		};
		res.end(PopupTools.popupResponse({ user: returnUserData }));
	} catch (err) {
		console.log('************');
		console.log(err);
		const error = err.toJSON();
		req.session.error_message = error.message;
		res.redirect('/error');
	}
});

app.get('/logout', (req, res) => {
	delete req.session.user;
	res.redirect('/');
});

app.post('/process', processVideo);
app.post('/upload', uploadVideos);
app.get('/download/:videopath', downloadVideo);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error(`Not Found${req.originalUrl}`);
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	console.log(err);

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
