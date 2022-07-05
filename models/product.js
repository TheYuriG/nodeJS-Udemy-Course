//? Require the mongoose module to setup the document schema
const mongoose = require('mongoose');

//? Create a new schema for how a Product is defined
const Schema = mongoose.Schema;
const schemaForProducts = new Schema({
	title: { type: String, required: true }, //? All products need a title
	price: { type: Number, required: true }, //? All products need a price
	imagePath: { type: String, required: true }, //? All products need an image
	description: { type: String, required: true }, //? All products need a description
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, //? All products need a
	//? userId that created them. We also need to link the userId to the User model
});

//? Export the user model to be used in the controllers
module.exports = mongoose.model('Product', schemaForProducts);
