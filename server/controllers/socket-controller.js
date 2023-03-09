const User = require('../models/User.js');

module.exports = (socket, io) => {
	socket.on('authenticate', data => {
		User.update({ socketId: socket.id }, { where: { mediawikiId: data.mediawikiId } })
			.then(() => {
				console.log('update socket id');
			})
			.catch(err => {
				console.log('error updating socket id', err);
			});
	});
};
