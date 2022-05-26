const express = require("express");
const path = require("path");

const router = express.Router();

//? /admin/add-product → GET
router.get("/add-product", (req, res) => {
  res.sendFile(path.join(__dirname, "../", "views", "get-product.html"));
});

//? /admin/add-product → POST
router.post("/add-product", (req, res) => {
  res.redirect("/");
  console.log(req.body);
});

module.exports = router;
