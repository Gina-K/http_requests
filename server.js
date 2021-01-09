const http = require('http');
const url = require('url');
const hostname = '127.0.0.1';
const port = 8080;
const names = [];

const requestHandler = (request, response) => {
    const queryObject = url.parse(request.url, true).query;

    console.log(`Request to: ${request.url}`);
    console.log(`Method: ${request.method}`);

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');

    if (queryObject.name) {
        names.push(queryObject.name);
    }

    response.end(names.length ? `Hello, ${names.join(', ')}` : 'Hi there!\n');
}

const server = http.createServer(requestHandler);

server.listen(port, hostname, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`Server running at http://${hostname}:${port}`);
});