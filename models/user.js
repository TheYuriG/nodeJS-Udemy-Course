//? Require mongoose to setup the document schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//? Create a new schema for how an User is defined
const schemaForUsers = new Schema({
	name: { type: String, required: true }, //? All users need a name
	email: { type: String, required: true }, //? All users need an email
	password: { type: String, required: true }, //? All users need a password
	cart: {
		//? All users need a cart
		items: [
			{
				productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
				//? Carts are composed of a product ID that will point to a product, but
				//? won't hold the product data itself
				quantity: { type: Number, required: true }, //? The cart should also hold
				//? the quantity of the product
			},
		],
	},
});

//? Add our own custom methods to the mongoose schema
schemaForUsers.methods.addToCart = function (product) {
	//? Look through the cart items to see if the product is already in the cart
	const cartProductIndex = this.cart.items.findIndex(
		(cartProduct) => cartProduct.productId.toString() === product._id.toString()
	);

	//? If the product is already in the cart, increase the quantity
	if (cartProductIndex >= 0) {
		this.cart.items[cartProductIndex].quantity++;
	}
	//? If the product is not in the cart, add it to the cart
	else {
		this.cart.items.push({
			productId: product._id,
			quantity: 1,
		});
	}

	//? Update the cart of the user
	return this.save();
};

//? Add custom method to retrieving user cart items
schemaForUsers.methods.getCart = function () {
	//? Return the cart of the user already populated by productId data
	//! Note that this won't replace productId with the product data, but
	//! rather, it will nest the data inside productId. This is
	//! addressed inside the EJS templating files
	return this.cart.populate('items.productId');
};

//? Adds a custom method to remove a product from the cart
schemaForUsers.methods.removeFromCart = function (productId) {
	//? Find the product in the cart
	const cartProductIndex = this.cart.items.findIndex(
		(cartProduct) => cartProduct.productId.toString() === productId.toString()
	);

	//? If the product is in the cart, remove it
	if (cartProductIndex >= 0) {
		this.cart.items.splice(cartProductIndex, 1);
	}

	//? If the product is not in the cart, do nothing
	else {
		console.log('This product is not in your cart');
	}

	//? Update the cart of the user
	return this.save();
};

//? Export the user model to be used in the app
module.exports = mongoose.model('User', schemaForUsers);
