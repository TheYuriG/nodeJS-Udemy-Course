const mongoDB = require('mongodb');
const { getDB } = require('../util/base-of-data');

class User {
	constructor(email, username, password, cart, id) {
		this.username = username;
		this.password = password;
		this.email = email;
		this.cart = cart;
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
		// const CartProduct = this.cart.items.findIndex((item) => item._id === product._id);
		const updatedCart = { items: [{ _id: new mongoDB.ObjectId(product._id), quantity: 1 }] };
		const db = getDB();
		return db
			.collection('users')
			.updateOne({ _id: new mongoDB.ObjectId(this._id) }, { $set: { cart: updatedCart } })
			.then(() => {})
			.catch((err) => console.log(err));
	}
}

module.exports = User;
