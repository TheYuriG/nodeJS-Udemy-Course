//? Core JS module import
const path = require('path');

//? NPM module import
const express = require('express');

//? Pulling the admin file so the products can be used and served in this page
const adminData = require('./admin.js');

//? Creation of the router controller from the express framework
const router = express.Router();

router.get('/', (req, res) => {
	//? loading the array with whatever was written in the box at get-product.html
	const laProducione = adminData.prod;
	//? render the html page based on the pug engine we defined on the server.js
	//? and shops.pug file that we added to the views folder
	// res.render('shops', {
	// 	leProdo: laProducione,
	// 	pageTitle: 'Main Shop Screen',
	// 	path: 'Home',
	// });
	//? we also pass whatever we want to be rendered in the pug file as
	//? additional arguments, including the path variable in order to render
	//? the CSS for the header properly, highlighting the proper link in

	//? same render, but for handlebars
	res.render('shops', {
		leProdo: laProducione,
		pageTitle: 'Main Shop Screen',
		hasProdos: laProducione.length > 0,
		userIsInShopPage: true,
	});
});

module.exports = router;
