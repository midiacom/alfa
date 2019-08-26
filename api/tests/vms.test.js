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
    let vms = {
        "dockerImage": "alfa/plugin/video_sample",
        "startupParameters": "192.168.0.1:5000",
    }

    response = await request(app)
        .post('/vms')
        .send(vms)
        .expect(201)

    console.log(response.body)

    // expect(response.body.name).toBe(typeSimpleVideo.name);
})
