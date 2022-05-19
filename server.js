const http = require("http");
const routes = require("./routes.js");

//? Create server
const server = http.createServer(routes.handler);

//? Listen to the server, so it's always online and you can respond to network requests
server.listen(3000);
