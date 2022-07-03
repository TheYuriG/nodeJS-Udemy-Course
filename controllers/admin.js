const Product = require('../models/product');
const Valid = require('validatorjs');

//? Helper function to return the flash content of a request but
//? will return null if there is no message flashed
function flashMessage(flash) {
	let message = flash;
	if (message.length > 0) {
		return message[0];
	}
	return null;
}

//? Loads the blank page to add a new product rather than editing an old one
exports.getAddProduct = (req, res) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		productErrorTitle: flashMessage(req.flash('registerTitle')), //? Adds error message, if any
		productErrorImageUrl: flashMessage(req.flash('registerImageUrl')), //? Adds error message, if any
		productErrorPrice: flashMessage(req.flash('registerPrice')), //? Adds error message, if any
		productErrorDescription: flashMessage(req.flash('registerDescription')), //? Adds error message, if any
		query: { title: '', imageUrl: '', price: '', description: '' }, //? dummy data
	});
};

//? Processes the data request of adding a product
exports.postAddProduct = (req, res, next) => {
	//? Grabs all data from the request body
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = req.body.price;
	const description = req.body.description;
	let errorNum = 0;

	//? Simple function to simplify rendering the registering page again
	function rerender() {
		res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			productErrorTitle: flashMessage(req.flash('registerTitle')), //? Adds error message, if any
			productErrorImageUrl: flashMessage(req.flash('registerImageUrl')), //? Adds error message, if any
			productErrorPrice: flashMessage(req.flash('registerPrice')), //? Adds error message, if any
			productErrorDescription: flashMessage(req.flash('registerDescription')), //? Adds error message, if any
			query: { title: title, imageUrl: imageUrl, price: price, description: description }, //? passes back the data that the user tried to input, but ended up failing
		});
	}

	//? Creates a validation class and checks for title length
	const titleValidation = new Valid({ title: title }, { title: 'required|min:3' });
	if (titleValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerTitle', 'Please use a valid title.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for imageUrl compatibility
	const imageUrlValidation = new Valid({ imageUrl: imageUrl }, { imageUrl: 'required|url' });
	if (imageUrlValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerImageUrl', 'Please use a valid image URL to add this product.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for price being numeric
	const priceValidation = new Valid({ price: price }, { price: 'required|numeric' });
	if (priceValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerPrice', 'The price for this item needs to be a valid number.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for description length
	const descriptionValidation = new Valid({ description: description }, { description: 'required|min:5' });
	if (descriptionValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerDescription', 'Please use a valid description.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? If any errors happened, reload the register page with them
	if (errorNum > 0) {
		return rerender();
	}

	//? Create a product with that data
	const product = new Product({
		title: title,
		price: price,
		description: description,
		imageUrl: imageUrl,
		userId: req.session.user._id,
	});

	//? Save the product to the database
	product
		.save()
		.then(() => {
			//? Log the success and redirect
			console.log('Product has been created');
			res.redirect('/admin/products');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Fills the forms with data of a given product and allows editing it
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
				productErrorTitle: flashMessage(req.flash('registerTitle')), //? Adds error message, if any
				productErrorImageUrl: flashMessage(req.flash('registerImageUrl')), //? Adds error message, if any
				productErrorPrice: flashMessage(req.flash('registerPrice')), //? Adds error message, if any
				productErrorDescription: flashMessage(req.flash('registerDescription')), //? Adds error message, if any
				query: req.query,
			});
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/');
		});
};

// ? Processes the data request of adding a product
exports.postEditProduct = (req, res, next) => {
	//? Pull all the sent data from the request body
	const id = req.body.id;
	let title = req.body.title;
	let imageUrl = req.body.imageUrl;
	let price = req.body.price;
	let description = req.body.description;
	let errorNum = 0;

	//? Simple function to simplify rendering the registering page again
	function rerender() {
		res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			productErrorTitle: flashMessage(req.flash('registerTitle')), //? Adds error message, if any
			productErrorImageUrl: flashMessage(req.flash('registerImageUrl')), //? Adds error message, if any
			productErrorPrice: flashMessage(req.flash('registerPrice')), //? Adds error message, if any
			productErrorDescription: flashMessage(req.flash('registerDescription')), //? Adds error message, if any
			query: { id: id, title: title, imageUrl: imageUrl, price: price, description: description }, //? passes back the data that the user tried to input, but ended up failing
		});
	}

	//? Creates a validation class and checks for title length
	const titleValidation = new Valid({ title: title }, { title: 'required|min:3' });
	if (titleValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerTitle', 'Please use a valid title.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for imageUrl compatibility
	const imageUrlValidation = new Valid({ imageUrl: imageUrl }, { imageUrl: 'required|url' });
	if (imageUrlValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerImageUrl', 'Please use a valid image URL to add this product.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for price being numeric
	const priceValidation = new Valid({ price: price }, { price: 'required|numeric' });
	if (priceValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerPrice', 'The price for this item needs to be a valid number.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? Creates a validation class and checks for description length
	const descriptionValidation = new Valid({ description: description }, { description: 'required|min:5' });
	if (descriptionValidation.fails()) {
		//? Properly creates the error message
		req.flash('registerDescription', 'Please use a valid description.');
		//? Increase the error counter to reload the page after all checks
		errorNum++;
	}
	//? If any errors happened, reload the register page with them
	if (errorNum > 0) {
		return rerender();
	}

	//? Look up the old data of this product in the database
	Product.findById(id)
		.then((product) => {
			if (product.userId.toString() !== req.session.user._id.toString()) {
				return res.redirect('/admin/products');
			}

			//? Manually update the data of the product
			product.title = title;
			product.price = price;
			product.description = description;
			product.imageUrl = imageUrl;

			//? Save the updated product to the database
			return product.save();
		})
		.then(() => {
			//? Redirect the user
			res.redirect('/admin/products');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Processes the item deletion request from clicking "Delete" on /admin/products
exports.deleteProduct = (req, res, next) => {
	//? Gets the ID of the item to be deleted through the POST request
	const deletionID = req.params.productId;
	Product.deleteOne({ _id: deletionID, userId: req.session.user._id })
		.then(() => {
			//? Redirects (reloads) back to the same /admin/products page which will
			//? now be missing the item you have just requested to delete
			res.redirect('/admin/products');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Loads the page to view all products in admin mode (with edit) only for
//? the user currently logged in (userId == 1)
exports.getProducts = (req, res, next) => {
	Product.find({ userId: req.session.user._id })
		//? Mongoose has helper functions that enable you to filter in and out
		//? some specific data
		// .select('title price -_id')
		//? SELECT filters to only return the title and price of the product, while
		//? forcefully removing the ID which would always be returned otherwise
		// .populate('userId', 'name')
		//? Assuming you have declared a relational schema in the model,
		//? POPULATE will add that very same data to the product object
		//? that is going to be returned by this method. The first argument
		//? will point what schema reference will be pulled from another
		//? database and the second argument will be the name of the property
		//? that you want to be pulled and added to this retrieved product.
		//? I would assume the class creator will be using this when
		//? we readd the orders page
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
