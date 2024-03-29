//? Import core feature from NodeJS to upload invoices
const fs = require('fs');
const path = require('path');

//? Import NPM packages
const PDFer = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

//? Imports the data models
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

//? Defines max number of items per page (for clients) to organize pagination
const MAX_ITEMS_CLIENT = 3;

//? Loads all products at "/products"
exports.getProducts = (req, res, next) => {
	//? Pull data about the number of the page being visited. If the user
	//? isn't at a specific page yet, consider they are on the first page
	const page = +(req.query.page ?? 1);
	//? Initialize the total number of products on the database for later
	let totalNumberOfProductsOnSlashProducts;

	//? Goes through all items in the database to pull the total number and
	//? update "totalNumberOfProducts" and then actually load the necessary
	//? ones with proper pagination
	Product.find()
		.countDocuments()
		.then((numberOfProducts) => {
			//? Update "totalNumberOfProductsOnSlashProducts"
			totalNumberOfProductsOnSlashProducts = numberOfProducts;

			//? Iterate through the items again, but this time only returning
			//? the max possible inside a page, considering what page the user
			//? might be visiting at the moment (if any, else load page 1)
			return Product.find()
				.skip((page - 1) * MAX_ITEMS_CLIENT)
				.limit(MAX_ITEMS_CLIENT);
		})
		.then((products) => {
			//? Load the page with the items within the specified range of
			//? page * MAX_ITEMS_CLIENT
			res.render('shop/product-list', {
				pageTitle: 'All Products',
				path: '/products',
				prods: products,
				maxItems: totalNumberOfProductsOnSlashProducts,
				itemLimitPerPage: MAX_ITEMS_CLIENT,
				page: page,
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
	//? Using the ID provided after "/product" through "/:productId"
	//? look up the database for this product
	Product.findById(req.params.productId)
		.then((product) => {
			//? Using all of the product data, return a page that will
			//? display all the information to the user
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
	//? Pull data about the number of the page being visited. If the user
	//? isn't at a specific page yet, consider they are on the first page
	const page = +(req.query.page ?? 1);
	//? Initialize the total number of products on the database for later
	let totalNumberOfProductsOnIndex;

	//? Goes through all items in the database to pull the total number and
	//? update "totalNumberOfProducts" and then actually load the necessary
	//? ones with proper pagination
	Product.find()
		.countDocuments()
		.then((numberOfProducts) => {
			//? Update "totalNumberOfProductsOnIndex"
			totalNumberOfProductsOnIndex = numberOfProducts;

			//? Iterate through the items again, but this time only returning
			//? the max possible inside a page, considering what page the user
			//? might be visiting at the moment (if any, else load page 1)
			return Product.find()
				.skip((page - 1) * MAX_ITEMS_CLIENT)
				.limit(MAX_ITEMS_CLIENT);
		})
		.then((products) => {
			//? Load the page with the items within the specified range of
			//? page * MAX_ITEMS_CLIENT
			res.render('shop/index', {
				pageTitle: 'Shop',
				path: '/',
				prods: products,
				maxItems: totalNumberOfProductsOnIndex,
				itemLimitPerPage: MAX_ITEMS_CLIENT,
				page: page,
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
	//? Look up the user making the request to "/cart"
	User.findById(req.session.user._id)
		.then((user) => {
			//? Once you find the user, fetch their cart
			return user.getCart();
		})
		.then((cartItemsArray) => {
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
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Handles the POST request when clicking any "Add to Cart" buttons
exports.postCart = (req, res, next) => {
	//? Store the ID of the product being added to the cart
	const productoId = req.body.producto;

	//? Look up this item in the database through the ID
	Product.findById(productoId)
		.then((product) => {
			//? With the item, look up the user data to get this item
			//? added to their cart
			return User.findById(req.session.user._id).then((user) => user.addToCart(product));
		})
		.then(() => {
			//? Once successfully adding this item to the user cart, redirect
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

	//? Look up the user requesting the item cart deletion
	User.findById(req.session.user._id)
		//? Request to delete the item with "productoID" from the cart
		.then((user) => user.removeFromCart(productoId))
		.then(() => {
			//? Once successful, redirect again to "/cart"
			res.redirect('/cart');
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Handles the get request when clicking "Order now!" in /cart
exports.getCheckout = (req, res, next) => {
	//? Cart variable to store this user's cart and then use after
	//? the stripe session was created
	let tempCart;

	//? Looks up the user making this request
	User.findById(req.session.user._id)
		.then((user) => {
			//? Get this user's cart
			return user.getCart();
		})
		.then((cartItemsArray) => {
			//? Soft store the cart on the variable so we can use the cart
			//? after the session was created and successfully returned
			tempCart = cartItemsArray;

			//? Create a stripe session for this user
			return stripe.checkout.sessions.create({
				//? Pass in all the necessary information to stripe
				payment_method_types: ['card'], //? Payment type
				line_items: cartItemsArray.items.map((p) => {
					//? Array of items to be purchased
					return {
						name: p.productId.title,
						description: p.productId.description,
						amount: p.productId.price * 100,
						currency: 'usd',
						quantity: p.quantity,
					};
				}),
				//? Where to redirect if the purchase is successful
				success_url: req.protocol + '://' + req.get('host') + '/checkout/stripe',

				//? Where to redirect if the user doesn't complete the purchase
				cancel_url: req.protocol + '://' + req.get('host') + '/checkout',
			});
		})
		.then((session) => {
			//? With the session render the page using the variable that
			//? soft stored the cart
			res.render('shop/checkout', {
				path: '/checkout',
				pageTitle: 'Checkout',
				cartItems: tempCart.items,
				sessionId: session.id,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

//? Success of a stripe payment after "/checkout" redirects to the Stripe website
//! This URL can be manually accessed which would trigger a purchase completion
//! We should manually check purchases by using webhooks, but those doesn't
//! work in localhost since our page isn't exposed to outsiders
//! Consider this in production
exports.stripeSuccess = (req, res, next) => {
	//? Look up the user making the request to "/checkout/stripe"
	User.findById(req.session.user._id)
		.then((user) => {
			//? Once you find the user, fetch their cart
			return user.getCart();
		})
		.then((parsedOrder) => {
			//? Fix the data from the cart in order to be able to save it
			//? in the orders database, else the validator will fail
			parsedOrder = parsedOrder.items.map((orderItem) => {
				let itemObject = {};
				itemObject.productId = orderItem.productId._id;
				itemObject.title = orderItem.productId.title;
				itemObject.imagePath = orderItem.productId.imagePath;
				itemObject.price = orderItem.productId.price;
				itemObject.description = orderItem.productId.description;
				itemObject.quantity = orderItem.quantity;
				return itemObject;
			});

			//? Pass the parsedOrder into the Order model to save the order related
			//? to this cart, since the current price being paid is important in case
			//? the cost of this item is changed in the database in the future.
			const order = new Order({ userId: req.session.user._id, items: parsedOrder.items });
			return order.save();
		})
		.then(() => User.findById(req.session.user._id))
		.then((user) => {
			//? Empty the user's cart after completing an order
			req.session.user = user;
			req.session.user.cart.items = [];
			return req.session.user.save();
		})
		.then(() => {
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

			//? Check if the PDF exists before sending it to the client
			fs.access(invoicePath, fs.F_OK, (err) => {
				if (err) {
					//? Creates a new PDF stream to save and send to client
					const PDFdocument = new PDFer();
					//? Save the PDF to the disk as it's being created
					PDFdocument.pipe(fs.createWriteStream(invoicePath));
					//? Also send the PDF to the client as it's being created
					PDFdocument.pipe(res);
					//? Add proper text to the PDF
					PDFdocument.fontSize(26).text('Invoice', { underline: true });
					PDFdocument.fontSize(14).text('-----------------------');
					//? Loop through the purchased items of this order and list their prices
					//? and the order total in the PDF
					let currentOrderPrice = 0;
					databaseFoundOrder.items.forEach((product) => {
						PDFdocument.text(
							`${product.title}  (${product.quantity} x R$ ${product.price})`
						);
						currentOrderPrice += +product.price * product.quantity;
					});
					PDFdocument.text(`Total cost of this order: R$ ${currentOrderPrice}`);

					//? Complete both saving to disk and sending to client
					PDFdocument.end();
					return;
				}

				// ? Read the file in chunks of stream data and send that
				// ? piece by piece to the client
				// ! This is done to avoid loading several files into memory and causing
				// ! a memory overflow when there are simultaneous requests with big files
				const file = fs.createReadStream(invoicePath);
				//? Defines the file as PDF
				res.setHeader('ContentType', 'application/pdf');
				//? "attachment" tells the browser to download the file (inline would open in a new tab)
				//? "filename" defines the name and extension of the file for the user
				res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceFile + '"');
				file.pipe(res);
			});

			// //? Loads the file into memory and serves it to the client
			// fs.readFile(invoicePath, (invoiceReadFileError, loadedData) => {
			// 	if (invoiceReadFileError) {
			// 		return next(invoiceReadFileError);
			// 	}
			// 	res.send(loadedData);
			// });
		})
		.catch((databaseOrderError) => next(databaseOrderError));
};
