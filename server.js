const http = require('http');
const url = require('url');
const fs = require('fs');
const hostname = '127.0.0.1';
const port = 8080;
const dbName = "names.json";
let users = [];

if (fs.existsSync(dbName)) {
    users = JSON.parse(fs.readFileSync(dbName, 'utf8'));
    console.log('>>> names read from file:', users);
}

const checkAuthorisation = request => {
    const key = 'IKnowYourSecret';
    const value = 'TheOwlsAreNotWhatTheySeem';

    return request.method === "POST" && request.headers[key.toLowerCase()] === value;
}

const requestHandler = (request, response) => {
    console.log(`Request to: ${request.url}`);
    console.log(`Method: ${request.method}`);

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');

    if (request.method === 'GET') {
        response.end('Hi there!\n');
    } else if (checkAuthorisation(request)) {
        let data = '';
        request.on('data', chunk => {
            data += chunk;
        })
        request.on('end', () => {
            data = JSON.parse(data);

            if (data.name) {
                let name = data.name;
                let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
                users.push({name: name, ip: ip});
                fs.writeFile(dbName, JSON.stringify(users), (err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
            response.end(users.length ? `Hello, ${users.map(user => `${user.name} from ${user.ip}`).join(', ')}` : 'Hi there!\n');
        });
    }

}

const server = http.createServer(requestHandler);

server.listen(port, hostname, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`Server running at http://${hostname}:${port}!`);
});