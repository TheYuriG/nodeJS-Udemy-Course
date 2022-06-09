const fs = require('fs');
const path = require('path');

//? Creates a path to the initial file, then navigate to the data folder and
//? then loads the carterino.json file, if it exists. Creates it if it doesn't
const pathToCartData = path.join(path.dirname(require.main.filename), 'data', 'carterino.json');

//? Creates a class that will be responsible for creating,
//? reading and managing the user cart
module.exports = class Cart {
	static addProductToCart(idOfItemToBeAdded, priceOfItemToBeAdded) {
		//? Checks if there is an old cart saved and fetches it data if so
		fs.readFile(pathToCartData, (readingFileError, cartDataContent) => {
			//? Defines the cart for this user as empty to populate it if
			//? the user had a saved cart or supply a new one if not
			let userCart = { products: [], totalPrice: 0.0 };
			if (!readingFileError) {
				//? If reading the file doesn't error, replace current cart
				//? with old cart
				userCart = JSON.parse(cartDataContent);
			}
			//? Check if the cart, new or old, contains the item that is being
			//? attempted to get added. Searches the cart by the item ID and returns
			//? the index of the item if found, returns -1 otherwise
			const existingProductArrayIndex = userCart.products.findIndex((prod) => prod.id === idOfItemToBeAdded);
			//? Checks if the product was found in the array
			//? (will return 0 or greater as index number)
			if (existingProductArrayIndex >= 0) {
				//? If the item was found within the array using findIndex(),
				//? increase the number of units for this item in the cart
				userCart.products[existingProductArrayIndex].units++;
			} else {
				//? If the item wasn't found, push the data of this item to the cart
				userCart.products.push({ id: idOfItemToBeAdded, price: priceOfItemToBeAdded, units: 1 });
			}
			//? Half-ass calculate the total price of the cart as taught in the lesson
			// TODO refactorate this to actually iterate the array and multiply
			// TODO item price * item units to get the actual price (use reduce())
			userCart.totalPrice += +priceOfItemToBeAdded; //? A plus sign just before a variable is the shorthand way to convert the variable to number
			//? Once all the data processing has been done, save the file to "carterino.json"
			fs.writeFile(pathToCartData, JSON.stringify(userCart), (readingFileError) => {
				if (readingFileError) {
					console.log(readingFileError);
					// } else {
					// 	console.log('sucess, saved!', userCart);
				}
			});
		});
	}

	//? Static function to remove an item from the cart
	//? This gets called from within the Product class for now, but will
	//? also be called from inside the cart page at a later point
	static yeetTheProduct(itemDeletionId) {
		//? Read the carterino.json file to fetch the userCart
		fs.readFile(pathToCartData, (readingFileError, cartDataContent) => {
			if (readingFileError) {
				return;
			}
			let userCart = JSON.parse(cartDataContent);

			//? Finds the position of the item in the cart for now
			//! Optionally, you could just retrieve the product with .find()
			const removedProductArrayIndex = userCart.products.findIndex(
				(producterino) => producterino.id === itemDeletionId
			);

			//? This is an error checked in case this item doesn't exist in
			//? the cart, therefore skips trying to delete such item
			if (removedProductArrayIndex == -1) {
				return;
			}

			console.log('old cart price', userCart.totalPrice);

			//? Update userCart totalPrice property considering the price of the
			//? item and how many times it had been added to the cart
			userCart.totalPrice -=
				userCart.products[removedProductArrayIndex].price * userCart.products[removedProductArrayIndex].units;
			console.log('removed item quantity (units)', userCart.products[removedProductArrayIndex].units);
			console.log('removed item individual price', userCart.products[removedProductArrayIndex].price);
			console.log('updated cart price', userCart.totalPrice);

			//? Finally remove the item from the cart and update the userCart totalPrice property
			//! Optionally, you could remove the item with .filter()
			userCart.products.splice(removedProductArrayIndex, 1);

			//? Save the updated cart (without the item and with its totalPrice updated)
			//? back to the carterino.json file again
			fs.writeFile(pathToCartData, JSON.stringify(userCart), (readingFileError) => {
				if (readingFileError) {
					console.log(readingFileError);
				} else {
					console.log('items removed, updated cart saved!');
				}
			});
		});
	}

	static getCart(callbackToFetchedCart) {
		fs.readFile(pathToCartData, (failedToLoadCart, cartLoaded) => {
			if (failedToLoadCart) {
				callbackToFetchedCart(null);
			} else {
				callbackToFetchedCart(JSON.parse(cartLoaded));
			}
		});
	}
};
