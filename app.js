//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//? Project imports
const errorController = require('./controllers/error');

//? Starts express
const app = express();

//? Sets up EJS as the view engine and explicitly define the views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

//? Separates the routes for shop and admin-related pages
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const User = require('./models/user');

//? Automatically parses body messages, so other commands can use req.body
app.use(bodyParser.urlencoded({ extended: false }));
//? Enables the css folders to be publicly accessed at any point
app.use(express.static(path.join(__dirname, 'public')));

//? This is a middleware to attach user data to the request object, so all
//? requests possess this data and then you can proceed creating carts and
//? orders with this user
app.use((req, res, next) => {
	//? Here we manually created the user on Mongo Compass and then fetched its
	//? data and hardcoded into this class method
	User.findById('62ae6c054ccbec553949b3d7').then((user) => {
		req.user = user;
		next();
	});
});

//? Only start the routes after the bodyparser has been made available and
//? the CSS files are made public
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoose
	.connect(
		'mongodb+srv://NodeJS-course:tozY1rQ8LktyZETy@nodejs-tutorial.nsxgg.mongodb.net/shop?retryWrites=true&w=majority'
	)
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
