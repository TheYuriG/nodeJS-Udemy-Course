const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

//? Loads all products but on the admin end
router.get('/products', adminController.getProducts);

//? Loads the page with the form to add a new item. Despite the route being
//? to "/add", this will actually load "/edit" as "/add" was deleted previously
router.get('/add-product', adminController.getAddProduct);

//? Handles the request to adding a new item to the database
router.post('/add-product', adminController.postAddProduct);

//? Edit a specific product that already belongs to the database
//? while supplying all of its initial data to hasten the edit process
router.get('/edit-product/:productId', adminController.getEditProduct);

//? Handles the request to editing an item from the database
router.post('/edit-product', adminController.postEditProduct);

module.exports = router;
