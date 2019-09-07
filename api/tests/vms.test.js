const request = require("supertest")
const app = require('../src/app')
const vmsTypeModel = require("../src/models/vmsTypeModel")
const vmsModel = require("../src/models/vmsModel")
const mongoose = require('mongoose');

let id_vmsTypeOne = null;

afterEach(async () => {
    await vmsModel.deleteMany()
    await vmsTypeModel.deleteMany()
})

beforeEach(async () => {
    await vmsModel.deleteMany()

    // set the first vms type
    const vmsType = await new vmsTypeModel({
        "name": "Audio Sample",
        "dockerImage": "alfa/plugin/video_sample",
        "startupParameters": "{dest:'192.168.0.1:5000'}",
        "description": "A simple video sample"
    }).save()

    id_vmsTypeOne = vmsType._id
})

test('Create and Stop a VMS', async () => {
    let vms = {
        "vmsType": id_vmsTypeOne,
        "startupParameters": "localhost 5000",
    }

    response = await request(app)
        .post('/vms')
        .send(vms)
        .expect(201)

    let id_vmsOne = response.body._id

    response = await request(app)
        .delete(`/vms/${id_vmsOne}`)
        .expect(201)
})

test('Get all VMS', async () => {
    response = await request(app)
        .get('/vms')
        .expect(201)
    // console.log(response.body)
    // expect(response.body.name).toBe(typeSimpleVideo.name);
})

test('Get details of one VMS', async () => {
    let vms = {
        "vmsType": id_vmsTypeOne,
        "startupParameters": "localhost 5000",
    }

    response = await request(app)
        .post('/vms')
        .send(vms)
        .expect(201)

    let dockerId = response.body.dockerId
    let id_vmsOne = response.body._id
    
    // get Details
    response = await request(app)
        .get(`/vms/${dockerId}`)
        .expect(201)
    
    // remove VMS
    response = await request(app)
        .delete(`/vms/${id_vmsOne}`)
        .expect(201)
})

test('List Stopped VMS', async () => {
    response = await request(app)
        .get(`/vms/stopped`)
        .expect(201)
})