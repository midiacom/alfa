const vmsModel = require("../models/vmsModel")
const nodeModel = require("../models/nodeModel")
const vmsTypeModel = require("../models/vmsTypeModel")
const locationModel = require("../models/locationModel")
const deviceModel = require("../models/deviceModel")
const docker = require("../util/dockerApi")
const nodeController = require("./nodeController")
const vmsController = require("./vmsController")
const ra = require('./node/ra');
const mqtt = require('mqtt')
const crypto = require('crypto')
const { AsyncClient } = require("async-mqtt");

const maestroController = {

    /**
     * vmsRequestCreation
     * 
     * This method will receive the IoMT Request to start a new VMS.
     * 
     */
    vmsRequestCreation: async (req, res, next) => {
        
        let vmsId    = '5ed252d8f75ac51e4b6e2b71'
        let deviceId = '5ebaba4dd30be70037251cfb'
        let port     = 5000

        let ret = await maestroController.bindVMStoSRC(vmsId, deviceId, port)
        return res.status(201).json(ret);

        // -----------
        let locationId = req.body.locationId;
        let outputType = req.body.outputType;        
        let virtualDeviceParameters = req.body.virtualDeviceParameters;

        deviceModel.find()
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

                        vmsModel.findById(vms._id)
                            .populate("vmsType")
                            .then((newVms) => {
                                // return res.status(201).json(resultVirtualDevice);
                                req.params.vmsId = newVms._id
                                req.params.deviceId = resultVirtualDevice._id
                                req.params.port = req.body.bindPort;

                                // dar o bind em um dos devices
                                vmsController.bindSrc(req, res, next)
                                    .then(async (bind) => {
                                        return res.status(201).json(bind);
                                    })
                            });
                    })

            })
        })
        .catch(err => {
            /* istanbul ignore next */ 
            return res.status(422).send(err.errors);
        });        
    },

    bindVMStoSRC: async (vmsId, deviceId, port) => {

        let vms = await vmsModel.findById(vmsId)
          .populate("node")
          .then((vms) => {
              return vms
          })

        if (!vms) {
            return {error: 'VMS not found'}
        }

        // 1 - Get the ip of the container's VMS
        let dockerApi = await docker.api(vms.node.ip)
            .then((api) => {
                return api
            })

        if (!vms) {
            return {error: 'VMS not found'}
        }
        
        let container = await dockerApi.getContainer(vms.dockerId);

        let containerInpection = await container.inspect()
            .then((data) => {
                if (data == null) {return {error: 'VMS not found'}}
                return data
            })

        let ipDockerContainer = containerInpection.NetworkSettings.Networks[process.env.DOCKER_OVERLAY_NETWORK].IPAddress;

        let aux_name = port.concat(vms.dockerId.substring(0,11).replace(/[a-z]/g, '')).substring(0,11)

        let pub_string = `${ipDockerContainer};${port};${aux_name};A`

        const asyncClient = new AsyncClient(mqtt.connect(process.env.MQTT_SERVER));
        
        let pub = await asyncClient.publish(deviceId,pub_string)
            .then((data) => {
                if (data == null) {return {error: 'VMS not found'}}
                return data
            })

        return pub
        /*
        vms.bindedTo.push({
          device: deviceId,
          port: port
        });


        client.on('connect', function () {
            client.subscribe(deviceId, function (err) {
                if (!err) {
                  let aux_name = port.concat(vms.dockerId.substring(0,11).replace(/[a-z]/g, '')).substring(0,11)
                  client.publish(deviceId, `${ipDockerContainer};${port};${aux_name};A`)
                  
                  vms.bindedTo.push({
                    device: deviceId,
                    port: port
                  });
        
                  vms.save((err,vms) => {                
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when creating vmsType',
                            error: err
                        });
                    }
                  })
                  if (req.body.remoteRequest){                        
                    return vms
                  } else {
                    return res.status(201).json({"ok":"ok"});
                  }
                } else {
                  console.log(err)
                }
              })
          });
        return containerInpection;*/
    }
}

module.exports = maestroController