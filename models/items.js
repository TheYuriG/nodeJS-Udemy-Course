//? Define the array where the items will be temporarily saved to
const products = [];

module.exports = class Product {
	constructor(tito) {
		this.title = tito;
	}

	save() {
		products.push(this);
	}

	static fetchAll() {
		return products;
	}
};
