//? Core module
const fs = require('fs');
const path = require('path');

module.exports = class Product {
	//? on the constructor, we are using different names so it's clear what is being
	//? added and what is being constructed
	constructor(tito, imago, descripto, prico) {
		this.title = tito;
		this.imageUrl = imago;
		this.description = descripto;
		this.price = prico;
	}

	save() {
		const pathToBooksJSON = path.join(__dirname, '..', 'data', 'savedBooks.json');
		fs.readFile(pathToBooksJSON, (errorMessage, contentFromFile) => {
			let products = [];
			if (!errorMessage) {
				products = JSON.parse(contentFromFile);
			}
			products.push(this);
			fs.writeFile(pathToBooksJSON, JSON.stringify(products), (writeFileError) => {
				if (writeFileError) {
					console.log(writeFileError);
				}
			});
		});
	}

	static fetchAll(callbackToBeUsed) {
		const pathToBooksJSON = path.join(__dirname, '..', 'data', 'savedBooks.json');
		fs.readFile(pathToBooksJSON, (errorMessage, contentFromFile) => {
			if (errorMessage || !contentFromFile) {
				return callbackToBeUsed([]);
			}
			callbackToBeUsed(JSON.parse(contentFromFile));
		});
	}
};
