const fs = require('fs');
const path = require('path');
const Cart = require('./cart-class');

const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');

const getProductsFromFile = (cb) => {
	fs.readFile(p, (err, fileContent) => {
		if (err) {
			cb([]);
		} else {
			cb(JSON.parse(fileContent));
		}
	});
};

module.exports = class Product {
	constructor(id, title, imageUrl, description, price) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}

	save() {
		getProductsFromFile((products) => {
			if (this.id) {
				const existingProductIndex = products.findIndex((produrino) => produrino.id === this.id);
				products[existingProductIndex] = this;
			} else {
				this.id = Math.ceil(1000 * Math.random()).toString();
				products.push(this);
			}
			fs.writeFile(p, JSON.stringify(products), (err) => {
				if (err) console.log(err);
			});
		});
	}

	static itemDeleteById(id) {
		getProductsFromFile((products) => {
			const existingProductIndex = products.findIndex((produrino) => produrino.id === id);
			if (existingProductIndex >= 0) {
				products.splice(existingProductIndex, 1);
				fs.writeFile(p, JSON.stringify(products), (err) => {
					if (err) console.log(err);
				});
				Cart.yeetTheProduct(id);
			} else {
				console.log(`Item with ${id} doesn't exist!`);
			}
		});
	}

	static fetchAll(cb) {
		getProductsFromFile(cb);
	}

	static findBySingleId(id, callbackForOneID) {
		getProductsFromFile((products) => {
			const product = products.find((prodin) => prodin.id === id);
			callbackForOneID(product);
		});
	}
};
