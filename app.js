//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');

//? Project imports
const errorController = require('./controllers/error');
const mongoDB = require('./util/base-of-data');

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
	User.findById('62a9906875a379ee5e7ffe2e').then((user) => {
		req.user = new User(user.email, user.name, user.password, user.cart, user._id);
	});
	next();
});

//? Only start the routes after the bodyparser has been made available and
//? the CSS files are made public
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoDB.mongoConnect(() => {
	//? Sets up which port this website will be displayed to on localhost
	//? if the database fully connects as it should
	app.listen(3000, () => {
		console.log('Server listening on port 3000');
	});
});
