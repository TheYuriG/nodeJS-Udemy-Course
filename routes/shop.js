const express = require('express');

const shopController = require('../controllers/shop');
//? Imports the authentication check middleware to refuse connections if
//? not logged in
const isAuth = require('../util/is-auth.js');

const router = express.Router();

//? Loads the index starting page
router.get('/', shopController.getIndex);

//? Loads the products page that will display up to so many items
router.get('/products', shopController.getProducts);

//? Controller to the routes to different items
router.get('/products/:productId', shopController.getProductDetail);

//? Loads the "/cart" page, if the user is logged in
router.get('/cart', isAuth, shopController.getCart);

//? Handles the POST request from "Add to Cart" buttons and then redirects to GET /cart
router.post('/cart', isAuth, shopController.postCart);

//? Handles the deletion POST request from cart so the user can remove items before checkout, if the user is logged in
router.post('/cart-delete-item', isAuth, shopController.postCartDeletion);

//? Loads the "/orders" page, if the user is logged in
router.get('/orders', isAuth, shopController.getOrders);

//? Handles the POST request to "/order-this-cart" when clicking
//? the "Order Now!" button in "/cart"
router.post('/order-this-cart', isAuth, shopController.postOrders);

//? Displays an invoice for a specific order in pdf format
router.get('/invoice/:invoiceId', isAuth, shopController.getOrderInvoice);

module.exports = router;
