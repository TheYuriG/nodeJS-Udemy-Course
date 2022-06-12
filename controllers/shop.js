const Product = require('../models/product');

exports.getProducts = (req, res) => {
	Product.findAll()
		.then((data) => {
			res.render('shop/product-list', {
				prods: data,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch((err) => console.log(err));
};

//? Controller for individual item details
exports.getProductDetail = (req, res) => {
	const prodId = req.params.productId;
	Product.findByPk(prodId)
		.then((item) => {
			res.render('shop/product-detail', {
				product: item,
				pageTitle: item.title,
				path: '/products',
			});
		})
		.catch((err) => console.log(err));
};

exports.getIndex = (req, res) => {
	Product.findAll()
		.then((data) => {
			res.render('shop/index', {
				prods: data,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch((err) => console.log(err));
};

//? Method to pull all cart items and then use their data
exports.getCart = (req, res) => {
	//? Gets the cart from the user logged in
	req.user
		.getCart()
		.then((cart) => {
			//? Then pull the products from the cart
			cart.getProducts().then((cartItemsArray) => {
				//? Then render the cart page with whatever content
				//? there is in the cart or just an empty cart
				res.render('shop/cart', {
					path: '/cart',
					pageTitle: 'Your Cart',
					cartItems: cartItemsArray,
				});
			});
		})
		.catch((e) => console.log(e));
};

//? Handles the POST request when clicking any "Add to Cart" buttons
exports.postCart = (req, res) => {
	const productoId = req.body.producto;
	let fetchedCart;
	let cartItemUnits = 1;
	req.user.getCart().then((cart) => {
		fetchedCart = cart;
		return cart
			.getProducts({ where: { id: productoId } })
			.then((cartItemArray) => {
				let cartItem;
				if (cartItemArray.length > 0) {
					cartItem = cartItemArray[0];
				}
				if (cartItem) {
					cartItemUnits = cartItemArray[0].cartItem.quantity + 1;
				}
				return Product.findByPk(productoId);
			})
			.then((producterino) => {
				fetchedCart.addProduct(producterino, { through: { quantity: cartItemUnits } });
				res.redirect('/cart');
			})
			.catch();
	});
};

//? Handles the POST request when clicking the "Delete" in /cart
exports.postCartDeletion = (req, res) => {
	//? Fetches the product id that is meant to be deleted
	const productoId = req.body.idOfItemToBeDeleted;

	//? Fetches this user's cart
	req.user
		.getCart()
		.then((cart) => {
			//? When you have the cart, find the specific item that the user
			//? is trying to delete, by fetching the database product matching
			//? the ID of the product the user clicked on
			return cart.getProducts({ where: { id: productoId } });
		})
		.then(([productino]) => {
			//? We destructure the data of .getProducts since that will give an array
			//? with both the product on index0 and a lot of useless crap on index1.
			//? We follow up using that item and destroying its instance in the cartItem
			//! It's important that we destroy the cartItem instance, NOT THE PRODUCT ITSELF!
			return productino.cartItem.destroy();
		})
		.then(() => {
			//? After the cartItem product instance, redirect the user to the cart
			//? page and display any remaining items in it, if any
			res.redirect('/cart');
		})
		.catch((e) => console.log(e));
};

//? Pulls the Order data and then pass it into the view to be rendered properly
exports.getOrders = (req, res) => {
	req.user
		.getOrders({ include: ['products'] })
		.then((orderino) => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orderino,
			});
		})
		.catch((e) => console.log(e));
};

//? Handles the POST request when proceeding to checkout from cart
exports.postOrders = (req, res) => {
	let fetchedCart;
	req.user
		.getCart()
		.then((cart) => {
			fetchedCart = cart;
			return cart.getProducts();
		})
		.then((products) => {
			return req.user
				.createOrder()
				.then((order) => {
					return order.addProducts(
						products.map((product) => {
							product.orderItem = { quantity: product.cartItem.quantity };
							return product;
						})
					);
				})
				.then(() => {
					return fetchedCart.setProducts(null);
				})
				.then(() => {
					res.redirect('/orders');
				})
				.catch((e) => console.log(e));
		})
		.catch((e) => console.log(e));
};

// exports.getCheckout = (req, res) => {
// 	res.render('shop/checkout', {
// 		path: '/checkout',
// 		pageTitle: 'Checkout',
// 	});
// };
