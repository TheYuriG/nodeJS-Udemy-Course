const mongoDB = require('mongodb');

class Product {
	constructor(
		// id,
		title,
		price,
		description,
		imageUrl,
		id,
		userId
	) {
		// this.id = id;
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new mongoDB.ObjectId(id) : null;
		this.userId = userId;
	}

	//? Save the current class instance to the database
	save() {
		const db = getDB();
		if (this._id) {
			return db
				.collection('products') //? products is our default table
				.updateOne(
					{ _id: this._id }, //? This is the filter
					//? which is used to find which is the document we are trying to update
					{ $set: this } //? $set is a special mongo keyword for updating the
					//? entire object of data. "this" provides the same key-value pairs to
					//? $set to use to replace the document data
				)
				.then() //? you are supposed to console.log the result, but no we ain't
				.catch((err) => console.log(err));
		} else {
			return db
				.collection('products') //? products is our default table
				.insertOne(this) //? this is the just created object
				.then() //? you are supposed to console.log the result, but no we ain't
				.catch((err) => console.log(err));
		}
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

	static deleteById(productId) {
		const db = getDB();
		return db
			.collection('products')
			.deleteOne({ _id: new mongoDB.ObjectId(productId) })
			.then(() => {
				console.log('Sucessfully deleted item');
			})
			.catch();
	}
}

module.exports = Product;
