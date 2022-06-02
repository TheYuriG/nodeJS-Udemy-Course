//? NPM module import
const express = require('express');

//? Pulling the shop-controller file so the products can be served in this page
const shopController = require('../controllers/shop-controller.js');

//? Creation of the router controller from the express framework
const router = express.Router();

//? Welcome the user to the main page, with no items displayed
router.get('/', shopController.getHome);

//? Display all items on sale to the user
router.get('/products', shopController.getShop);

//? Show the user their shopping cart with whatever items they might have added
router.get('/cart', shopController.getCart);

//? Display additional details on any inspected product
router.get('/product-detail', shopController.getItemDetails);

//? Show post-purchase data and delivery details
router.get('/checkout', shopController.getCheckout);

//? Show post-purchase data and delivery details
router.get('/orders', shopController.getOrders);

module.exports = router;
