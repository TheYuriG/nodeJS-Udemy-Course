//? Pull the Cart class so we can delete items from Cart if they get
//? removed from the products database
const Cart = require('./cart-class');

//? Imports the database util
const db = require('../util/base-of-data.js');

module.exports = class Product {
	constructor(id, title, imageUrl, description, price) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}

	save() {
		return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [
			this.title,
			this.price,
			this.imageUrl,
			this.description,
		]);
	}

	static itemDeleteById(id) {}

	static fetchAll() {
		return db.execute('SELECT * FROM products');
	}

	static findBySingleId(id) {}
};
