const express = require('express');

const router = express.Router();

const locationController = require('../controllers/locationController')

router.get('/', locationController.list);

router.get('/:id/devices', locationController.devices);

router.get('/:id', locationController.get);

router.post('/', locationController.post);

router.put('/:id', locationController.put);

router.delete('/:id', locationController.delete);

module.exports = router;