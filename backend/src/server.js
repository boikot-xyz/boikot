import http from "http";


const server = http.createServer((req, res) => {
    // This function is called once the headers have been received
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8015");

    // This function is called as chunks of body are received
    req.on("data", (data) => {
        body += data;
    });

    // This function is called once the body has been fully received
    req.on("end", () => {
        try {
            res.statusCode = 200;
            res.end(`hi`);
        } catch (e) {
            res.statusCode = 400;
            res.end(`error`);
        }
    });
});

server.listen(8014, () => {
    console.log("Server running at http://localhost:8014/");
});

