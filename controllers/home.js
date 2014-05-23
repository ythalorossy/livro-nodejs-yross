module.exports = function(app){
	
	var Usuario = app.models.usuario;
	
	var HomeController = {
		index : function(req, res){
			res.render('home/index');
		},
		login : function(req, res){
			var query = {email: req.body.usuario.email};
			
			Usuario
			.findOne(query)
			.select('nome email')
			.exec(function(err, usuario) {
				
				if (usuario) {
					req.session.usuario = usuario;
					res.redirect('/contatos');
				} else {
					Usuario
					.create(req.body.usuario, function(erro, usuario) {
						if (erro) {
							res.redirect('/');
						} else {
							req.session.usuario = usuario;
							res.redirect('/contatos');
						}
					});
				}
			});
			
//			var email = req.body.usuario.email,
//				nome  = req.body.usuario.nome;
//			
//			if (email && nome) {
//				var usuario = req.body.usuario;
//				usuario.contatos =[];
//				req.session.usuario = usuario;
//				res.redirect('/contatos');
//			} else {
//				res.redirect('/');
//			}
		},
		logout : function(req, res){
			req.session.destroy();
			res.redirect('/');
		}
	};
	
	return HomeController;
};