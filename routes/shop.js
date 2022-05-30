//? NPM module import
const express = require('express');

//? Pulling the shop-controller file so the products can be served in this page
const shopController = require('../controllers/shop-controller.js');

//? Creation of the router controller from the express framework
const router = express.Router();

router.get('/', shopController.getShop);

module.exports = router;
