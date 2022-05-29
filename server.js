//? Core dependencies
const path = require('path');

//? NPM dependencies
const express = require('express');
const bodyParser = require('body-parser');
//? This is also a NPM dependency, but just an alternate template engine
//! express-handlebars needs to be installed as 3.0 because it becomes
//! a massive headache otherwise with the several breaking changes it had since
const barsBeingHandled = require('express-handlebars');

//? Pull express as a function that can handle routing
const app = express();

//? Add another template engine to be used over pug. The pug engine code below is
//? commented out so handlebars can be used, but from my usage and the readability
//? of pug files, they are just superior and should be used instead
app.engine('handlebars', barsBeingHandled({ layoursDir: 'views/layouts/', defaultLayout: 'regenerative-layout' }));
//? handlebars requires you to explicitly define layout templates and optionally
//? the main layout. class doesn't touch on how you can use main layouts programatically

//? setting up handlebars as the template engine because this tutorial says we
//? should but i really don't want to
app.set('view engine', 'handlebars');
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
app.use('/admin', adminRoutes.routes);

//? Routes to the shop if the user can't access admin
app.use(shopRoutes);

//? Default catcher for 'Page Not Found' errors, pulls the html code from
//? the views folder, like for every other html code
app.use((req, res) => {
	res.status(404).render('page-not-found', { path: 'Error! You got nowhere!' });
});

//? Starts the server and listen to a specific port
const port = 3000;
app.listen(port, () => {
	console.log('listening on port ' + port);
});
