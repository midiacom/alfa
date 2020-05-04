const nodeModel = require("../../models/nodeModel")
const docker = require("../../util/dockerApi")
const path = require('path');
const fs = require('fs');

const ra = {

    /**
     * nodeSelection: This module will return in which edge node a virtual node will run.
     * The selection will be made by a Resource Allocation.
     let virtualNodeType = req.params.vnt; // it is the image of a VMS or a SRC
     let resourceAllocationManager = req.params.ra; // it define the RA method
     let params = req.body; // the set of parameters to each RA method
    */
   nodeSelection: async (virtualNodeType, resourceAllocationManager, params) => {
        
    // get all up and running edge nodes nodes that has the image
    let where = {
        "$and": [{
            'images': { $regex: '.*' + virtualNodeType + '.*' },
            'online': true
        }]
    }

    let nodes = await nodeModel.find(where)
        .select()
        .then(nodes => {
            return nodes;
        })

    payload = {
        'nodes': nodes,
        params
    }

    // console.log(payload)
    // console.log(nodes)
    // call the function that will make the decision
    const ra = require(`./ra/${resourceAllocationManager}`)
    let ip = ra.run(payload)

    return ip;
},
}

module.exports = ra