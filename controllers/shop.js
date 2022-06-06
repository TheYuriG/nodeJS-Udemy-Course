const Product = require('../models/product');
const Cart = require('../models/cart-class');

exports.getProducts = (req, res) => {
	Product.fetchAll((products) => {
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products',
		});
	});
};

//? Controller for individual item details
exports.getProductDetail = (req, res) => {
	const prodId = req.params.productId;
	Product.findBySingleId(prodId, (item) => {
		res.render('shop/product-detail', {
			product: item,
			pageTitle: item.title,
			path: '/products',
		});
	});
};

exports.getIndex = (req, res) => {
	Product.fetchAll((products) => {
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
		});
	});
};

exports.getCart = (req, res) => {
	res.render('shop/cart', {
		path: '/cart',
		pageTitle: 'Your Cart',
	});
};

//? Handles the POST request when clicking any "Add to Cart" buttons
exports.postCart = (req, res) => {
	const productoId = req.body.producto;
	Product.findBySingleId(productoId, (producterino) => {
		Cart.addProductToCart(producterino.id, producterino.price);
	});
	res.redirect('/cart');
};

exports.getOrders = (req, res) => {
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Your Orders',
	});
};

exports.getCheckout = (req, res) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout',
	});
};