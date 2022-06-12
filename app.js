//? Default imports
const path = require('path');

//? NPM imports
const express = require('express');
const bodyParser = require('body-parser');

//? Project imports
const errorController = require('./controllers/error');
const seq = require('./util/base-of-data.js');
//? Import the user and the product so they can be related below
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart-class');
const CartItem = require('./models/cart-item');
const Order = require('./models/order-class');
const OrderItem = require('./models/order-item');

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

app.use((req, res, next) => {
	User.findByPk(1)
		.then((databaseUser) => {
			req.user = databaseUser;
			next();
		})
		.catch((e) => console.log(e));
});

//? Only start the routes after the bodyparser has been made available and
//? the CSS files are made public
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

//? Assigns the relation between two tables. If not done before the tables are
//? first created, this will reset both tables to then link them
Product.belongsTo(User, { constrains: true, onDelete: 'CASCADE' });
//? onDelete = cascade means that if an user gets deleted, all products
//? associated to that user will also get deleted
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

//? Makes the database and the sequelize util sync and actually check for
//? the same type of data on both sides
seq
	// .sync({ force: true })
	.sync()
	.then(() => {
		return User.findByPk(1);
	})
	.then((user) => {
		if (!user) {
			return User.create({ name: 'YuriG', email: 'theyurig@emaildomain.com', password: 'shopPassword' });
		}
		return Promise.resolve(user);
	})
	.then((user) => {
		if (user.getCart()) {
			user.createCart();
		}
		//? Sets up which port this website will be displayed to on localhost
		//? if the database fully connects as it should
		app.listen(3000);
	})
	.catch((e) => console.log(e));
