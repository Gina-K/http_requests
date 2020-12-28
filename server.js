const http = require('http');
const hostname = '127.0.0.1';
const port = 8080;

const requestHandler = (request, response) => {
    for (const header in request.headers) {
        console.log(`${header}: ${request.headers[header]}`);
    }
    console.log(`Request to: ${request.url}`);
    console.log(`Method: ${request.method}`);

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Hello there!\n');
}

const server = http.createServer(requestHandler);

server.listen(port, hostname, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`Server running at http://${hostname}:${port}`);
});