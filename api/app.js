const express = require("express")
const db = require('./db/connect');
const Location = require('./models/location');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

app.get("/", (req, res) => {
    let l = new Location({name:'Sala 1'})    
    res.send(l.save());
})

app.listen(PORT,HOST);