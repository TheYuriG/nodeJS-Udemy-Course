//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoSessionStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flashData = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');

//? Project imports
const errorController = require('./controllers/error');
//? Configuration utilities for multer
const { fileDestinationAndNaming, fileTypeFilter } = require('./util/multer-file-config');

//? Starts express
const app = express();
//? Initializes the user session storage
const sessionStore = new MongoSessionStore({
	uri: process.env.MONGO_SECRET,
	collection: 'sessions',
});
const csrfProtection = csrf();

//? Sets up EJS as the view engine and explicitly define the views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

//? Separates the routes for shop and admin-related pages
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authenticationRoutes = require('./routes/auth');

//? Push all requests through helmet for SSL protection and preventing fraud
app.use(helmet());

//? Automatically parses body messages, so other commands can use req.body
app.use(bodyParser.urlencoded({ extended: false }));
//? Parses requests where a form will send forms with "multipart/form-data"
//? encoding type, but will contain a single image
app.use(multer({ storage: fileDestinationAndNaming, fileFilter: fileTypeFilter }).single('image'));
//? Enables the js, css and image folders to be publicly accessed at any point
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/javascript', express.static(path.join(__dirname, 'javascript')));

//? Adds the middleware for handling user sessions, set up the proper cookie,
//? reads it when needed and stores it in MongoDB to avoid a memory overflow
//? that would happen if all sessions were allocated in memory
app.use(
	session({
		secret: process.env.SALT_SECRET,
		//? "secret" will define your security. The longer this is, the harder it will be to decrypt your session hash
		resave: false, //? Set the session to not save again unless data was changed
		saveUninitialized: false, //? Similar to resave, improves performance
		cookie: { maxAge: 68400000 }, //? Sets the lifetime of the session, in ms
		store: sessionStore, //? Defines where the session middleware will store
		//? the sessions, rather than allocating memory for hundreds of concurrent users
	})
);

//? Sets up the csurf package to protect the website from CSRF attacks
app.use(csrfProtection);
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isAuthenticated;
	res.locals.csrfToken = req.csrfToken();
	next();
});

//? Store optional error data so we can provide valuable user feedback
//? if they failed to sign in or sign up
app.use(flashData());

//? Only start the routes after the body-parser has been made available and
//? the CSS files are made public
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authenticationRoutes);
//? Handles server errors in general
app.get('/500', errorController.get500);
app.use((error, req, res, next) => {
	console.log(error);
	res.redirect('/500');
});
//? Returns a 404 page if you can't find any other page
app.use(errorController.get404);

//? Initiates mongoose
mongoose
	.connect(process.env.MONGO_SECRET)
	.then(() => {
		//? Sets up which port this website will be displayed to on localhost
		//? if the database fully connects as it should
		app.listen(process.env.PORT || 3000, () => {
			//? On production, most hosting services will have the PORT
			//? environment variable already set up for you
			console.log('Server listening on port 3000');
		});
	})
	.catch((err) => {
		console.log(err);
	});
