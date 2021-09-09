const { timeout } = require("cron")
const nodeModel = require("../../models/nodeModel")
const docker = require("../../util/dockerApi")

const cron = {
    update: async () => {
        nodeModel.find({'isMaster': true})
        .then((masterNode) => {
            nodeModel.find()
            .exec()
            .then((slaveNodes) => {
                if (!slaveNodes){
                    console.log('Error: nodes not found');
                    return false;
                }

                slaveNodes.forEach(async function(node){
                    docker.api(masterNode[0].ip)
                    .then(async (api) => {

                        // update the status
                        if (!node) {
                            return res.status(422).send('Dockerid not found in Edge node');
                        }
                        let nodeDocker = api.getNode(node.dockerId);
                        var opts = {"filters": `{}`}
                        nodeDocker.inspect()
                            .then(async (status) => {
                                if (status.Status.State == 'down') {
                                    node.online = false
                                    node.virtualEntityNum = 0;
                                } else {
                                    node.online = true 
                                }
                                // save the status of the edge node
                                nodeModel.findById(node._id)
                                        .then((rNode) => {
                                            rNode.online = true
                                            rNode.save()
                                         })
                            })
                            .catch(async err => {
                                // if the node was not founded then mark it as offline
                                
                                nodeModel.findById(node._id)
                                    .then((rNode) => {
                                        rNode.online = false
                                        rNode.save()
                                        })
                                
                                // console.log(err)
                            });

                        // update the container number                    
                        docker.api(node.ip)
                            .then(async (api) => {
                                api.listContainers()
                                .then(async (cont) => {
                                    let total = 0;
                                    for (let i = 0; i < cont.length; i++) {
                                        // only count the Alfa's virtual nodes 
                                        if (cont[i].Image.indexOf('alfa\/vms') >= 0){
                                            total++
                                        }
                                    } 
                                    
                                    nodeModel.findById(node._id)
                                        .then((rNode) => {
                                            rNode.virtualEntityNum = total
                                            rNode.save()
                                         })
                                })
                                .catch(err => {
                                    // console.log('A');                                    
                                    // console.log(err)
                                });
                            })
                            .catch(err => {
                                // console.log('B');
                                // console.log(err)
                            });

                    })     
                    .catch(err => {
                        console.log(err)
                    });        
                })
            })
        })         
    },
}

module.exports = cron