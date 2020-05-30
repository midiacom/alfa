const docker = require("../../../util/dockerApi")

const ra_rr = {
    run: async function(payload) {
        let node = payload.nodes[0]
        for(let i = 1; i < payload.nodes.length; i++){
            // select the edge node with the smallest number of running VMS
            if (node.virtualEntityNum > payload.nodes[i].virtualEntityNum) {
                node = payload.nodes[i]
            }
        }
        return node
    }
}

module.exports = ra_rr