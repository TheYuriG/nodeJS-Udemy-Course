const express = require('express');

const shopController = require('../controllers/shop');
//? Imports the authentication check middleware to refuse connections if
//? not logged in
const isAuth = require('../util/is-auth.js');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

//? Controller to the routes to different items
router.get('/products/:productId', shopController.getProductDetail);

router.get('/cart', isAuth, shopController.getCart);

//? Handles the POST request from product-detail into cart and then redirects to GET /cart
router.post('/cart', isAuth, shopController.postCart);

//? Handles the deletion POST request from cart so the user can remove items before checkout
router.post('/cart-delete-item', isAuth, shopController.postCartDeletion);

//? Handles a GET request to /orders
router.get('/orders', isAuth, shopController.getOrders);

//? Handles the POST request to "/order-this-cart" when clicking
//? the "Order Now!" button in "/cart"
router.post('/order-this-cart', isAuth, shopController.postOrders);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
