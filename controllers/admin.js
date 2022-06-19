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
	//? Grabs all data from the request body
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		userId: req.user._id,
	});
	product
		.save()
		.then(() => {
			console.log('Product has been created');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
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
	Product.findById(prodId)
		.then((product) => {
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
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/');
		});
};

// ? Processes the data request of adding a product
exports.postEditProduct = (req, res) => {
	//? Pull all the sent data from the request body
	const id = req.body.id;
	let title = req.body.title;
	let imageUrl = req.body.imageUrl;
	let price = req.body.price;
	let description = req.body.description;

	//? Look up the old data of this product in the database
	Product.findById(id)
		.then((product) => {
			//? Manually update the data of the product
			product.title = title;
			product.price = price;
			product.description = description;
			product.imageUrl = imageUrl;

			//? Save the updated product to the database
			return product.save();
		})
		.then(() => {
			console.log('product updated successfully!');
			res.redirect('/admin/products');
		})
		.catch(() => {
			console.log('');
		});
};

//? Processes the item deletion request from clicking "Delete" on /admin/products
exports.deleteProduct = (req, res) => {
	//? Gets the ID of the item to be deleted through the POST request
	const deletionID = req.params.productId;
	Product.findByIdAndRemove(deletionID)
		.then(() => {
			//? Redirects (reloads) back to the same /admin/products page which will
			//? now be missing the item you have just requested to delete
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

//? Loads the page to view all products in admin mode (with edit) only for
//? the user currently logged in (userId == 1)
exports.getProducts = (req, res) => {
	Product.find()
		//? Mongoose has helper functions that enable you to filter in and out
		//? some specific data
		// .select('title price -_id')
		//? SELECT filters to only return the title and price of the product, while
		//? forcefully removing the ID which would always be returned otherwise
		// .populate('userId', 'name')
		//? Assuming you have declared a relational schema in the model,
		//? POPULATE will add that very same data to the product object
		//? that is going to be returned by this method.
		//? I would assume the class creator will be using this when
		//? We readd the orders page
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((e) => console.log(e));
};
