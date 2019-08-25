const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const router = express.Router();
const db = require('./db/connect');

//Rotas
const index = require('./routes/index');
const locationRoutes = require('./routes/locationRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

const cors = require('cors')

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions));

app.use('/location', locationRoutes);

app.use('/device', deviceRoutes);

app.use('/', index);

module.exports = app;