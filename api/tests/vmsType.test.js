const request = require("supertest")
const app = require('../src/app')
const vmsTypeModel = require("../src/models/vmsTypeModel")
const mongoose = require('mongoose');

let id_vmsTypeOne = null;

afterEach(async () => {
    await vmsTypeModel.deleteMany()
})

beforeEach(async () => {
    await vmsTypeModel.deleteMany()

    // set the first vms type
    const vmsType = await new vmsTypeModel({
        "name": "Audio Sample",
        "dockerImage": "alfa/plugin/audio_sample",
        "startupParameters": "{dest:'192.168.0.1:5000'}",
        "description": "A simple audio sample"
    }).save()

    id_vmsTypeOne = vmsType._id
})

test('Create vmsType', async () => {
    let typeSimpleVideo = {
        "name": "Video Sample",
        "dockerImage": "alfa/plugin/video_sample",
        "startupParameters": "{dest:'192.168.0.1:5000'}",
        "description": "A simple video sample"
    }

    response = await request(app)
        .post('/vmsType')
        .send(typeSimpleVideo)
        .expect(201)

    expect(response.body.name).toBe(typeSimpleVideo.name);
})

test('Update a especific vmsType', async () => {
    let typeSimpleAudio = {
        "name": "Audio Sample",
        "dockerImage": "alfa/plugin/audio_sample",
        "startupParameters": "{dest:'192.168.0.1:5000'}",
        "description": "A simple audio sample ogg"
    }

    const response = await request(app)
        .put(`/vmsType/${id_vmsTypeOne}`)
        .send(typeSimpleAudio)
        .expect(201)

    expect(response.body.description).toBe(typeSimpleAudio.description);
})

test('Update a especific vmsType with an error id', async () => {
    let error_id = mongoose.Types.ObjectId()
    let typeSimpleAudio = {
        "name": "Audio Sample",
        "dockerImage": "alfa/plugin/audio_sample",
        "startupParameters": "{dest:'192.168.0.1:5000'}",
        "description": "A simple audio sample ogg"
    } 
    await request(app)
        .put(`/vmsType/${error_id}`)
        .send(typeSimpleAudio)
        .expect(404)
})

test('Get a specific vmsType', async () => {
    const response = await request(app)
        .get(`/vmsType/${id_vmsTypeOne}`)
        .send()
        .expect(201)

        expect(response.body.name).toEqual('Audio Sample')
})

test('Get all vmsTypes', async () => {
    const response = await request(app)
        .get('/vmsType')
        .expect(201)

    expect(response.body.length).toBe(1)
})

test('Remove a specific vmsType', async () => {
    await request(app)
        .delete(`/vmsType/${id_vmsTypeOne}`)
        .expect(201)

    const removedvmsType = await vmsTypeModel.findById(id_vmsTypeOne)

    expect(removedvmsType).toBeNull()
})