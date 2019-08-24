const request = require("supertest")
const app = require('../src/app')

test('Index', async () => {    
    const response = await request(app)
        .get('/')
        .expect(200)
})