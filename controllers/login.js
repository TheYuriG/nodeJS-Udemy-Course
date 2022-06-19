exports.getLogin = (req, res, next) => {
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
	});
};
