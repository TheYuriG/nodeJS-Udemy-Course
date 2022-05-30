const Product = require('../models/items.js');

exports.postProduct = (req, res) => {
	res.redirect('/');
	//? This creates a new class item that will have the title property and then be saved
	//? using the method that follows
	const newProduct = new Product(req.body.title);
	newProduct.save();
};

exports.getProduct = (req, res) => {
	//? render the html page based on the EJS engine we defined on the server.js
	//? and get-product.ejs file that we added to the views folder
	res.render('get-product', { pageTitle: 'Add new books to the shop' });
};

//? Define the array of products by using the method inside the class
const arrayOfProducts = Product.fetchAll();

//? Export the array of products to be used in other files
exports.products = arrayOfProducts;
