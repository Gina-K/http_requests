const https = require('https');

const options = {
    host: 'swapi.dev',
    path: '/api/people/1/'
};

callback = response => {
    console.log("it works!");

    let info = '';

    response.on('data', chunk => info += chunk);
    response.on('end', () => console.log(info));
}

https.request(options, callback).end();