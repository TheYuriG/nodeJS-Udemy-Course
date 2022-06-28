//? Node imports
const crypto = require('crypto');

//? Package imports
const bcrypt = require('bcryptjs');
const mailer = require('nodemailer');
const senderGrid = require('nodemailer-sendgrid-transport');

//? Imports the User model so the User model is attached to every request.session
const User = require('../models/user');

//? After MongoDB, I actually learned to store keys in a safe place and
//? actually add the files to .gitignore so they don't get uploaded to
//? GitHub when done. This will allow me to make this repository public
//? in the future and not worry about having my accounts used
const { sendGridAPIKey, senderEmail } = require('../util/secrets/keys');

const transporter = mailer.createTransport(
	senderGrid({
		auth: {
			api_key: sendGridAPIKey,
		},
	})
);

//? Loads the login page for the client
exports.getLogin = (req, res, next) => {
	let message = null;
	let tempFlash = req.flash('auth');
	if (tempFlash.length > 0) {
		message = tempFlash[0];
	}
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		authError: message,
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
			req.flash('auth', 'There is no account with this email!');
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
				req.flash('auth', "Passwords doesn't match!");
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

//?
exports.getPasswordReset = (req, res, next) => {
	let message = null;
	let tempFlash = req.flash('reset');
	if (tempFlash.length > 0) {
		message = tempFlash[0];
	}
	res.render('auth/passwordReset', {
		path: '/passwordReset',
		pageTitle: 'Reset your password',
		authError: message,
	});
};

//?
exports.postPasswordReset = (req, res, next) => {
	const postLoginEmail = req.body.email;

	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			req.flash('reset', 'Failure to create your password regeneration token');
			console.log(err);
			return res.redirect('/forgot-password');
		}
		const token = buffer.toString('hex');
		//? Pulls the data from the User model for this user and then
		//? attach this data to req.session for usage in further requests
		User.findOne({ email: postLoginEmail }).then((user) => {
			if (!user) {
				req.flash('reset', 'There is no account with this email!');
				return res.redirect('/forgot-password');
			}
			user.resetToken = token;
			user.resetTokenExpirationDate = Date.now() + 3 * 60 * 60 * 1000;
			return user
				.save()
				.then((savedUser) => {
					return transporter.sendMail({
						to: postLoginEmail, //? email of the created account
						from: senderEmail, //? email validated in SendGrid
						subject: `Password reset request`,
						html: `
				<p>A password reset was requested for this email address.</p>
				<p>If you didn't ask for a password reset, feel free to ignore this email, your account won't be impacted</p>
				<p>To reset your account's email, click this <a href="http://localhost:300/reset/${token}">link</a> and setup a new password for your account</p>
				`,
					});
				})
				.catch((e) => {
					console.log(e);
					return res.redirect('/forgot-password');
				});
		});
	});
};

//? Loads the sign up page
exports.getSignUp = (req, res, next) => {
	let message = null;
	let tempFlash = req.flash('register');
	if (tempFlash.length > 0) {
		message = tempFlash[0];
	}
	res.render('auth/register', {
		path: '/register',
		pageTitle: 'Create your account',
		registerError: message,
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
				.then(() => {
					//? After creating the account, redirect to main page
					res.redirect('/authenticate');
					//? and then log in and send an email confirming account
					return transporter.sendMail({
						to: email, //? email of the created account
						from: senderEmail, //? email validated in SendGrid
						subject: `Hello, ${name}! Your account has been created at Shop!`,
						html: '<h1>Congratulations</h1><p>You can now spend billions on our store</p>',
					});
				});
		})
		.then(() => console.log('Email sent successfully!'))
		.catch((e) => {
			console.error(e);
			res.redirect('/register');
		});
};
