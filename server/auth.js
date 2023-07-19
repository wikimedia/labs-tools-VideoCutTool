const config = require('./config.js');

module.exports = async (req, res, next) => {
	const { code } = req.query;
	const { CLIENT_ID, CLIENT_SECRET, BASE_WIKI_URL } = config();

	const params = new URLSearchParams();
	params.append('grant_type', 'authorization_code');
	params.append('code', code);
	params.append('scope', 'public');
	params.append('client_id', CLIENT_ID);
	params.append('client_secret', CLIENT_SECRET);

	try {
		const fetchData = await fetch(`${BASE_WIKI_URL}/w/rest.php/oauth2/access_token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: params
		});
		const fetchDataRes = await fetchData.json();

		const { access_token: accessToken, refresh_token: refreshToken } = fetchDataRes;
		res.locals.refresh_token = refreshToken;

		const getUserData = await fetch(
			`${BASE_WIKI_URL}/w/rest.php/oauth2/resource/profile`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);
		const userData = await getUserData.json();
		res.locals.profile = userData;

		next();
	} catch (err) {
		console.log(err);
		req.session.error_message = err.message;
		res.redirect('/error');
	}
};
