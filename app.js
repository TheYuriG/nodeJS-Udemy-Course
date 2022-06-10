//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');

//? Project imports
const errorController = require('./controllers/error');
const db = require('./util/base-of-data.js');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

db.execute('SELECT * FROM products');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
