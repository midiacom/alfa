const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const db = require('./db/connect');
const bootstrap = require('./controllers/bootstrap');

const router = express.Router();

//Rotas
const index = require('./routes/index');
const locationRoutes = require('./routes/locationRoutes');
const deviceRoutes   = require('./routes/deviceRoutes');
const vmsTypeRoutes  = require('./routes/vmsTypeRoutes');
const vmsRoutes      = require('./routes/vmsRoutes');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

const cors = require('cors')

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));

app.use('/location', locationRoutes);

app.use('/device', deviceRoutes);

app.use('/vmsType', vmsTypeRoutes);

app.use('/vms', vmsRoutes);

app.use('/', index);

app.get('/bootstrap', (req, res, next) => {

  return bootstrap.boot(req, res, next)

});

module.exports = app;