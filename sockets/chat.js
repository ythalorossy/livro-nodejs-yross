module.exports = function(io){

	var
	crypto = require('crypto'),
	redis = require('redis').createClient(),
	md5 = crypto.createHash('md5'),
	sockets = io.sockets;

	// Novo client se conecta ao servidor
	sockets.on('connection', function(client) {

		var session = client.handshake.session,
			usuario = session.usuario;

		client.set('email', usuario.email);
		
		var onlines = sockets.clients();
		onlines.forEach(function(online){
			var online = sockets.sockets[online.id];
			online.get('email', function(err, email) {
				client.emit('notify-onlines', email);
				client.broadcast.emit('notify-onlines', email);
			});
		});
		
		// Usuario entra na sala de chat
		client.on('join', function(sala) {
			if (sala) {
				sala = sala.replace('?', '');
			} else {
				var timestamp = new Date().toString();
				var md5 = crypto.createHash('md5');
				sala = md5.update(timestamp).digest('hex');
			}
			
			// Notifica a todos os cliente sobre entrada.
			var msg = "<b>" + usuario.nome +  ":</b> entou. <br/>";
			redis.lpush(sala, msg, function(erro, res) {
				redis.lrange(sala, 0, -1, function(erro, msgs) {
					msgs.forEach(function(msg) {
						sockets.in(sala).emit('send-client', msg);
					});
				});
			});
			
			client.set('sala', sala);
			client.join(sala);
		});
		
		// Recebe requisição do Client
		client.on('send-server', function(msg) {

			msg = "<b>" + usuario.nome + ":</b> " + msg + "<br>";

			client.get('sala', function(erro, sala) {
				redis.lpush(sala, msg);
				var data = {email: usuario.email, sala: sala};
				client.broadcast.emit('new-message', data);
				sockets.in(sala).emit('send-client', msg);
			});
		});

		// Usuário sai da sala de chat
		client.on('disconnect', function() {
			client.get('sala', function(err, sala){
				redis.lpush(sala, msg);
				// Notifica a todos os cliente sobre saída.
				var msg = "<b>" + usuario.nome +  ":</b> saiu. <br/>";
				client.broadcast.emit('notify-offline', usuario.email);
				sockets.in(sala).emit('send-client', msg);
				client.leave(sala);
			});
		});
	});
};