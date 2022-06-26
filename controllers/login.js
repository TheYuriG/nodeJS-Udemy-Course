//? Package imports
const bcrypt = require('bcryptjs');

//? Imports the User model so the User model is attached to every request.session
const User = require('../models/user');

//? Loads the login page for the client
exports.getLogin = (req, res, next) => {
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		authError: req.flash('auth'),
	});
};

//? Processes the login request from the client at "/authenticate"
exports.postLogin = (req, res, next) => {
	const postLoginEmail = req.body.email;
	const postLoginPassword = req.body.password;
	//? Pulls the data from the User model for this user and then
	//? attach this data to req.session for usage in further requests
	User.findOne({ email: postLoginEmail }).then((user) => {
		if (!user) {
			req.flash('auth', 'No account has been created with this email');
			console.log(req.authenticationError);
			return res.redirect('/authenticate');
		}
		bcrypt
			.compare(postLoginPassword, user.password)
			.then((passwordsAreMatching) => {
				if (passwordsAreMatching) {
					req.session.user = user;
					req.session.isAuthenticated = true;
					return req.session.save((err) => {
						if (err) {
							console.log(err);
						}
						//? Redirects to main once done
						res.redirect('/');
					});
				}
				req.flash('auth', "Passwords doesn't match");
				console.log(req.authenticationError);
				return res.redirect('/authenticate');
			})
			.catch((e) => {
				console.log(e);
				return res.redirect('/authenticate');
			});
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
	res.render('auth/register', {
		path: '/register',
		pageTitle: 'Create your account',
		registerError: req.flash('register'),
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
			if (user) {
				req.flash('register', 'An account already exists with this email!');
				throw Error('This user already exists!');
			} else if (password !== passwordConfirmation) {
				req.flash('register', 'Your passwords do not match!');
				throw Error('Passwords do not match!');
			}
			//? If this user doesn't exist yet, proceed forward creating this account
			return bcrypt
				.hash(password, 12)
				.then((hashPassword) => {
					const user = new User({ name: name, email: email, password: hashPassword, cart: { items: [] } });
					return user.save();
				})
				.then((result) => {
					//? After creating the account, log in and redirect to main page
					res.redirect('/authenticate');
				});
		})
		.catch((e) => {
			console.error(e);
			res.redirect('/register');
		});
};
