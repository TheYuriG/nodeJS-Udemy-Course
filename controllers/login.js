//? Imports the User model so the User model is attached to every request.session
const User = require('../models/user');

//? Loads the login page for the client
exports.getLogin = (req, res, next) => {
	const loginData = req.session.isAuthenticated ? true : false;
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		isAuthenticated: loginData,
	});
};

//? Loads the sign up page
exports.getSignUp = (req, res, next) => {
	const loginData = req.session.isAuthenticated ? true : false;
	res.render('auth/register', {
		path: '/register',
		pageTitle: 'Create your account',
		isAuthenticated: loginData,
	});
};

//? Processes the login request from the client at "/authenticate"
exports.postLogin = (req, res, next) => {
	//? Pulls the data from the User model for this user and then
	//? attach this data to req.session for usage in further requests
	User.findById('62ae6c054ccbec553949b3d7').then((user) => {
		req.session.user = user;
		req.session.isAuthenticated = true;
		//? Redirects to main once done
		res.redirect('/');
	});
};

//? Processes clicking the "Logout" button on the navigation bar
exports.postLogout = (req, res, next) => {
	//? Destroys this user's session and forces them to login again
	req.session.destroy(() => {
		//? While you can Logout from anywhere, doing so will redirect you to home
		res.redirect('/');
	});
};
