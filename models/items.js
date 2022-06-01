//? Core module
const fs = require('fs');
const path = require('path');

module.exports = class Product {
	constructor(tito) {
		this.title = tito;
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
				console.log(writeFileError);
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
