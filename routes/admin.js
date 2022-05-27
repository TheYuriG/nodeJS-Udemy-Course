const express = require("express");
const path = require("path");

const router = express.Router();

const products = [];

//? /admin/add-product → GET
router.get("/add-product", (req, res) => {
  res.sendFile(path.join(__dirname, "../", "views", "get-product.html"));
});

//? /admin/add-product → POST
router.post("/add-product", (req, res) => {
  res.redirect("/");
  //? This pushes whatever items you added on the page to the array which is later
  //? served in HTML. The request is processed on the form HTML tag in the
  //? get-products.html page and then later served in shops.html page
  products.push({ title: req.body.title });
});

//? Exporting multiple things at once, so they need to
//? be accessed as properties of this file, regardless of how the file
//? is defined when summoned
module.exports = { routes: router, prod: products };
