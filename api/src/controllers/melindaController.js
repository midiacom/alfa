const melindaFPSModel = require("../models/melindaFPS")
const vmsTypeModel = require("../models/vmsTypeModel")

const docker = require("../util/dockerApi")

const melindaController = {

    /**
     * startWorkflow
     * 
     * Save the maximum FPS of each VMS for each Edge Node
     */
    startWorkflow: async (req, res, next) => {
        console.log(req.body);
        
        // a) Create the DLO VMSs

        // b) Create the FLO VMSs

        // c) Create the Image Broker using the ips as parameter

        // d) Create the MLO VMSs

        // e) Bind with the selected virtual device
    },

    /**
     * saveEdgeNodeFPS
     * 
     * Save the maximum FPS of each VMS for each Edge Node
     */
    saveEdgeNodeFPS: async (req, res, next) => {

        edge_nodes = req.body.edge_nodes
        vmsTypeId = req.body.vmsTypeId

        // Remove all the previous values for FPS for the VMS Type Selected
        await melindaFPSModel.deleteMany({vmsType: vmsTypeId})

        // Iterate over the keys that are the edge nodes id's
        Object.keys(edge_nodes).forEach(async function(nodeId) {
            var fpsNode = edge_nodes[nodeId];

            const melindaFPS = new melindaFPSModel({
                FPS: fpsNode,
                node: nodeId,
                vmsType: vmsTypeId
            })

            await melindaFPS.save((err,node) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Error when creating FPS to VMS to Edge Node',
                        error: err
                    });
                }
            })
        });

        return res.status(201).json("{ok:ok}");
    },

    /**
     * getMelindaVMS
     * 
     * Returns the list of VMS that are Melinda's VMS (mlo, flo and dlo)
     * the pattern name for MLO is: alfa/vms/melinda/mlo/*
     * the pattern name for FLO is: alfa/vms/melinda/flo/*
     * the pattern name for DLO is: alfa/vms/melinda/dlo/*
     */
    getMelindaVMS: (req, res, next) => {
        /**
         * type : mlo / flo / dlo
        */
        let melindaType = `alfa/vms/melinda/${req.params.melindaType}`;

        vmsTypeModel.find({src:0})
            .select('id, name dockerImage')
            .then(vmsTypes => {
                let ret = []
                vmsTypes.forEach(e => {
                    if (e.dockerImage.search(melindaType) != -1)
                        ret.push(e)                        
                    });
                return res.status(201).json(ret);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });
    },

    /**
     * getMelindaVMSFPS
     * 
     * Returns the previous values of FPS for a VMS in all edge nodes
     * vmsTypeId: Id of the VMS Type
     */
    getMelindaVMSFPS: (req, res, next) => {

       vmsTypeId = req.params.vmsTypeId
       
        melindaFPSModel.find({vmsType:vmsTypeId})
            .then(melindaFPS => {                
                return res.status(201).json(melindaFPS);
            })
            .catch(err => {
                /* istanbul ignore next */ 
                return res.status(422).send(err.errors);
            });
    },


}    
module.exports = melindaController