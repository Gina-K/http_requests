const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const fs = require('fs');
const hostname = '127.0.0.1';
const port = 8080;
const dbName = "names.json";
let users = [];

const readNamesFromFile = (req, res, next) => {
    if (fs.existsSync(dbName)) {
        users = JSON.parse(fs.readFileSync(dbName, 'utf8'));
        console.log('>>> names read from file:', users);
    }
    next();
}

const printReqProperties = (req, res, next) => {
    console.log(`Request to: ${req.url}`);
    console.log(`Method: ${req.method}`);
    next();
}

const getHandler = (req, res) => {
    res.status(200).set('Content-Type', 'text/plain');
    res.send('Hi there!\n');
}

let checkAuthorisation = (req, res, next) => {
    const key = 'IKnowYourSecret';
    const value = 'TheOwlsAreNotWhatTheySeem';
    let isAuthorized = req.headers[key.toLowerCase()] === value;

    if (isAuthorized === true) {
        next();
    } else {
        res.status(401).set('Content-Type', 'text/plain');
        res.send('Please authorise with correct custom header. \n');
    }
}

const postAuthorizedHandler = (req, res) => {
    if (req.body.name) {
        let name = req.body.name;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        users.push({name: name, ip: ip});
        fs.writeFile(dbName, JSON.stringify(users), (err) => {
            if (err) {
                throw err;
            }
        });
    }
    res.send(users.length ? `Hello, ${users.map(user => `${user.name} from ${user.ip}`).join(', ')}` : 'Hi there!\n');
}

const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.status(418).send('Something broke and now I\'m a teapot');
}

app.use(readNamesFromFile);
app.use(printReqProperties);

app.get('/', getHandler);

app.post('/', checkAuthorisation);
app.use(bodyParser.json());
app.use(postAuthorizedHandler);

app.use(errorHandling);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}!`);
});