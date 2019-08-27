const express = require('express');

const router = express.Router();

const vmsController = require('../controllers/vmsController')

router.get('/', vmsController.list);

router.get('/:id', vmsController.get);

router.post('/', vmsController.post);

// router.put('/:id', vmsTypeController.put);

router.delete('/:id', vmsController.delete);

module.exports = router;