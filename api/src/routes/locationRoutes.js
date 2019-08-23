const express = require('express');

const router = express.Router();

const locationConstroller = require('../controllers/locationConstroller')

router.get('/', locationConstroller.list);

router.get('/:id', locationConstroller.get);

router.post('/', locationConstroller.post);

router.put('/:id', locationConstroller.put);

router.delete('/:id', locationConstroller.delete);

module.exports = router;