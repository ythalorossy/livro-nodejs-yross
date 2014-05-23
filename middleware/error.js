// P�gina n�o encontrada.
exports.notFound = function(req, res, next) {
	res.status(404);
	res.render('not-found');
};

// Error interno da aplica��o.
exports.serverError = function(error, req, res, next) {
	res.status(500);
	res.render('server-error', {error: error});
};