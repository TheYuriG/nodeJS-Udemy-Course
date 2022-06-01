//? Require the NPM module express
const express = require('express');

//? Require the controller file so the middleware below knows what to do on each file
const adminController = require('../controllers/product-controller.js');

//? Setup the routing for the required HTML files
const router = express.Router();

//? /admin/add-product → GET + get product controller in the controllers folder
router.get('/add-product', adminController.getProduct);

//? /admin/add-product → POST + post product controller in the controllers folder
router.post('/add-product', adminController.postProduct);

//? Exporting the router to be accessed in other functions
module.exports = router;
