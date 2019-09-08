const request = require("supertest")
const app = require('../src/app')
const deviceModel = require("../src/models/deviceModel")
const locationModel = require("../src/models/locationModel")
const mongoose = require('mongoose');

let id_locationOne = null;
let id_locationTwo = null;

let id_deviceOne = null;
let id_deviceTwo = null;

afterEach(async () => {
    await deviceModel.deleteMany()
    await locationModel.deleteMany()
})

beforeEach(async () => {
    await deviceModel.deleteMany()
    await locationModel.deleteMany()

    // set the first Room
    const locationOne = await new locationModel({
        "name": "Room Office 1",
        "description": "Boss Office"
    }).save()    
    id_locationOne = locationOne._id
    
    // set the second Room
    const locationTwo = await new locationModel({
        "name": "Room Office 2",
        "description": "Secretary Office"
    }).save()    
    id_locationTwo = locationTwo._id
    
    // set the first device
    const deviceOne = await new deviceModel({
        "name": "Camera 1",
        "physicalPath": "/dev/video0",
        "connectionType": "alfa/src/camera_local",
        "connectionParameters": "/dev/video0 172.17.0.1 5000",
        "description": "Color Camera",
        "location": id_locationOne
    }).save()
    id_deviceOne = deviceOne._id
    
    // set the second device
    const deviceTwo = await new deviceModel({
        "name": "Camera 2",
        "connectionType": "oggFile",
        "connectionParameters": "/home/...",        
        "description": "Grayscale Camera ",
        "location": id_locationTwo
    }).save()    
    id_deviceTwo = deviceTwo._id
})

test('Create device', async () => {
    let cam = {
        "name": 'Camera 3',
        "connectionType": "oggFile",
        "connectionParameters": "/home/...",        
        "description": 'Camera from lobby',
        'location': id_locationOne
    }
    response = await request(app)
        .post('/device')
        .send(cam)
        .expect(201)

    expect(response.body.name).toBe(cam.name);
})

test('Update a especific device', async () => {
    let cam = {
        "name": 'Cam 4',
        "description": 'Metting room camera',
        "connectionType": "oggFile",
        "connectionParameters": "/home/...",        
        "location": id_locationTwo
    }    
    const response = await request(app)
        .put(`/device/${id_deviceOne}`)
        .send(cam)
        .expect(201)

    expect(response.body.name).toBe(cam.name);
})

test('Update a especific device with an error id', async () => {
    let error_id = mongoose.Types.ObjectId()
    let device = {
        "name": 'Mic 1',
        "connectionType": "oggFile",
        "connectionParameters": "/home/...",        
        "description": 'Mic at living room',
        "location": mongoose.Types.ObjectId()
    }    
    await request(app)
        .put(`/device/${error_id}`)
        .send(device)
        .expect(404)
})

test('Get a specific device', async () => {
    const response = await request(app)
        .get(`/device/${id_deviceOne}`)
        .send()
        .expect(201)

        expect(response.body.name).toEqual('Camera 1')
})

test('Get all devices', async () => {
    const response = await request(app)
        .get('/device')
        .expect(201)

    expect(response.body.length).toBe(2)
})

test('Remove a specific device', async () => {
    await request(app)
        .delete(`/device/${id_deviceOne}`)
        .expect(201)

    const removeddevice = await deviceModel.findById(id_deviceOne)
    expect(removeddevice).toBeNull()
})

test('Start and Stop source for a device', async () => {
    // started
    const response = await request(app)
        .get(`/device/${id_deviceOne}/startSrc`)
        .expect(201)

    // stopped the container
    const response2 = await request(app)
        .get(`/device/${id_deviceOne}/stopSrc`)
        .expect(201)
})
