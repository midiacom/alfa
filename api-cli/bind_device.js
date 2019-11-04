var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var request = require('request');

var request_sync = require('sync-request');

let url_api_vms = "http://localhost:3000/vms"
let url_api_device = "http://localhost:3000/device"

vms = []
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

device = []
device[0] = '5db37abe5cd8660024efb35c'
device[1] = '5dbf7dd92afa08002fec9ce8'
device[2] = '5dbf7dd92afa08002fec9ce9'
device[3] = '5dbf7dd92afa08002fec9cf7'
device[4] = '5dbf7dd92afa08002fec9cf3'
device[5] = '5dbf7dd92afa08002fec9cee'
device[6] = '5dbf7dd92afa08002fec9cea'
device[7] = '5dbf7dd92afa08002fec9cfa'
device[8] = '5dbf7dd92afa08002fec9cf5'
device[9] = '5dbf7dd92afa08002fec9cf0'
device[10] = '5dbf7dd92afa08002fec9cf2'
device[11] = '5dbf7dd92afa08002fec9ced'
device[12] = '5dbf7dd92afa08002fec9cf8'
device[13] = '5dbf7dd92afa08002fec9ceb'
device[14] = '5dbf7dd92afa08002fec9cef'
device[15] = '5dbf7dd92afa08002fec9cf4'
device[16] = '5dbf7dd92afa08002fec9cf9'
device[17] = '5dbf7dd92afa08002fec9cec'
device[18] = '5dbf7dd92afa08002fec9cf1'
device[19] = '5dbf7dd92afa08002fec9cf6'


function unbind(vms_id, device_id) {
    // unbind after n minutes
    setTimeout(function(){
        let url = `http://localhost:3000/vms/unbindSrc/${vms_id}/${device_id}/5000`;
        // console.log(url)
        var res = request_sync('GET', url);
        console.log(res.getBody());            
        console.log('Unbinded')
    }, 300 * 1000);    
}

function waitfor(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }


for (i = 0; i < 20; i++) {
    let device_id = device[i];
    let vms_id = vms[i];

    let url_start_src = `http://127.0.0.1:3000/device/${device_id}/startSrc`
    var res = request_sync('GET', url_start_src);
    waitfor(5000);

    let url_bind_vms = `http://localhost:3000/vms/bindSrc/${vms_id}/${device_id}/5000`
    // console.log(url_bind_vms)
    var res = request_sync('GET', url_bind_vms);
    waitfor(5000);
    unbind(vms_id, device_id)
}

/*
// create the VMS
request(url_api_device, function (error, response, body) {
    var parsedBody = JSON.parse(body);
    // bind each VMS with the device
    // parsedBody.shift();
    for(i = 0; i < 2; i++) {
        // bind
        let url = `http://localhost:3000/vms/bindSrc/${parsedBody[i]._id}/${device_id}/5000`;
        // console.log(url)
        var res = request_sync('GET', url);
        console.log(res.getBody());

        unbind(parsedBody[i]._id)
        waitfor(15000);
    }
});
*/
