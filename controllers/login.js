//? Node imports
const crypto = require('crypto');

//? Package imports
const bcrypt = require('bcryptjs');
const mailer = require('nodemailer');
const senderGrid = require('nodemailer-sendgrid-transport');
const Valid = require('validatorjs');
const clean = require('string-sanitizer');

//? Imports the User model so the User model is attached to every request.session
const User = require('../models/user');

//? Helper function to return the flash content of a request but
//? will return null if there is no message flashed
function flashMessage(flash) {
	let message = flash;
	if (message.length > 0) {
		return message[0];
	}
	return null;
}

//? Keys will be added to a file listed in .gitignore so they don't get
//? uploaded to GitHub when done. This allows this repository to go public
//? without worrying about having the test accounts (MongoDB + Compass, SendGrid)
//? used maliciously by others
//TODO Add a readme.md that outlines the need to setup a MongoDB and
//TODO SendGrid accounts so people can actually test features if they clone this
const { sendGridAPIKey, senderEmail } = require('../util/secrets/keys');

const transporter = mailer.createTransport(
	senderGrid({
		auth: {
			api_key: sendGridAPIKey,
		},
	})
);

//? Loads the login page for the client
exports.getLogin = (req, res) => {
	res.render('auth/authenticate', {
		path: '/authenticate',
		pageTitle: 'Log in your account now!',
		authenticateErrorEmail: flashMessage(req.flash('authenticateEmail')), //? Adds email error message, if any
		authenticateErrorPassword: flashMessage(req.flash('authenticatePassword')), //? Adds password error message, if any
		success: flashMessage(req.flash('success')), //? Adds success message, if any
		data: { email: '', password: '' }, //? passes dummy data to render no pre-rendered text, unlike the errors
	});
};

