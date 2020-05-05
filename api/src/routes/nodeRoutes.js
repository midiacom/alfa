const express = require('express');

const router = express.Router();

const nodeController = require('../controllers/nodeController')

router.get('/nodeOptions', nodeController.nodeOptions);

router.get('/updateStatus', nodeController.updateNodeNodeStatus);

router.get('/', nodeController.list);

router.get('/:id', nodeController.get);

router.post('/', nodeController.post);

router.put('/:id', nodeController.put);

router.delete('/:id', nodeController.delete);

router.get('/images/:nodeIp', nodeController.getEdgeNodeImages);

router.get('/status/:id', nodeController.getEdgeNodeStatus);

router.post('/nodeSelection/:vnt/:ra', nodeController.nodeSelection);

module.exports = router;