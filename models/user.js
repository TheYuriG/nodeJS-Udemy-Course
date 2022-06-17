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
		//? Connects to the database
		const db = getDB();

		//? Finds the user with the given ID
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

	getCart() {
		//? Connects to the database
		const db = getDB();

		//? Creates an array with all the products ID, so those can be used
		//? later to retrieve each individual product
		const productsArray = this.cart.items.map((i) => i.productId);

		return (
			db
				.collection('products')
				//? Search through the database with the IDs in the productsArray
				.find({ _id: { $in: productsArray } })
				.toArray() //? The database returns a pointer to each product
				//? which we then convert to an array
				.then((arrayOfProducts) => {
					//? Then we attach the quantity to each product
					return arrayOfProducts.map((product) => {
						//? Cycle through this copied cart for each product,
						//? match each product from the database to the product
						//? from the cart and attach the quantity to the cart product
						for (let i = 0; i < this.cart.items.length; i++) {
							if (this.cart.items[i].productId.toString() === product._id.toString()) {
								//? If the product ID matches the ID in the cart
								//? attach the quantity to the product
								return { ...product, quantity: this.cart.items[i].quantity };
							}
						}
					});
				})
		);
	}

	//? Processes the removal of one item from the cart when the user
	//? clicks the "Yeet this item" button
	removeFromCart(productId) {
		const db = getDB();
		//? Find the product in the cart
		const productIndex = this.cart.items.findIndex((item) => item.productId.toString() === productId.toString());
		this.cart.items.splice(productIndex, 1);
		return db
			.collection('users')
			.updateOne({ _id: new mongoDB.ObjectId(this._id) }, { $set: { cart: this.cart } })
			.then()
			.catch((err) => console.log(err));
	}

	//? This is the function that processes the "Order now!" button at the cart
	turnCartIntoOrder(fullyPopulatedCart) {
		//? Connect to the database first
		const db = getDB();

		//? Save to the database the order that is being completed from
		//? the current cart. This is important because the price at the moment
		//? of purchase is what matters for us, since it won't matter if the
		//? item has its price changed in the future. The user paid what they paid
		return db
			.collection('orders')
			.insertOne({ userID: this._id, cart: fullyPopulatedCart })
			.then(() => {
				//? After you save this order in the database,
				//? empty this user's cart and save that information to
				//? the database
				this.cart = { items: [] };
				return db
					.collection('users')
					.updateOne({ _id: new mongoDB.ObjectId(this._id) }, { $set: { cart: this.cart } });
			})
			.catch((err) => console.log(err));
	}

	//? Process and return the orders data when the user tries to access the
	//? orders page
	pullOrders() {
		//? Connect to the database first
		const db = getDB();

		//? Find all the orders that belong to the user
		return (
			db
				.collection('orders')
				.find({ userID: new mongoDB.ObjectId(this._id) })
				.toArray() //? The database returns a pointer to each order,
				//? so we need to turn the pointers into an array
				.then((orders) => orders) //? Return the matrix of orders
				//? with array of purchased items
				.catch((e) => console.log(e))
		);
	}
}

module.exports = User;
