//? Require mongoose to setup the document schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//? Create a new schema for how an Order is defined
const schemaForOrders = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, //? All orders belong to an User
	items: [
		{
			productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
			title: { type: String, required: true }, //? Name of this purchased item
			price: { type: Number, required: true }, //? Price of this purchased item
			imageUrl: { type: String, required: true }, //? Image link/reference of this purchased item
			description: { type: String, required: true }, //? Description of this purchased item
			quantity: { type: Number, required: true }, //? Number of items purchased in this order
		},
	],
});

module.exports = mongoose.model('Order', schemaForOrders);
