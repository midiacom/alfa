const request = require("supertest")
const app = require('../src/app')
const locationModel = require("../src/models/locationModel")
const deviceModel = require("../src/models/deviceModel")

const mongoose = require('mongoose');

let id_locationOne = null;
let id_locationTwo = null;

afterEach(async () => {
    await locationModel.deleteMany()
    await deviceModel.deleteMany()
})

beforeEach(async () => {
    await locationModel.deleteMany()
    const locationOne = {
        "name": "Room Office 1",
        "description": "Boss Office"
    }
    
    const locationTwo = {
        "name": "Room Office 2",
        "description": "Secretary Office"
    }    

    const one = await new locationModel(locationOne).save()    
    id_locationOne = one._id

    const two = await new locationModel(locationTwo).save()
    id_locationTwo = two._id
})

test('Create location', async () => {
    let sala = {
        "name": 'Office 3',
        "description": 'Metting room'
    }
    const response = await request(app)
        .post('/location')
        .send(sala)
        .expect(201)

    expect(response.body).toMatchObject(sala);
})

test('Update a especific location', async () => {
    let sala = {
        "name": 'Office 4',
        "description": 'Metting room'
    }    
    const response = await request(app)
        .put(`/location/${id_locationOne}`)
        .send(sala)
        .expect(201)

    expect(response.body).toMatchObject(sala);
})

test('Update a especific location with an error id', async () => {
    let error_id = mongoose.Types.ObjectId()
    let sala = {
        "name": 'Office 4',
        "description": 'Metting room'
    }    
    await request(app)
        .put(`/location/${error_id}`)
        .send(sala)
        .expect(404)
})

test('Get a specific location', async () => {
    const response = await request(app)
        .get(`/location/${id_locationOne}`)
        .send()
        .expect(201)

        expect(response.body.name).toEqual('Room Office 1')
})

test('Get all locations', async () => {
    const response = await request(app)
        .get('/location')
        .expect(201)

    expect(response.body.length).toBe(2)
})

test('Remove a specific location', async () => {

    await request(app)
        .delete(`/location/${id_locationOne}`)
        .expect(201)

    const removedLocation = await locationModel.findById(id_locationOne)

    expect(removedLocation).toBeNull()
})

test('Get all devices from a location', async () => {
    await deviceModel({
        'name': 'Camera A',
        "connectionType": "oggFile",
        "connectionParameters": "/home/...",        
        'description': 'Boss camera',
        'location': id_locationOne
    }).save()

    // one device at room 1
    const response_one = await request(app)
    .get(`/location/${id_locationOne}/devices`)
    .expect(201)
    expect(response_one.body.length).toBe(1)
    
    // zero device at room 1
    const response_two = await request(app)
    .get(`/location/${id_locationTwo}/devices`)
    .expect(201)
    
    expect(response_two.body.length).toBe(0)
})