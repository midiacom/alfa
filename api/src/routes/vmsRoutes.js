const express = require('express');

const router = express.Router();

const vmsController = require('../controllers/vmsController')

// router.get('/', vmsTypeController.list);

// router.get('/:id', vmsTypeController.get);

router.post('/', vmsController.post);

// router.put('/:id', vmsTypeController.put);

// router.delete('/:id', vmsTypeController.delete);

module.exports = router;