//? Processes the login request from the client at "/authenticate"
exports.postLogin = (req, res) => {
	const postLoginEmail = clean.removeSpace(req.body.email);
	const postLoginPassword = req.body.password;
	let errorNum = 0;

	function rerender() {
		res.status(422).render('auth/authenticate', {
			path: '/authenticate',
			pageTitle: 'Log in your account now!',
			authenticateErrorEmail: flashMessage(req.flash('authenticateEmail')), //? Adds error message, if any
			authenticateErrorPassword: flashMessage(req.flash('authenticatePassword')), //? Adds error message, if any
			success: flashMessage(req.flash('success')), //? Adds success message, if any
			data: { email: postLoginEmail, password: postLoginPassword }, //? passes back the data that the user tried to input, but ended up failing
		});
	}

	//? Creates a validation class and checks for email compatibility
	const emailValidation = new Valid({ email: postLoginEmail }, { email: 'required|email' });
	if (emailValidation.fails()) {
		//? Properly creates the error message
		req.flash('authenticateEmail', 'Please use a valid email to sign in.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}

	//? Creates a validation class and checks for password length and
	//? returns a failure as true if smaller than 8 chars
	const passwordValidation = new Valid({ password: postLoginPassword }, { password: 'required|string|min:8' });
	if (passwordValidation.fails()) {
		//? Properly creates the error message
		req.flash('authenticatePassword', 'Your passwords are required to be at least 8 characters long.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}

	//? If any errors happened, reload the register page with them
	if (errorNum > 0) {
		return rerender();
	}

	//? Pulls the data from the User model for this user and then
	//? attach this data to req.session for usage in further requests
	User.findOne({ email: postLoginEmail }).then((user) => {
		if (!user) {
			req.flash('authenticateEmail', 'There is no account with this email!');
			return rerender();
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
				req.flash('authenticatePassword', "Passwords doesn't match!");
				return rerender();
			})
			.catch((e) => {
				console.log(e);
				req.flash('authenticateEmail', 'An undefined error happened, please contact the system administrator!');
				return rerender();
			});
	});
};

//? Processes clicking the "Logout" button on the navigation bar
exports.postLogout = (req, res) => {
	//? Destroys this user's session and forces them to login again
	req.session.destroy(() => {
		//? While you can Logout from anywhere, doing so will redirect you to home
		res.redirect('/');
	});
};

//? Loads the page to request a password reset
exports.getPasswordReset = (req, res) => {
	res.render('auth/passwordReset', {
		path: '/passwordReset',
		pageTitle: 'Reset your password',
		passwordResetError: flashMessage(req.flash('reset')), //? Adds error message, if any
		success: flashMessage(req.flash('success')), //? Adds success message, if any
	});
};

//? Handles the request when clicking on "Reset Password" at
//? "/forgot-password", which is a POST request to "/send-me-new-password"
exports.postPasswordReset = (req, res) => {
	const postLoginEmail = clean.removeSpace(req.body.email);

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
				<p>To reset your account's email, click this <a href="http://localhost:3000/password-reset/${token}">link</a> and setup a new password for your account</p>
				`,
					});
				})
				.then(() => {
					req.flash('success', 'Your reset email was sent, please check your inbox/spam folder!');
					res.redirect('/forgot-password');
				})
				.catch((e) => {
					console.log(e);
					return res.redirect('/forgot-password');
				});
		});
	});
};

//? Loads the page to reset your password, via link sent through email
//? at "/forgot-password". This will load "/password-reset"
exports.getResetPasswordNow = (req, res) => {
	//? Pulls the user password resetToken from the url params
	let resetToken = req.params.resetToken;
	//? Looks up for an user in the database that has this resetToken
	User.findOne({ resetToken: resetToken }).then((user) => {
		if (!user) {
			//? If no user is found, detract the password boxes and
			//? display an error message
			req.flash('newPassword', "This password reset link isn't valid");
		} else if (user.resetTokenExpirationDate < Date.now()) {
			//? If the user takes too long to click the email link
			//? return them a message of expired link and tell them to
			//? request another password reset. Current timer is 24 hours
			req.flash('newPassword', 'This link has expired');
		}
		//? Renders the page according to any errors above. If no errors,
		//? display both password and confirmPassword boxes so the user
		//? can input what they aim to use as the new password
		res.render('auth/createNewPassword', {
			path: '/password-reset',
			pageTitle: 'Define your new password now',
			resetToken: resetToken, //? Passes the reset token to the page
			//? so it can be used to render a hidden <input> and be used
			//? on the POST request to find the user
			newPasswordError: flashMessage(req.flash('newPassword')), //? Adds error message, if any
			badPassword: flashMessage(req.flash('invalidPassword')), //? Gives a non-blocking error message
			success: flashMessage(req.flash('success')), //? Adds success message, if any
		});
	});
};

//? Processes the newly sent password to the server and replaces old password
exports.postResettingPasswordNow = (req, res) => {
	//? Temp store both password and password confirmation
	const password1 = req.body.password;
	const password2 = req.body.passwordConfirmation;
	//? Temp store the token of this password reset request
	const resetToken = req.body.resetToken;

	if (password1 !== password2) {
		//? If the passwords don't match, inform the user of the mistake
		req.flash('invalidPassword', 'Your passwords do not match! Try again');
		return res.redirect('/password-reset/' + resetToken);
	}

	//? Creates a validation class and checks for password length and
	//? returns a failure as true if smaller than 8 chars
	const passwordValidation = new Valid({ password: password1 }, { password: 'required|string|min:8' });
	if (passwordValidation.fails()) {
		//? Properly creates the error message and reload the page
		req.flash('invalidPassword', 'Your passwords are required to be at least 8 characters long.');
		return res.redirect('/password-reset/' + resetToken);
	}

	//? Look through the database for someone with this matching resetToken
	User.findOne({ resetToken: resetToken })
		.then((user) => {
			if (!user) {
				//? If no matching user is found, error the request and redirect
				//? the user to the reset password page.
				req.flash('passwordResetError', "This password reset link isn't valid");
				return res.redirect('/forgot-password');
			} else if (user.resetTokenExpirationDate < Date.now()) {
				//? If the user clicked the link after the timer, give them an
				//? error and get them to request another password, again
				req.flash(
					'passwordResetError',
					'The password reset link that you used has expired. Please request a new one.'
				);
				return res.redirect('/forgot-password');
			}
			//? If everything went right and the passwords match, hash the password
			return bcrypt
				.hash(password1, 12)
				.then((hashPassword) => {
					//? Invalidate the token timer so the user can't use the same link to
					//? change the password again after just having done that
					user.resetTokenExpirationDate = Date.now() - 3 * 60 * 60 * 1000;
					user.password = hashPassword;
					//? Save the user with updated password and invalidated token to the database
					return user.save();
				})
				.then(() => {
					req.flash('success', 'Your password was changed! Please log in again.');
					//TODO send email to the user confirming that they changed password
					//TODO and tell them to change the password again if this wasn't them
					res.redirect('/authenticate');
				});
		})
		.catch((e) => {
			//? Log and default error if something went wrong in the process
			console.log(e);
			req.flash(
				'newPassword',
				'Something went wrong internally, please contact the system administrator about this.'
			);
			return res.redirect('/password-reset/' + resetToken);
		});
};

//? Loads the sign up page
exports.getSignUp = (req, res) => {
	res.render('auth/register', {
		path: '/register',
		pageTitle: 'Create your account',

		registerErrorEmail: flashMessage(req.flash('registerEmail')), //? Adds error message, if any
		registerErrorName: flashMessage(req.flash('registerName')), //? Adds error message, if any
		registerErrorPassword: flashMessage(req.flash('registerPassword')), //? Adds error message, if any
		success: flashMessage(req.flash('success')), //? Adds success message, if any
		data: { name: '', email: '', password: '', passwordConfirmation: '' }, //? passes dummy data to render no pre-rendered text, unlike the errors
	});
};

//? Loads the sign up page
exports.postSignUp = (req, res) => {
	//? Data the user put in the form
	const name = req.body.name;
	const email = clean.removeSpace(req.body.email);
	const password = req.body.password;
	const passwordConfirmation = req.body.passwordConfirmation;
	//? A number that stores the quantity of errors to know if it's necessary
	//? to reload the page or not
	let errorNum = 0;

	//? Simple function to simplify rendering the registering page again
	function rerender() {
		res.status(422).render('auth/register', {
			path: '/register',
			pageTitle: 'Create your account',
			registerErrorEmail: flashMessage(req.flash('registerEmail')), //? Adds error message, if any
			registerErrorName: flashMessage(req.flash('registerName')), //? Adds error message, if any
			registerErrorPassword: flashMessage(req.flash('registerPassword')), //? Adds error message, if any
			success: flashMessage(req.flash('success')), //? Adds success message, if any
			data: { name: name, email: email, password: password, passwordConfirmation: passwordConfirmation }, //? passes back the data that the user tried to input, but ended up failing
		});
	}

	//? Creates a validation class and checks for name length
	const nameValidation = new Valid({ name: name }, { name: 'required|min:2' });
	if (nameValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerName', 'Please use a valid name.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for email compatibility
	const emailValidation = new Valid({ email: email }, { email: 'required|email' });
	if (emailValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerEmail', 'Please use a valid email to sign up.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for password length and
	//? returns a failure as true if smaller than 8 chars
	const passwordValidation = new Valid({ password: password }, { password: 'required|string|min:8' });
	if (passwordValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerPassword', 'Your passwords are required to be at least 8 characters long.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Checks if the password and confirmation match
	if (password !== passwordConfirmation) {
		req.flash('registerPassword', 'Your passwords do not match!');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? If any errors happened, reload the register page with them
	if (errorNum > 0) {
		return rerender();
	}

	//? Looks up if there is an user with this email
	User.findOne({ email: email })
		.then((user) => {
			//? If this user exists, errors out to avoid duplicated data
			if (user) {
				req.flash('registerEmail', 'An account already exists with this email!');
				return rerender();
			}

			//? If this user doesn't exist yet, proceed forward creating this account
			return bcrypt
				.hash(password, 12)
				.then((hashPassword) => {
					const user = new User({ name: name, email: email, password: hashPassword, cart: { items: [] } });
					return user.save();
				})
				.then(() => {
					req.flash('success', 'Your account was created. Please login now!');
					//? After creating the account, redirect to main page
					res.redirect('/authenticate');
					//? and then log in and send an email confirming account
					return transporter
						.sendMail({
							to: email, //? email of the created account
							from: senderEmail, //? email validated in SendGrid
							subject: `Hello, ${name}! Your account has been created at Shop!`,
							html: '<h1>Congratulations</h1><p>You can now spend billions on our store</p>',
						})
						.then(() => console.log('Email sent successfully!'));
				});
		})
		.catch((e) => {
			console.error(e);
			req.flash('registerEmail', 'An undefined error happened, please contact the system administrator!');
			res.redirect('/register');
		});
};
