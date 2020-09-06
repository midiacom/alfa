const express = require('express');

const router = express.Router();

const melindaController = require('../controllers/melindaController')

router.post('/fps', melindaController.saveEdgeNodeFPS);

router.get('/vmstypes/:melindaType', melindaController.getMelindaVMS);

router.get('/vmstypesfps/:vmsTypeId', melindaController.getMelindaVMSFPS);

router.post('/startworkflow/', melindaController.startWorkflow);

router.get('/stopworkflow/', melindaController.stopWorkflow);

/*
router.get('/', vmsTypeController.list);

router.get('/listSrc', vmsTypeController.listSrc);

router.get('/listVms', vmsTypeController.listVms);

router.get('/:id', vmsTypeController.get);


router.put('/:id', vmsTypeController.put);

router.delete('/:id', vmsTypeController.delete);
*/

module.exports = router;