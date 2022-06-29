//? NPM import
const express = require('express');

//? Imports the controllers for authentication that will deal with
//? requests, responses and rendering
const loginController = require('../controllers/login');

//? Creates the router responsible for handling authentication
const router = express.Router();

//? This is the login page
router.get('/authenticate', loginController.getLogin);

//? This is the sign up page
router.get('/register', loginController.getSignUp);

//? This is the sign up attempt when clicking "Sign up" in "/register"
router.post('/new-account', loginController.postSignUp);

//? This is the login attempt when clicking "Login" in "/authenticate"
router.post('/login-attempt', loginController.postLogin);

//? This is the logoff request, by clicking "Logout" after being logged in
router.post('/disconnect', loginController.postLogout);

//? On login, user can click to reset password if they forgot it
router.get('/forgot-password', loginController.getPasswordReset);

//? Fetches user from database and sends them an email reset password
router.post('/send-me-new-password', loginController.postPasswordReset);

//?
router.get('/password-reset/:resetToken', loginController.getResetPasswordNow);

//?
router.post('/update-old-password', loginController.postResettingPasswordNow);

module.exports = router;
