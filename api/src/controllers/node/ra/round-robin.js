const docker = require("../../../util/dockerApi")

const ra_rr = {
    run: async function(payload) {
        let containers = []
        for(let i = 0; i < payload.nodes.length; i++) {
            let node = payload.nodes[i]

            // get all containers running in the edge node
            console.log(node.ip)
            let cont = await docker.api(node.ip)
                .then((api) => {
                    let cont = api.listContainers()
                        .then((data) => {
                            return data
                        })
                })

            containers.push(cont)
        }

        console.log(containers)
    }
}

module.exports = ra_rr