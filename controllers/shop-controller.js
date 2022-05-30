//? Pulling the product-controller file so the products can be served in this page
const productsData = require('./product-controller.js').products;

exports.getShop = (req, res) => {
	//? loading the array with whatever was written in the box at get-product.html
	const laProducione = productsData;
	res.render('shops', {
		leProdo: laProducione,
		pageTitle: 'Main Shop Screen',
	});
};
