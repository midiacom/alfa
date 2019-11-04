const request = require("supertest")
const app = require('../src/app')
const vmsTypeModel = require("../src/models/vmsTypeModel")
const vmsModel = require("../src/models/vmsModel")
const locationModel = require("../src/models/locationModel")
const deviceModel = require("../src/models/deviceModel")
const mongoose = require('mongoose');
const docker = require("../src/util/dockerApi")

const mqtt = require('mqtt')

let id_vmsPlugin = null;
let id_device = null;

afterEach(async () => {
    await vmsModel.deleteMany()
    await vmsTypeModel.deleteMany()
})

beforeEach(async () => {
    await vmsModel.deleteMany()

    const location = await new locationModel({"name": "Test"}).save()

    const device = await new deviceModel({
        "name": "Cel Test",
        "physicalPath": "",
        "connectionType": "alfa/src/rtsp_to_udp",
        "connectionParameters": "rtsp://192.168.0.102:8080/h264_ulaw.sdp",
        "location": location._id
    }).save()
    
    id_device = device._id
    // set the first vms type
    // "startupParameters": "172.17.0.1 5001"
    const vmsPlugin = await new vmsTypeModel({
        "name": "UDP to UDP",
        "dockerImage": "alfa/plugin/udp_to_udp"
    }).save()
    id_vmsPlugin = vmsPlugin._id
})

test('Start test one to one', async () => {    
    // start the SRC
    console.log(`Start Device 1`)
    response = await request(app)
    .get(`/device/${id_device}/startSrc`)
    .expect(201)    
    
    // loop that start SRC and Plugins    
    for (i = 0; i < 5; i++) {        
        console.log(`Start Plugin ${i}`)
        // cria o Plugin 
        let vms = {
            "vmsType": id_vmsPlugin,
            "startupParameters": `172.17.0.1 500${i}`,
        }
    
        response = await request(app)
            .post('/vms')
            .send(vms)
            .expect(201)
            
        console.log(`Bind  ${i}`)
        waitfor(5000)        
        response = await request(app)
            .get(`/vms/bindSrc/${response.body._id}/${id_device}`)
            .expect(201)
        console.log("------------------");
    }

}, 500000)


function waitfor(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }

 

/*
test('Start test one to one', async () => {    
    // loop that start SRC and Plugins    
    for (i = 0; i < 20; i++) {        
        // starta o SRC
        console.log(`Start Device ${i}`)
        response = await request(app)
            .get(`/device/${id_device}/startSrc`)
            .expect(201)    
        
        console.log(`Start Plugin ${i}`)
        // cria o Plugin 
        let vms = {
            "vmsType": id_vmsPlugin,
            "startupParameters": `172.17.0.1 500${i}`,
        }
    
        response = await request(app)
            .post('/vms')
            .send(vms)
            .expect(201)
            
        console.log(`Bind  ${i}`)
        waitfor(5000)        
        response = await request(app)
            .get(`/vms/bindSrc/${response.body._id}/${id_device}`)
            .expect(201)
        console.log("------------------");
    }

}, 500000)

*/
