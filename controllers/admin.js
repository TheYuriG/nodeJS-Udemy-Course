const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
	});
};

exports.postAddProduct = (req, res) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product(title, imageUrl, description, price);
	product.save();
	res.redirect('/');
};

exports.getEditProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
	});
};

exports.getProducts = (req, res) => {
	Product.fetchAll((products) => {
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products',
		});
	});
};
