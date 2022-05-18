const http = require("http");
const fs = require("fs");

//? Create server
const server = http.createServer((req, res) => {
  //   console.log(req.url, req.method, req.headers);
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>My First Page</title><head>");
    res.write(
      //? Using "sentData" here instead of "message" to practice the class
      '<body><form action="/message" method="POST"><input type="text" name="sentData"><button type="submit">Send</button></form></body>'
    );
    res.write("</html>");
    return res.end();
  } else if (url === "/message" && method === "POST") {
    //? Initializes an empty array to parse request data
    const body = [];

    //? request data is sent in chunks/blocks because
    //? the browser is unable to know how long are any of the files
    //? the user is sending until the transfer is complete
    req.on("data", (chunkOfData) => {
      //? chunkOfData are the chunks being received, we will
      //?save those chunks into the body array until the request data finishes uploading
      //   console.log(chunkOfData);
      body.push(chunkOfData);
    });

    //? After the request finishes uploading, this is triggered and then we can parse
    //? all the chunks of data into a single file that makes sense and is useful
    req.on("end", () => {
      //? Since the data being sent is just a simple text, we concat the content of the body
      //? and save it to disk
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      const finalInput = decodeURI(parsedBody.replace("sentData=", "").replace(/\+/g, " "));
      fs.writeFile("message.txt", finalInput, (err) => {
        if (err) {
          console.log(err);
        }
      });
      res.writeHead(302, { Location: "/" });
      return res.end();
    });
  }
  //! process.exit() exits Event Loop
  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>My First Page</title><head>");
  res.write("<body><h1>Hello from my NodeJS server!</h1></body>");
  res.write("</html>");
  res.end();
});

//? Listen to the server, so it's always online and you can respond to network requests
server.listen(3000);
