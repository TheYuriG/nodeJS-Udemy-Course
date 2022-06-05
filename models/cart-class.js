const fs = require('fs');
const path = require('path');

//? Creates a path to the initial file, then navigate to the data folder and then loads
//? the carterino.json file, if it exists. Creates it if it doesn't
const pathToCartData = path.join(path.dirname(require.main.filename), 'data', 'carterino.json');

//? Creates a class that will be responsible for creating, reading and managing the user cart
module.exports = class Cart {
	static addProductToCart(idOfItemToBeAdded, priceOfItemToBeAdded) {
		// Fetch previous cart saved on the disk
		fs.readFile(pathToCartData, (readingFileError, cartDataContent) => {
			let userCart = { products: [], totalPrice: 0.0 };
			if (!readingFileError) {
				userCart = JSON.parse(cartDataContent);
			}
			// Analyze the cart, look for existing product
			const existingProductArrayIndex = userCart.products.findIndex((prod) => prod.id === idOfItemToBeAdded);
			let updatedProduct;
			// Add new product if doesn't exist, increase quantity of product if it does
			if (existingProductArrayIndex >= 0) {
				// const theProduct = userCart.products[existingProductArrayIndex];
				userCart.products[existingProductArrayIndex].units++;
			} else {
				updatedProduct = { id: idOfItemToBeAdded, price: priceOfItemToBeAdded, units: 1 };
				userCart.products.push(updatedProduct);
			}
			userCart.totalPrice += +priceOfItemToBeAdded;
			//.toFixed(2);
			// userCart.products = [...cart.products];
			fs.writeFile(pathToCartData, JSON.stringify(userCart), (readingFileError) => {
				if (readingFileError) {
					console.log(readingFileError);
					// } else {
					// 	console.log('sucess, saved!', userCart);
				}
			});
		});
	}
};
