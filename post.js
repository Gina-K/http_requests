const http = require('http');

const options = {
    host: 'localhost',
    path: '/',
    port: '8080',
    method: 'POST'
};

callback = response => {
    let info = '';
    response.on('data', chunk => info += chunk);
    response.on('end', () => console.log(info));
}

http.request(options, callback).end();