const Product = require('../models/items.js');

exports.postProduct = (req, res) => {
	res.redirect('/');
	//? This creates a new class item that will have the title property and then be saved
	//? using the method that follows
	const newProduct = new Product(req.body.title, req.body.image, req.body.description, req.body.price);
	newProduct.save();
};

exports.getProduct = (req, res) => {
	//? render the html page based on the EJS engine we defined on the server.js
	//? and get-product.ejs file that we added to the views folder
	res.render('admin/admin-product', { pageTitle: 'Add new books to the shop' });
};

exports.getEditProduct = (req, res) => {
	//? render the html page based on the EJS engine we defined on the server.js
	//? and get-product.ejs file that we added to the views folder
	res.render('admin/edit-product', { pageTitle: 'Edit book details' });
};

exports.getProductsList = (req, res) => {
	//? render the html page based on the EJS engine we defined on the server.js
	//? and get-product.ejs file that we added to the views folder
	res.render('admin/admin-product-list', { pageTitle: 'Review all books' });
};
