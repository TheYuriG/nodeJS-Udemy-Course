//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');

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

//? Automatically parses body messages, so other commands can use req.body
app.use(bodyParser.urlencoded({ extended: false }));
//? Enables the css folders to be publicly accessed at any point
app.use(express.static(path.join(__dirname, 'public')));

//? Only start the routes after the bodyparser has been made available and
//? the CSS files are made public
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

//? Sets up which port this website will be displayed to on localhost
//? if the database fully connects as it should
app.listen(3000);
