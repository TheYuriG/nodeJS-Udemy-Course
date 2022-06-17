const Product = require('../models/product');
const User = require('../models/user');

exports.getProducts = (req, res) => {
	Product.fetchAll()
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
	Product.findOne(req.params.productId)
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
	Product.fetchAll()
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
	req.user
		.getCart()
		.then((cartItemsArray) => {
			//? Then render the cart page with whatever content
			//? there is in the cart or just an empty cart
			// console.log(cartItemsArray);
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				cartItems: cartItemsArray,
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
	Product.findOne(productoId)
		.then((product) => {
			return req.user.addToCart(product);
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
	req.user
		.removeFromCart(productoId)
		.then(() => {
			res.redirect('/cart');
		})
		.catch((error) => console.log(error));
};

//? Pulls the Order data and then pass it into the view to be rendered properly
exports.getOrders = (req, res) => {
	req.user
		.pullOrders()
		.then((orderino) => {
			if (orderino == null) {
				orderino = [];
			}
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orderino,
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
	const parsedOrder = JSON.parse(req.body.cartToOrder);

	//?
	req.user
		.turnCartIntoOrder(parsedOrder)
		.then((order) => {
			res.redirect('/orders');
		})
		.catch((e) => {
			console.log(e);
			res.redirect('/404');
		});
};

exports.getCheckout = (req, res) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout',
	});
};
