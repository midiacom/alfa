const express = require('express');

const router = express.Router();

const nodeController = require('../controllers/nodeController')

router.get('/', nodeController.list);

router.get('/:id', nodeController.get);

router.post('/', nodeController.post);

router.put('/:id', nodeController.put);

router.delete('/:id', nodeController.delete);

module.exports = router;