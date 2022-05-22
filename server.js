const express = require("express");

//? Pull express as a function that can handle routing
const app = express();

//? This is the first middleware, all your requests will go here before anywhere else
app.use((req, res, next) => {
  console.log("in the middleware");
  next(); //? This allows the request to continue to the next middleware in line
});

//? This is the second middleware, the code will only run here if the previous
//? middleware had called for 'next()'
app.use((req, res, next) => {
  console.log("in another middleware");
  res.send("<h1>Hello from Express!</h1>");
});

//? Starts the server and listen to a specific port
app.listen(3000);
