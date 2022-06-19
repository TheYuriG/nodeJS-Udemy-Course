//? Require mongoose to setup the document schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//? Create a new schema for how an User is defined
const schemaForUsers = new Schema({
	name: { type: String, required: true }, //? All users need a name
	email: { type: String, required: true }, //? All users need an email
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

//? Export the user model to be used in the app
module.exports = mongoose.model('User', schemaForUsers);
