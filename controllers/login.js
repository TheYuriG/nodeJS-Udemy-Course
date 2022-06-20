exports.getLogin = (req, res, next) => {
	const loginData = req.get('Cookie').includes('completedAuthentication=true');
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		isAuthenticated: loginData,
	});
};

exports.postLogin = (req, res, next) => {
	//? First piece of data is the parameters and values of this cookie.
	//? Second piece is how long this cookie should be usable before it
	//? expires. Third piece is restricting this cookie to Http requests,
	//? as that protects from injection attacks (more secure)
	res.setHeader('Set-Cookie', 'completedAuthentication=true; Max-Age=604800; HttpOnly');
	res.redirect('/');
};
