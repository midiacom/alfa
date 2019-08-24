const request = require("supertest")
const app = require('../src/app')
const locationModel = require("../src/models/locationModel")
const mongoose = require('mongoose');

const locationOne = {
    "name": "Room Office 1",
    "description": "Boss Office"
}

const locationTwo = {
    "name": "Room Office 2",
    "description": "Secretary Office"
}

let id_locationOne = null;

beforeEach(async () => {
    await locationModel.deleteMany()
    const l = await new locationModel(locationOne).save()    
    id_locationOne = l._id
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

test('Update a especific location error id', async () => {
    let error_id = mongoose.Types.ObjectId();
    let sala = {
        "name": 'Office 4',
        "description": 'Metting room'
    }    
    const response = await request(app)
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
    await locationModel(locationTwo).save()

    const response = await request(app)
        .get('/location')
        .expect(201)

    expect(response.body.length).toBe(2)
})

test('Remove a specific location', async () => {

    const response = await request(app)
        .delete(`/location/${id_locationOne}`)
        .expect(201)

    const removedLocation = await locationModel.findById(id_locationOne)

    expect(removedLocation).toBeNull()
})
