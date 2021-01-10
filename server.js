const http = require('http');
const url = require('url');
const fs = require('fs');
const hostname = '127.0.0.1';
const port = 8080;
const dbName = "names.json";
let users = [];

function User(name, ip) {
    this.name = name;
    this.ip = ip;
}

User.prototype.toString = function userToString() {
    return `${this.name} from ${this.ip}`
}

if (fs.existsSync(dbName)) {
    users = JSON.parse(fs.readFileSync(dbName, 'utf8'));
    console.log('>>> names read from file:', users);
}

const checkAuthorisation = request => {
    const key = 'IKnowYourSecret';
    const value = 'TheOwlsAreNotWhatTheySeem';

    if (request.method === "POST") {
        return true
    }
}

const requestHandler = (request, response) => {
    const queryObject = url.parse(request.url, true).query;

    console.log(`Request to: ${request.url}`);
    console.log(`Method: ${request.method}`);

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');

    if (checkAuthorisation(request)) {
        if (queryObject.name) {
            let name = queryObject.name;
            let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            let user = new User(name, ip);
            users.push(user);
            fs.writeFile(dbName, JSON.stringify(users), (err) => {
                if (err) {
                    throw err;
                }
            });
        }
    }

    response.end(users.length ? `Hello, ${users.join(', ')}` : 'Hi there!\n');
}

const server = http.createServer(requestHandler);

server.listen(port, hostname, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`Server running at http://${hostname}:${port}!`);
});