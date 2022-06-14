const { getDB } = require('../util/base-of-data');
const mongoDB = require('mongodb');

class Product {
	constructor(
		// id,
		title,
		price,
		description,
		imageUrl
	) {
		// this.id = id;
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
	}

	//? Save the current class instance to the database
	save() {
		const db = getDB();
		return db
			.collection('products') //? products is our default table
			.insertOne(this) //? this is the just created object
			.then() //? you are supposed to console.log the result, but no
			.catch((err) => console.log(err));
	}

	//? Pulls all data from the database
	static fetchAll() {
		const db = getDB();
		//? Fetches data without expliciting what filter is needed
		return db
			.collection('products')
			.find()
			.toArray()
			.then((products) => {
				// console.log(products);
				return products;
			})
			.catch((err) => console.log(err));
		//? toArray() will dump the whole database in an array, which is only
		//? acceptable if you know your dataset is small, otherwise you should
		//? just stick to use pagination instead. This will be taught later
	}

	static findOne(productId) {
		const db = getDB();
		return db
			.collection('products')
			.find({ _id: new mongoDB.ObjectId(productId) })
			.next()
			.then((product) => product)
			.catch((err) => console.log(err));
	}
}

module.exports = Product;
