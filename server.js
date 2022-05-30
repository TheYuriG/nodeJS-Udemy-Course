//? Core dependencies
const path = require('path');

//? NPM dependencies
const express = require('express');
const bodyParser = require('body-parser');

//? modules import
const errorController = require('./controllers/error.js');

//? Pull express as a function that can handle routing
const app = express();

//? using EJS as view engine, just because the tutorial uses it, despite pug being better
app.set('view engine', 'ejs');
// sets up pug as main html renderer, look up express().set() documentation if needed
// app.set("view engine", "pug");
//? sets up the location of the html files. by default, uses the views folder,
//? but we are explicitly declaring it here for possible future reference
app.set('views', 'views');

//? Uses the 'body-parser' package to parse text response bodies
app.use(bodyParser.urlencoded({ extended: true }));

//? Setups up a static serve for files under public, so that
//? browsers can access CSS files and anything else under this folder.
//? You should omit "/public" on path for files in the html code
//? trying to access these files, as they will load that folder by default
app.use(express.static(path.join(__dirname, 'public')));

//? Read from the folder and file to setup specific routes to be done
const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop.js');

//? Routes to the admin routes, if that's what you can/want to access
app.use('/admin', adminRoutes);

//? Routes to the shop if the user can't access admin
app.use(shopRoutes);

//? Default catcher for 'Page Not Found' errors, pulls the html code from
//? the views folder, like for every other html code
app.use(errorController);

//? Starts the server and listen to a specific port
const port = 3000;
app.listen(port, () => {
	console.log('listening on port ' + port);
});
