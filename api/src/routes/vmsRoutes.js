const express = require('express');

const router = express.Router();

const vmsController = require('../controllers/vmsController')

router.get('/bindSrc/:vmsId/:deviceId', vmsController.bindSrc);

router.get('/', vmsController.list);

router.get('/stopped', vmsController.listStoppedVms);

router.get('/:id', vmsController.get);

router.post('/', vmsController.post);

router.delete('/:id', vmsController.delete);

module.exports = router;