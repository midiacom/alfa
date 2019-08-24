const request = require("supertest")
const app = require('../src/app')
const location = require("../src/models/locationModel")

const locationOne = {
    "name": "Sala 1",
    "description": "Sala da Chefia"
}

beforeEach(async () => {
    await location.deleteMany()
    await new location(locationOne).save()
})

test('Create location', async () => {
    await request(app).post('/location').send({
        "name": 'Sala 2',
        "description": 'Sala da chefia 2'
    }).expect(201)
})
