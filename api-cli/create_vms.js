var querystring = require('querystring');
var http = require('http');
var fs = require('fs');


let dest = 10000;

for (i = 1; i <= 20; i++) {
    dest = 10000+i;
    // 5db37abe5cd8660024efb355 it is the udp to udp vms
    var postData = querystring.stringify({
        'vmsType' : '5db37abe5cd8660024efb355',
        'startupParameters': `172.17.0.1 ${dest}`,
        'name': dest
    });

    var options = {
        hostname: 'localhost',
        port: 3000,
        path: '/vms',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    var req = http.request(options, (res) => {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
            console.log('VMS Created:', data);
        });
    });
    
    req.on('error', (e) => {
        console.log(`Houve um erro: ${e.message}`);
    });
    
    // aqui podes enviar data no POST
    req.write(postData);
    req.end();
}


/*
var request = require('request');

let url_api = "http://localhost:3000"

// create the VMS
request(url_api, function (error, response, body) {
console.log('error:', error); // Print the error if one occurred
console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
console.log('body:', body); // Print the HTML for the Google homepage.

var parsedBody = JSON.parse(body);

console.log(parsedBody.title)
});*/