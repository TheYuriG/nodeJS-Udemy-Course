const Sequelize = require('sequelize');

//? Pull the Cart class so we can delete items from Cart if they get
//? removed from the products database
const Cart = require('./cart-class');

//? Imports the database util
const seq = require('../util/base-of-data.js');

//? Defines what the DB should use or create as default table
const Product = seq.define('product', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	title: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	price: {
		type: Sequelize.DOUBLE,
		allowNull: false,
	},
	imageUrl: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	description: {
		type: Sequelize.STRING,
		allowNull: false,
	},
});

module.exports = Product;
// {
// 	constructor(id, title, imageUrl, description, price) {
// 		this.id = id;
// 		this.title = title;
// 		this.imageUrl = imageUrl;
// 		this.description = description;
// 		this.price = price;
// 	}

// 	save() {
// 		return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [
// 			this.title,
// 			this.price,
// 			this.imageUrl,
// 			this.description,
// 		]);
// 	}

// 	static itemDeleteById(id) {}

// 	static fetchAll() {
// 		return db.execute('SELECT * FROM products');
// 	}

// 	static findBySingleId(id) {
// 		return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
// 	}
// };
