const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const router = express.Router();

//Rotas
const index = require('./routes/index');
const locationRoutes = require('./routes/locationRoutes');

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use('/location', locationRoutes);

app.use('/', index);

module.exports = app;