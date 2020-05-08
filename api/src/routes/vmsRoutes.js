const express = require('express');

const router = express.Router();

const vmsController = require('../controllers/vmsController')

router.get('/monitor/:id/:senderip/:senderport/:toip/:toport/:milsec/:bs/:ps/:timestamp/:totalbytes/:totalpackage', vmsController.monitor);

router.get('/monitors/:monitorName', vmsController.getMonitors);

router.get('/bindSrc/:vmsId/:deviceId/:port', vmsController.bindSrc);

router.get('/unbindSrc/:vmsId/:deviceId/:port', vmsController.unbindSrc);

router.get('/type/:id', vmsController.getType);

router.get('/', vmsController.list);

router.get('/stop/:id', vmsController.stopVms);

router.get('/:id', vmsController.get);

router.get('/getContainerDetails/:id', vmsController.getContainerDetails);

router.post('/', vmsController.post);

router.delete('/:id', vmsController.delete);

router.put('/:id', vmsController.put);

module.exports = router;