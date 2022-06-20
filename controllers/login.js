const User = require('../models/user');

exports.getLogin = (req, res, next) => {
	const loginData = req.session.isAuthenticated ? true : false;
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		isAuthenticated: loginData,
	});
};

exports.postLogin = (req, res, next) => {
	req.session.isAuthenticated = true;
	User.findById('62ae6c054ccbec553949b3d7').then((user) => {
		req.session.user = user;
		res.redirect('/');
	});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy().then(() => {
		res.redirect('/');
	});
};
