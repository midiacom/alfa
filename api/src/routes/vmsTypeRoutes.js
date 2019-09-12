const express = require('express');

const router = express.Router();

const vmsTypeController = require('../controllers/vmsTypeController')

router.get('/', vmsTypeController.list);

router.get('/listSrc', vmsTypeController.listSrc);

router.get('/listVms', vmsTypeController.listVms);

router.get('/:id', vmsTypeController.get);

router.post('/', vmsTypeController.post);

router.put('/:id', vmsTypeController.put);

router.delete('/:id', vmsTypeController.delete);

module.exports = router;