const vmsModel = require("../models/vmsModel")
const nodeModel = require("../models/nodeModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const locationModel = require("../models/locationModel")
const deviceModel = require("../models/deviceModel")
const docker = require("../util/dockerApi")
const nodeController = require("./nodeController")
const maestroControllerAux = require("./maestro/aux")
const vmsController = require("./vmsController")

const ra = require('./node/ra');
const crypto = require('crypto')

const maestroController = {

    /**
     * vmsRequestCreation
     * 
     * This method will receive the IoMT Request to start a new VMS.
     * 
     */
    vmsRequestCreation: async (req, res, next) => {
        
        let locationId = req.body.locationId;
        let outputType = req.body.outputType;        
        let virtualDeviceParameters = req.body.virtualDeviceParameters;

        deviceModel.findOne()
        .and({
            'location': locationId,
            'outputType': outputType,
            'dockerId':{$ne:''}
        })
        .exec()
        .then((resultVirtualDevice) => {           

            if (!resultVirtualDevice) {
                return res.status(404).send()
            }

            // creating a name for the VMS
            req.body.name = crypto.createHash('md5').update(`${req.body.toIp}:${req.body.toPort}:${Math.floor(Math.random() * (100 - 0)) + 0}`).digest("hex")
            req.body.nodeIp = "round-robin"
            req.body.startupParameters = `${req.body.toIp} ${req.body.toPort} ${req.body.startupParameters}`
            req.body.remoteRequest = 1
            
            // pegar o VMS Type  vmsType
            vmsTypeModel.findOne({
                'dockerImage': req.body.vmsType
            })        
            .exec()
            .then((vmsTypeResult) => {

                if (!vmsTypeResult) {
                    return res.status(404).send()
                }
                
                req.body.vmsType = vmsTypeResult._id

                // criar o VMS usando o VMS Type                
                vmsController.post(req, res, next)
                    .then(async (result) => {
                        vms = null
                        // faz um pooling, HORRIVEL ISSO SOCORRO
                        while (vms == null) {
                            vms = await vmsModel.findOne({'name': req.body.name})
                                .then((result) => {
                                    return result
                                })
                        }
                        
                        let ret = await maestroControllerAux.bindVMStoSRC(vms._id, resultVirtualDevice._id, req.body.bindPort)
                        return res.status(201).json(ret);
                    })
            })
        })
        .catch(err => {
            /* istanbul ignore next */ 
            return res.status(422).send(err.errors);
        });
    }
}

module.exports = maestroController