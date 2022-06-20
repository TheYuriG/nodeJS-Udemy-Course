exports.getLogin = (req, res, next) => {
	const loginData = req.get('Cookie').includes('completedAuthentication=true');
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		isAuthenticated: loginData,
	});
};

exports.postLogin = (req, res, next) => {
	res.setHeader('Set-Cookie', 'completedAuthentication=true');
	res.redirect('/');
};
