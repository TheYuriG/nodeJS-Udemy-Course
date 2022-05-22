const express = require("express");
const bodyParser = require("body-parser");

//? Pull express as a function that can handle routing
const app = express();

//? Uses the 'body-parser' package to parse text response bodies
app.use(bodyParser.urlencoded({ extended: false }));

//? Read from the folder and file to setup specific routes to be done
const adminRoutes = require("./routes/admin.js");
const shopRoutes = require("./routes/shop.js");

//? Routes to the admin routes, if that's what you can/want to access
app.use("/admin", adminRoutes);

//? Routes to the shop if the user can't access admin
app.use(shopRoutes);

//? Default catcher for 'Page Not Found' errors
app.use((req, res, next) => {
  res.status(404).send("<h1>Page not found!</h1>");
});

//? Starts the server and listen to a specific port
const port = 3000;
app.listen(port, () => {
  console.log("listening on port " + port);
});
