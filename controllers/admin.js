const Product = require('../models/product');

//? Loads the blank page to add a new product rather than editing an old one
exports.getAddProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
	});
};

//? Processes the data request of adding a product
exports.postAddProduct = (req, res) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product(title, imageUrl, description, price);
	product.save();
	res.redirect('/');
};

//? Fills the forms with data of a given product and allows editing it
//! Query is the part after the "?" that you can pass arguments to
exports.getEditProduct = (req, res) => {
	//? Logs the whole query for fun
	console.log(req.query);

	//? Check if the edit value in query is set to true and redirect if not
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}

	//?
	const prodId = req.params.productId;
	Product.findBySingleId(prodId, (product) => {
		if (!product) {
			return res.redirect('/');
		}
		res.render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: editMode,
			item: product,
		});
	});
};

//? Loads the page to view all products in admin mode (with edit)
exports.getProducts = (req, res) => {
	Product.fetchAll((products) => {
		res.render('admin/products', {
			prods: products,
			pageTitle: 'Admin Products',
			path: '/admin/products',
		});
	});
};
