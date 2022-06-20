//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoSessionStore = require('connect-mongodb-session')(session);
//? Project imports
const errorController = require('./controllers/error');

const MONGODB_URI = 'mongodb+srv://NodeJS-course:tozY1rQ8LktyZETy@nodejs-tutorial.nsxgg.mongodb.net/shop?w=majority';

//? Starts express
const app = express();
//? Initializes the user session storage
const sessionStore = new MongoSessionStore({ uri: MONGODB_URI, collection: 'sessions' });

//? Sets up EJS as the view engine and explicitly define the views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

//? Separates the routes for shop and admin-related pages
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authenticationRoutes = require('./routes/auth');
const User = require('./models/user');

//? Automatically parses body messages, so other commands can use req.body
app.use(bodyParser.urlencoded({ extended: false }));
//? Enables the css folders to be publicly accessed at any point
app.use(express.static(path.join(__dirname, 'public')));
//? Adds the middleware for handling user sessions, set up the proper cookie,
//? reads it when needed and stores it in MongoDB to avoid a memory overflow
//? that would happen if all sessions were allocated in memory
app.use(
	session({
		secret: 'longestPossibleStringToHashAsIfThisWasProduction',
		//? "secret" will define your security. The longer this is, the harder it will be to decrypt your session hash
		resave: false, //? Set the session to not save again unless data was changed
		saveUninitialized: false, //? Similar to resave, improves performance
		cookie: { maxAge: 68400000 }, //? Sets the lifetime of the session, in ms
		store: sessionStore, //? Defines where the session middleware will store
		//? the sessions, rather than allocating memory for hundreds of concurrent users
	})
);

//? Only start the routes after the bodyparser has been made available and
//? the CSS files are made public
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authenticationRoutes);
app.use(errorController.get404);

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		//? Sets up which port this website will be displayed to on localhost
		//? if the database fully connects as it should
		app.listen(3000, () => {
			//? Check the user database for any existing users
			User.findOne().then((user) => {
				//? If there is no user,
				if (!user) {
					//? We create a new user on first login and then manually
					//? fetch from the database so their ID can be used
					//? on every request
					const user = new User({
						email: 'user@domain.com',
						name: 'user',
						password: 'password',
						cart: { items: [] },
					});
					user.save();
					//? After the user is created, we need to manually pull its ID
					//? and hardcode it in the app.use() middleware on line 32
					console.log('User created');
				}
			});
			console.log('Server listening on port 3000');
		});
	})
	.catch((err) => {
		console.log(err);
	});
