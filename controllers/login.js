//? Package imports
const bcrypt = require('bcryptjs');

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

//? Processes the login request from the client at "/authenticate"
exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	console.log(email, password);
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

//? Loads the sign up page
exports.getSignUp = (req, res, next) => {
	const loginData = req.session.isAuthenticated ? true : false;
	res.render('auth/register', {
		path: '/register',
		pageTitle: 'Create your account',
		isAuthenticated: loginData,
	});
};

//? Loads the sign up page
exports.postSignUp = (req, res, next) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const passwordConfirmation = req.body.passwordConfirmation;
	//? Looks up if there is an user with this email
	User.findOne({ email: email })
		.then((user) => {
			//? If this user exists, errors out to avoid duplicated data
			if (!user) {
				throw Error('This user already exists!');
				return res.redirect('/register');
			} else if (password !== passwordConfirmation) {
				throw Error('Passwords do not match!');
				return res.redirect('/register');
			}
			//? If this user doesn't exist yet, proceed forward creating this account
			return bcrypt.hash(password, 12).then((hashPassword) => {
				const user = new User({ name: name, email: email, password: hashPassword, cart: { items: [] } });
				return user.save();
			});
		})
		.then((user) => {
			//? After creating the account, log in and redirect to main page
			req.session.user = user;
			req.session.isAuthenticated = true;
			res.redirect('/');
		})
		.catch((e) => {
			res.registerError = e;
			res.redirect('/authenticate');
		});
};
