//? Core JS module import
const path = require("path");

//? NPM module import
const express = require("express");

//? Pulling the admin file so the products can be used and served in this page
const adminData = require("./admin.js");

//? Creation of the router controller from the express framework
const router = express.Router();

router.get("/", (req, res) => {
  console.log(adminData.prod);
  res.sendFile(path.join(__dirname, "../", "views", "shops.html"));
});

module.exports = router;
