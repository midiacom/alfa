const express = require('express');

const router = express.Router();

const configurationController = require('../controllers/configurationController')

router.get('/cleanDb/', configurationController.cleanDb);

router.get('/bootstrap/', configurationController.bootstrap);

module.exports = router;