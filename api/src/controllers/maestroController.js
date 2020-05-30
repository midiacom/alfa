const vmsModel = require("../models/vmsModel")
const nodeModel = require("../models/nodeModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const locationModel = require("../models/locationModel")
const deviceModel = require("../models/deviceModel")
const docker = require("../util/dockerApi")
const nodeController = require("./nodeController")
const vmsController = require("./vmsController")
const ra = require('./node/ra');
// const mqtt = require('mqtt')
const crypto = require('crypto')
const MQTT = require("async-mqtt");

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
            req.body.name = crypto.createHash('md5').update(`${req.body.toIp}:${req.body.toPort}`).digest("hex")
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
                        
                        let ret = await maestroController.bindVMStoSRC(vms._id, resultVirtualDevice._id, req.body.bindPort)
                        return res.status(201).json(vms);
                    })
            })
        })
        .catch(err => {
            /* istanbul ignore next */ 
            return res.status(422).send(err.errors);
        });
    },

    /**
     * bindVMStoSRC
     * 
     * This function bind the VMS and a SRC
    */
    bindVMStoSRC: async (vmsId, deviceId, port) => {
        // get VMS data
        let vms = await vmsModel.findById(vmsId)
          .populate("node")
          .then((vms) => {
              return vms
          })

        if (!vms) {
            return {error: 'VMS not found'}
        }

        // get the Docker API
        let dockerApi = await docker.api(vms.node.ip)
            .then((api) => {
                return api
            })

        if (!vms) {
            return {error: 'VMS not found'}
        }
        
        // get informations about the container that runs the VMS
        let container = await dockerApi.getContainer(vms.dockerId);
        let containerInpection = await container.inspect()
            .then((data) => {
                if (data == null) {return {error: 'VMS not found'}}
                return data
            })

        // Get the IP of the VMS container
        let ipDockerContainer = containerInpection.NetworkSettings.Networks[process.env.DOCKER_OVERLAY_NETWORK].IPAddress;

        // MQTT client connect        
        const mqtt_client = await MQTT.connectAsync(process.env.MQTT_SERVER)

        // string that the Virtual Device is waiting to to the bind
        let aux_name = `${port}${vms.dockerId.substring(0,11).replace(/[a-z]/g,'').substring(0,11)}`
        let pub_string = `${ipDockerContainer};${port};${aux_name};A`
        
        try {
            await mqtt_client.publish(deviceId.toString(),pub_string)
            await mqtt_client.end();
        } catch (e){
            console.log(e.stack);
        }

        // save in the VMS database the port that was binded
        vms.bindedTo.push({
            device: deviceId,
            port: port
        });

        return vms.save()
            .then((ret) => {             
                return ret
            })
    }
}

module.exports = maestroController