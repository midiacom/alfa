const express = require('express');

const router = express.Router();

const deviceController = require('../controllers/deviceController')

router.get('/', deviceController.list);

router.get('/getContainerDetails/:id', deviceController.getContainerDetails);

router.get('/:id', deviceController.get);

router.get('/:id/startSrc', deviceController.startSrc);

router.get('/:id/stopSrc', deviceController.stopSrc);

router.post('/', deviceController.post);

router.put('/:id', deviceController.put);

router.delete('/:id', deviceController.delete);

router.get('/log/:id', deviceController.getLog);

module.exports = router;