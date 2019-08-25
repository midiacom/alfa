const express = require('express');

const router = express.Router();

const deviceController = require('../controllers/deviceController')

router.get('/', deviceController.list);

router.get('/:id', deviceController.get);

router.post('/', deviceController.post);

router.put('/:id', deviceController.put);

router.delete('/:id', deviceController.delete);

module.exports = router;