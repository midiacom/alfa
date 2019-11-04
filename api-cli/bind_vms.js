var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

var request = require('request');

var request_sync = require('sync-request');

let url_api = "http://localhost:3000/vms"
let device_id = '5db37abe5cd8660024efb35c'

// let device_id = '5dbdfc2e3129d1002fad19d8'

function unbind(vmsid) {
    // unbind after n minutes
    setTimeout(function(){
        let url = `http://localhost:3000/vms/unbindSrc/${vmsid}/${device_id}/5000`;
        // console.log(url)
        var res = request_sync('GET', url);
        console.log(res.getBody());            
        console.log('Unbinded')
    }, 300 * 1000);    
}

// create the VMS
request(url_api, function (error, response, body) {
    var parsedBody = JSON.parse(body);
    // bind each VMS with the device
    // parsedBody.shift();
    for(i = 0; i < parsedBody.length; i++) {
        // bind
        let url = `http://localhost:3000/vms/bindSrc/${parsedBody[i]._id}/${device_id}/5000`;
        // console.log(url)
        var res = request_sync('GET', url);
        console.log(res.getBody());

        unbind(parsedBody[i]._id)
        waitfor(15000);
    }
});

function waitfor(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }