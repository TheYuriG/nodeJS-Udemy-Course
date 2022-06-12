const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

//? Controller to the routes to different items
router.get('/products/:productId', shopController.getProductDetail);

router.get('/cart', shopController.getCart);

//? Handles the POST request from product-detail into cart and then redirects to GET /cart
router.post('/cart', shopController.postCart);

//? Handles the deletion POST request from cart so the user can remove items before checkout
router.post('/cart-delete-item', shopController.postCartDeletion);

//? Handles a GET request to /orders
router.get('/orders', shopController.getOrders);

//? Handles the POST request to "/order-this-cart" when clicking
//? the "Order Now!" button in "/cart"
router.post('/order-this-cart', shopController.postOrders);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;
