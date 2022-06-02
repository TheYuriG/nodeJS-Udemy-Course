//? Pulling the product-controller file so the products can be served in this page
const Product = require('../models/items.js');

exports.getShop = (req, res) => {
	//? Pull the stored data from the JSON file using the method inside the class
	//? and then put it in an array that can be used by the pages later
	Product.fetchAll((callbackProductFetch) => {
		res.render('shop/user-product-list', {
			leProdo: callbackProductFetch,
			pageTitle: 'All items on sale',
		});
	});
};

//? Go to the home page "/"
exports.getHome = (req, res) => {
	res.render('shop/index', {
		pageTitle: 'Home',
	});
};

//? Display more details about a book
exports.getItemDetails = (req, res) => {
	res.render('shop/product-detail', {
		pageTitle: 'More information on this item',
	});
};

//? Go to the cart page "/cart"
exports.getCart = (req, res) => {
	res.render('shop/cart', {
		pageTitle: 'Shopping Cart',
	});
};

//? Go to the orders page "/orders"
exports.getOrders = (req, res) => {
	res.render('shop/orders', {
		pageTitle: 'Orders',
	});
};

//? Go to the cehckout page "/checkout"
exports.getCheckout = (req, res) => {
	res.render('shop/checkout', {
		pageTitle: 'Purchase details',
	});
};
