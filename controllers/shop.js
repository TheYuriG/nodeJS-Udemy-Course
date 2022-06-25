const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

exports.getProducts = (req, res) => {
	Product.find()
		.then((products) => {
			res.render('shop/product-list', {
				pageTitle: 'All Products',
				path: '/products',
				prods: products,
			});
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

//? Controller for individual item details
exports.getProductDetail = (req, res) => {
	Product.findById(req.params.productId)
		.then((product) => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

exports.getIndex = (req, res) => {
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

//? Method to pull all cart items and then use their data
exports.getCart = (req, res) => {
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
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

//? Handles the POST request when clicking any "Add to Cart" buttons
exports.postCart = (req, res) => {
	const productoId = req.body.producto;
	Product.findById(productoId)
		.then((product) => {
			return User.findById(req.session.user._id).then((user) => user.addToCart(product));
		})
		.then(() => {
			res.redirect('/cart');
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

//? Handles the POST request when clicking the "Delete" in /cart
exports.postCartDeletion = (req, res) => {
	//? Fetches the product id that is meant to be deleted
	const productoId = req.body.idOfItemToBeDeleted;
	//? After the cartItem product instance, redirect the user to the cart
	//? page and display any remaining items in it, if any
	User.findById(req.session.user._id)
		.then((user) => user.removeFromCart(productoId))
		.then(() => {
			res.redirect('/cart');
		})
		.catch((error) => console.log(error));
};

//? Pulls the Order data and then pass it into the view to be rendered properly
exports.getOrders = (req, res) => {
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
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

//? Handles the POST request when proceeding to checkout from cart
exports.postOrders = (req, res) => {
	//? Parse the order object passed as JSON upon clicking "Order now!" at /cart
	let parsedOrder = JSON.parse(req.body.cartToOrder);

	//? Fix the data from the JSON in order to be able to save it
	//? in the orders database, else the validator will fail
	parsedOrder = parsedOrder.map((orderItem) => {
		let itemObject = {};
		itemObject.productId = orderItem.productId._id;
		itemObject.title = orderItem.productId.title;
		itemObject.imageUrl = orderItem.productId.imageUrl;
		itemObject.price = orderItem.productId.price;
		itemObject.description = orderItem.productId.description;
		itemObject.quantity = orderItem.quantity;
		itemObject.userId = req.session.user._id;
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
		.then((order) => {
			// console.log('user order stored successfully. now emptying user cart');
			req.session.user.cart.items = [];
			return req.session.user.save().then((success) => {
				// console.log('user cart emptied and stored successfully');
				//? Once you finish processing and storing this current order,
				//? redirect the user to the orders page and display the orders
				res.redirect('/orders');
			});
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

// exports.getCheckout = (req, res) => {
// 	const loginData = req.session.isAuthenticated ? true : false;
// 	res.render('shop/checkout', {
// 		path: '/checkout',
// 		pageTitle: 'Checkout',
// 		isAuthenticated: loginData,
// 	});
// };
