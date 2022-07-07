//? Import core feature from NodeJS to upload invoices
const fs = require('fs');
const path = require('path');

//? Import NPM packages
const PDFer = require('pdfkit');

//? Imports the data models
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('shop/product-list', {
				pageTitle: 'All Products',
				path: '/products',
				prods: products,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Controller for individual item details
exports.getProductDetail = (req, res, next) => {
	Product.findById(req.params.productId)
		.then((product) => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Loads main page with products with pagination
exports.getIndex = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Method to pull all cart items and then use their data
exports.getCart = (req, res, next) => {
	User.findById(req.session.user._id)
		.then((user) => {
			user.getCart().then((cartItemsArray) => {
				//? Then render the cart page with whatever content
				//? there is in the cart or just an empty cart
				//! Since the productId gets nested-populated by the .populate()
				//! method in mongoose, we need to travel inside of that when
				//! calling the res.render()
				res.render('shop/cart', {
					path: '/cart',
					pageTitle: 'Your Cart',
					cartItems: cartItemsArray.items,
				});
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Handles the POST request when clicking any "Add to Cart" buttons
exports.postCart = (req, res, next) => {
	const productoId = req.body.producto;
	Product.findById(productoId)
		.then((product) => {
			return User.findById(req.session.user._id).then((user) => user.addToCart(product));
		})
		.then(() => {
			res.redirect('/cart');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Handles the POST request when clicking the "Delete" in /cart
exports.postCartDeletion = (req, res, next) => {
	//? Fetches the product id that is meant to be deleted
	const productoId = req.body.idOfItemToBeDeleted;
	//? After the cartItem product instance, redirect the user to the cart
	//? page and display any remaining items in it, if any
	User.findById(req.session.user._id)
		.then((user) => user.removeFromCart(productoId))
		.then(() => {
			res.redirect('/cart');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Pulls the Order data and then pass it into the view to be rendered properly
exports.getOrders = (req, res, next) => {
	//? Search through all orders and retrieve the ones that
	//? has userId === this user's ID
	Order.find({ userId: req.session.user._id })
		.then((orderino) => {
			//? Render the orders page considering the found orders, if any
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orderino == null ? [] : orderino, //? Gives back an empty array if no orders were found
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Handles the POST request when proceeding to checkout from cart
exports.postOrders = (req, res, next) => {
	//? Parse the order object passed as JSON upon clicking "Order now!" at /cart
	let parsedOrder = JSON.parse(req.body.cartToOrder);

	//? Fix the data from the JSON in order to be able to save it
	//? in the orders database, else the validator will fail
	parsedOrder = parsedOrder.map((orderItem) => {
		let itemObject = {};
		itemObject.productId = orderItem.productId._id;
		itemObject.title = orderItem.productId.title;
		itemObject.imagePath = orderItem.productId.imagePath;
		itemObject.price = orderItem.productId.price;
		itemObject.description = orderItem.productId.description;
		itemObject.quantity = orderItem.quantity;
		return itemObject;
	});

	//? Pass the parsedOrder into the User model to save the order related
	//? to this cart, since the current price being paid is important in case
	//? the cost of this item is changed in the database in the future.
	//? This is how a real-world application would behave, since the price
	//? of the item can change, but won't affect how much you actually paid
	//? for it at the moment you completed your transaction.
	const order = new Order({ userId: req.session.user._id, items: parsedOrder });
	order
		.save()
		.then(() =>
			User.findById(req.session.user._id).then((user) => {
				req.session.user = user;
				req.session.user.cart.items = [];
				req.session.user.save();
			})
		)
		.then((success) => {
			//? Once you finish processing and storing this current order,
			//? redirect the user to the orders page and display the orders
			res.redirect('/orders');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Pulls the Order data and then pass it into the view to be rendered properly
exports.getOrderInvoice = (req, res, next) => {
	//? ID of this order
	const orderId = req.params.invoiceId;

	//? Pulls data from this order to check if the order user is the same
	//? as the logged in user
	Order.findById(orderId)
		.then((databaseFoundOrder) => {
			//? If no order was found, error the user
			if (!databaseFoundOrder) {
				return next(new Error('No Order Found!'));
			}
			//? If the order user is different than the logged user, error the user
			if (databaseFoundOrder.userId.toString() !== req.session.user._id.toString()) {
				return next(new Error('Authorization error! Different user than request!'));
			}

			//? Name of the invoice file created upon completing an order
			const invoiceFile = 'invoice-' + orderId + '.pdf';
			//? Path direction to this PDF in the server
			const invoicePath = path.join('invoices', invoiceFile);

			//? Defines the file served to the client as PDF
			res.setHeader('ContentType', 'application/pdf');
			//? "attachment" tells the browser to download the file (inline would open in a new tab)
			//? "filename" defines the name and extension of the file for the user
			res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceFile + '"');

			//? Creates a new PDF stream to save and send to client
			const PDFdocument = new PDFer();
			//? Save the PDF to the disk as it's being created
			PDFdocument.pipe(fs.createWriteStream(invoicePath));
			//? Also send the PDF to the client as it's being created
			PDFdocument.pipe(res);

			PDFdocument.fontSize(26).text('Invoice', { underline: true });
			PDFdocument.fontSize(14).text('-----------------------');

			let currentOrderPrice = 0;
			databaseFoundOrder.items.forEach((product) => {
				PDFdocument.text(`${product.title}  (${product.quantity} x R$ ${product.price})`);
				currentOrderPrice += +product.price * product.quantity;
			});
			PDFdocument.text(`Total cost of this order: R$ ${currentOrderPrice}`);

			//? Complete both saving to disk and sending to client
			PDFdocument.end();
			// //? Loads the file into memory and serves it to the client
			// fs.readFile(invoicePath, (invoiceReadFileError, loadedData) => {
			// 	if (invoiceReadFileError) {
			// 		return next(invoiceReadFileError);
			// 	}
			// 	//? Defines the file as PDF
			// 	res.setHeader('ContentType', 'application/pdf');
			// 	//? "attachment" tells the browser to download the file (inline would open in a new tab)
			// 	//? "filename" defines the name and extension of the file for the user
			// 	res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceFile + '"');
			// 	res.send(loadedData);
			// });

			//? Read the file in chunks of stream data and send that
			//? piece by piece to the client
			//! This is done to avoid loading several files into memory and causing
			//! a memory overflow when there are simultaneous requests with big files
			// const file = fs.createReadStream(invoicePath);
			// res.send(loadedData);
			// file.pipe(res);
		})
		.catch((databaseOrderError) => next(databaseOrderError));
};

// exports.getCheckout = (req, res, next) => {
// 	const loginData = req.session.isAuthenticated ? true : false;
// 	res.render('shop/checkout', {
// 		path: '/checkout',
// 		pageTitle: 'Checkout',
// 		isAuthenticated: loginData,
// 	});
// };
