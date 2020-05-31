const nodeModel = require("../../models/nodeModel")
const vmsModel = require("../../models/vmsModel")
const docker = require("../../util/dockerApi")
const MQTT = require("async-mqtt");

const maestroControllerAux = {
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

module.exports = maestroControllerAux