const vmsModel = require("../models/vmsModel")
const nodeModel = require("../models/nodeModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const docker = require("../util/dockerApi")
const nodeController = require("./nodeController")
const ra = require('./node/ra');
const mqtt = require('mqtt')
const path = require('path');
const fs = require('fs')

const maestroController = {

    /**
     * vmsRequestCreation
     * 
     * This method will receive the IoMT Request to start a new VMS.
     * 
     */
    vmsRequestCreation: (req, res, next) => {
        return res.status(201).json("OK");
        /*
        var id = req.params.id;
        vmsModel.findById(id)
        .populate('vmsType')
        .exec()
        .then((result) => {
            if (!result) {
                return res.status(404).send()
            }          
            return res.status(201).json(result.vmsType);
        })
        */
    }
}

module.exports = maestroController