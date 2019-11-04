var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var vms = [];

vms[0]  = '5dbf7f132afa08002fec9cfb'
vms[1]  = '5dbf7f142afa08002fec9cfc'
vms[2]  = '5dbf7f142afa08002fec9cfd'
vms[3]  = '5dbf7f152afa08002fec9cfe'
vms[4]  = '5dbf7f162afa08002fec9cff'
vms[5]  = '5dbf7f162afa08002fec9d00'
vms[6]  = '5dbf7f162afa08002fec9d01'
vms[7]  = '5dbf7f162afa08002fec9d02'
vms[8]  = '5dbf7f172afa08002fec9d03'
vms[9]  = '5dbf7f172afa08002fec9d04'
vms[10] = '5dbf7f172afa08002fec9d05'
vms[11] = '5dbf7f182afa08002fec9d06'
vms[12] = '5dbf7f182afa08002fec9d07'
vms[13] = '5dbf7f182afa08002fec9d08'
vms[14] = '5dbf7f182afa08002fec9d09'
vms[15] = '5dbf7f182afa08002fec9d0a'
vms[16] = '5dbf7f182afa08002fec9d0b'
vms[17] = '5dbf7f182afa08002fec9d0c'
vms[18] = '5dbf7f192afa08002fec9d0d'
vms[19] = '5dbf7f192afa08002fec9d0e'

for (i = 0; i < 20; i++) {
    // 5db37abe5cd8660024efb355 it is the udp to udp vms
    let port = 10001+i
    var postData = querystring.stringify({
        'vmsType': '5db37abe5cd8660024efb355',
        'id': vms[i],
        'startupParameters': `172.17.0.1 ${port}`
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

        res.on('data', (d) => {
            data += d;
            console.log(data)
        })

        res.on('end', () => {
            console.log('VMS Started:', data);
        });
    });
    
    req.on('error', (e) => {
        console.log(`Houve um erro: ${e.message}`);
    });
    
    // aqui podes enviar data no POST
    req.write(postData);
    req.end();
}