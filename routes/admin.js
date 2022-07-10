const express = require('express');

//? Imports all the admin controllers to be used in these admin routes
const adminController = require('../controllers/admin');
//? Imports the authentication check middleware to refuse connections if
//? not logged in
const isAuth = require('../util/is-auth.js');

const router = express.Router();

//? Loads all products but on the admin end
router.get('/products', isAuth, adminController.getProducts);

//? Loads the page with the form to add a new item. Despite the route being
//? to "/add", this will actually load "/edit" as "/add" was deleted previously
router.get('/add-product', isAuth, adminController.getAddProduct);

//? Handles the request to adding a new item to the database
router.post('/add-product', isAuth, adminController.postAddProduct);

//? Edit a specific product that already belongs to the database
//? while supplying all of its initial data to hasten the edit process
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

//? Handles the request to editing an item from the database
router.post('/edit-product', isAuth, adminController.postEditProduct);

//? Handles the item deletion request button on /admin/products
router.delete('/delete-product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
