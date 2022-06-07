const Product = require('../models/product');

//? Loads the blank page to add a new product rather than editing an old one
exports.getAddProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	});
};

//? Processes the data request of adding a product
exports.postAddProduct = (req, res) => {
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product(null, title, imageUrl, description, price);
	product.save();
	res.redirect('/');
};

//? Fills the forms with data of a given product and allows editing it
//! Query is the part after the "?" that you can pass arguments to
exports.getEditProduct = (req, res) => {
	//? Check if the edit value in query is set to true and redirect if not
	//? this value needs to be manually set as true with "?edit=true" on GET
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}

	//? Checks for the product ID in the request parameters (the second / in the URL)
	const prodId = req.params.productId;

	//? Uses the item ID in the request parameters to find the item in the database
	Product.findBySingleId(prodId, (product) => {
		//? If the item can't be found, redirect to the main page
		//? This should never happen unless the user is manually trying to access
		//? a page that doesn't exist or the user is using multiple tabs on the
		//? admin products page and then deletes an item in a page and then tries
		//? to edit the same deleted item in another page that wasn't updated yet
		if (!product) {
			return res.redirect('/');
		}

		//? Attaches the ID passed to this request to the query and uses the whole
		//? query object to pass to the render page so it uses that information
		//? to render the page.
		//! The recommended way to do this would have been to use the product that
		//! Product.findBySingleId gives you, but that's the tutorial way and
		//! I did differently so I'm actually learning instead of
		//! following tutorials blindly
		req.query.id = prodId;
		res.render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: editMode,
			query: req.query,
		});
	});
};

//? Processes the data request of adding a product
exports.postEditProduct = (req, res) => {
	const id = req.body.id;
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const updatedProduct = new Product(id, title, imageUrl, description, price);
	updatedProduct.save();
	res.redirect('/admin/products');
};

//? Processes the item deletion request from clicking "Delete" on /admin/products
exports.deleteProduct = (req, res) => {
	//? Gets the ID of the item to be deleted through the POST request
	const deletionID = req.params.productId;

	//? Runs the static method for item deletion in the DB
	Product.itemDeleteById(deletionID);

	//? Redirects (reloads) back to the same /admin/products page which will
	//? now be missing the item you have just requested to delete
	res.redirect('/admin/products');
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
