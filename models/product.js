const { getDB } = require('../util/base-of-data');

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

	save() {
		const db = getDB();
		return db
			.collection('products')
			.insertOne(this)
			.then()
			.catch((err) => console.log(err));
	}
}

module.exports = Product;
