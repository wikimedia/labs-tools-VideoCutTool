module.exports = (socket, io) => {
	socket.on('join', data => {
		console.log('sets socket id');

		// reflect the change to concerned user
		io.to(socket.id).emit('update', { ...data, socketId: socket.id });
	});
};
