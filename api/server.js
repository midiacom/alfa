const app = require('./src/app');
const db = require('./db/connect');

const port = normalizaPort(process.env.PORT || '8080');

function normalizaPort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

app.listen(port, function () {
    console.log(`app listening on port ${port}`)
})

/*
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
*/