const express = require('express');

const router = express.Router();

const vmsController = require('../controllers/vmsController')

router.get('/monitor/:id/:senderip/:senderport/:toip/:toport/:milsec/:bs/:ps/:timestamp/:totalbytes/:totalpackage', vmsController.monitor);

router.get('/monitors/:monitorName', vmsController.getMonitors);

router.get('/bindSrc/:vmsId/:deviceId/:port', vmsController.bindSrc);

router.get('/unbindSrc/:vmsId/:deviceId/:port', vmsController.unbindSrc);

router.get('/type/:id', vmsController.getType);

router.get('/log/:id', vmsController.getLog);

router.get('/', vmsController.list);

router.get('/stop/:id', vmsController.stopVms);

router.get('/:id', vmsController.get);

router.get('/getContainerDetails/:id', vmsController.getContainerDetails);

router.post('/', vmsController.post);

router.post('/addfoward', vmsController.addFoward);

router.get('/remfoward/:vmsId/:forwardId', vmsController.remFoward);

router.delete('/:id', vmsController.delete);

router.put('/:id', vmsController.put);

module.exports = router;