var Docker = require('dockerode');

const deviceModel = require("../models/deviceModel")
// const locationModel = require("../models/locationModel")

const vmsController = {
    post: (req, res, next) => {

        var dockerApi = new Docker({host: 'http://172.17.0.1/', port: 2375});
        dockerApi.listContainers(function (err, containers) {
            console.log(err)
            containers.forEach(function (containerInfo) {
              // docker.getContainer(containerInfo.Id).stop(cb);
                console.log(containerInfo)
            });
            console.log(err)
          });
        let vms = {
            dockerId: 'ddddd'
        }
        return res.status(201).json(vms);
    },
}    

module.exports = vmsController