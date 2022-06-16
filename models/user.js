const mongoDB = require('mongodb');
const { getDB } = require('../util/base-of-data');

class User {
	constructor(email, username, password, cart, id) {
		this.username = username;
		this.password = password;
		this.email = email;
		this.cart = cart ? cart : { items: [] };
		this._id = id;
	}

	save() {
		const db = getDB();
		return db
			.collection('users') //? users is our accounts table
			.insertOne(this); //? this is the just created object
	}

	static findById(userID) {
		const db = getDB();
		return db.collection('users').findOne({ _id: new mongoDB.ObjectId(userID) });
	}

	addToCart(product) {
		const db = getDB();
		//? Cycle through the cart items array and check if the product is
		//? already in the cart and increase quantity if so.
		//? If not, add with quantity = 1
		const cartIndex = this.cart.items.findIndex((item) => item.productId.toString() === product._id.toString());

		//? Check if the item is already in the cart (index will be -1 if not)
		if (cartIndex >= 0) {
			//? Increase the quantity of the item in the cart
			this.cart.items[cartIndex].quantity++;

			//? Update the cart in the database and return as promise
			return db
				.collection('users')
				.updateOne({ _id: new mongoDB.ObjectId(this._id) }, { $set: { cart: this.cart } })
				.then()
				.catch((err) => console.log(err));
		}

		//? If the item doesn't exist in the cart, push to it with quantity = 1
		this.cart.items.push({ productId: new mongoDB.ObjectId(product._id), quantity: 1 });
		return db
			.collection('users')
			.updateOne({ _id: new mongoDB.ObjectId(this._id) }, { $set: { cart: this.cart } })
			.then()
			.catch((err) => console.log(err));
	}
}

module.exports = User;
