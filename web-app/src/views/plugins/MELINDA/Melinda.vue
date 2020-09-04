<template>
    <div>
        <h2>
            <v-icon style="width: 32px;"  name="codesandbox"></v-icon>
            MELINDA Workflow and Configurations
        </h2>

        <b-alert :show="msg.show" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <h3>Configuratinos</h3>

        <b-card-group deck>
            <b-card bg-variant="light"  text-variant="black">
                <b-card-title>
                    <strong>VMS MLO </strong>
                    <b-form-select 
                        @input="onChangeVMSType(mloSelected, 'mlo')"
                        v-model="mloSelected" 
                        :options="MelindaVMSMlo" 
                        size="sm" 
                        class="mt-3"></b-form-select>
                </b-card-title>
                <hr/>

                <b-card-text>
                    <b-form @submit="onSubmitMlo">
                        <b-row v-for="node in nodes" :key="node.id">
                            <b-col>
                                <b-form-group :label="node.text">
                                    <b-form-input 
                                        type="text" 
                                        size="sm" 
                                        :value="edge_mlo[node.id]" 
                                        @change="changeFPS(node, $event, 'mlo')"
                                        required/>
                                </b-form-group>
                            </b-col>
                        </b-row>
                        <b-row class="text-center">
                            <b-col>
                                <b-button type="submit" variant="primary">Save MLO</b-button>
                            </b-col>
                        </b-row>
                    </b-form>
                </b-card-text>
            </b-card>

            <b-card bg-variant="light"  text-variant="black">
                <b-card-title>
                    <strong>VMS FLO </strong>
                    <b-form-select 
                        @input="onChangeVMSType(floSelected, 'flo')"
                        v-model="floSelected" 
                        :options="MelindaVMSFlo"
                        size="sm" 
                        class="mt-3"></b-form-select>
                </b-card-title>
                <hr/>
                    <b-form @submit="onSubmitFlo">
                        <b-row v-for="node in nodes" :key="node.id">
                            <b-col>
                                <b-form-group :label="node.text">
                                    <b-form-input 
                                        type="text" 
                                        size="sm" 
                                        :value="edge_flo[node.id]" 
                                        @change="changeFPS(node, $event, 'flo')"
                                        required/>
                                </b-form-group>
                            </b-col>
                        </b-row>
                        <b-row class="text-center">
                            <b-col>
                                <b-button type="submit" variant="primary">Save FLO</b-button>
                            </b-col>
                        </b-row>
                    </b-form>                
            </b-card>

            <b-card bg-variant="light"  text-variant="black">
                <b-card-title>
                    <strong>
                        VMS DLO
                    </strong>
                </b-card-title>
                <hr/>
                <b-card-text>
                
                </b-card-text>
                <b-button to="/device" variant="success" class="mr-2">
                    Salvar
                </b-button>
            </b-card>
        </b-card-group>

        <hr/>

        <h3>New Workflow</h3>

        <b-form @submit="onSubmitStartWorkFlow">
            <b-form-group id="input-group-1" label="Name:" label-for="name">
                <b-form-input id="name" v-model="form.name" type="text" required/>
            </b-form-group>
            
            <b-row>
                <b-col>
                    <b-button type="submit" variant="primary">Save</b-button>
                </b-col>
                <b-col class="text-right">
                    <b-button to="/device" variant="secondary">Back</b-button>        
                </b-col>
            </b-row>
        </b-form>
  </div>
</template>

<script>
import {apiMELINDA} from './api'
import {apiNode} from '../../node/api'

export default {
    name: 'deviceNew',
    data() {
        return {
            nodes: [],
            MelindaVMSMlo: [],
            MelindaVMSFlo: [],
            MelindaVMSDlo: [],
            mloSelected: null,
            floSelected: null,
            edge_mlo:{},
            edge_flo:{},
            edge_dlo:{},
            form: {
                name: ''
            },
            msg: {
                text: false,
                type: '',
                show: false
            }
        }
    },

    methods: {

        changeFPS: function(node, FPS, melindaType){
            if (melindaType == "flo")  {
                this.$set(this.edge_flo, node.id, parseInt(FPS))
                return
            }
            if (melindaType == "dlo") {
                this.$set(this.edge_dlo, node.id, parseInt(FPS))
                return
            }
            this.$set(this.edge_mlo, node.id, parseInt(FPS))
        }, 
        
        onChangeVMSType(vmsTypeId, melindaType) {
            if (!vmsTypeId) return

            console.log(melindaType);

            apiMELINDA.getMelindaVMSFPS(vmsTypeId)
                .then((result) => {
                    result.forEach(e => {                        
                        if (melindaType == 'mlo') {
                            this.$set(this.edge_mlo, e.node, parseInt(e.FPS))                            
                        }
                        if (melindaType == 'flo') {
                            this.$set(this.edge_flo, e.node, parseInt(e.FPS))                            
                        }
                    });
                })
        },

        onSubmitStartWorkFlow(evt) {
            evt.preventDefault()
        },

        onSubmitMlo(evt) {
            evt.preventDefault()
            let payload = {
                edge_nodes: this.edge_mlo,
                vmsTypeId: this.mloSelected
            }

            // Save the FPS for the VMS in a particular edge node
            apiMELINDA.saveEdgeNodeFPS(payload)
                .then(() => {
                    this.msg.text = "The total of FPS for the MLO in the Edge Nodes was Saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving MLO FPS ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },

        onSubmitFlo(evt) {
            evt.preventDefault()
            let payload = {
                edge_nodes: this.edge_flo,
                vmsTypeId: this.floSelected
            }

            // Save the FPS for the VMS in a particular edge node
            apiMELINDA.saveEdgeNodeFPS(payload)
                .then(() => {
                    this.msg.text = "The total of FPS for the FLO in the Edge Nodes was Saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving FLO FPS ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        }
    },
    created() {

        // Get all the edge nodes and put in a array 
        apiNode.getNodesForSelect()
            .then((nodes) => {
                nodes.forEach(node => {
                    this.$set(this.edge_mlo, node.id, 0)
                    this.$set(this.edge_flo, node.id, 0)
                    this.$set(this.edge_dlo, node.id, 0)
                })

                this.nodes = nodes
            })

        // get all the VMS tha are mlo's
        apiMELINDA.getMelindaVMS('mlo')
            .then((result) => {
                result.forEach(e => {
                    this.MelindaVMSMlo.push({                        
                        text: e.name,
                        value: e._id
                    })
                });
            })

        apiMELINDA.getMelindaVMS('flo')
            .then((result) => {
                result.forEach(e => {
                    this.MelindaVMSFlo.push({
                        text: e.name,
                        value: e._id
                    })
                });
            })

        apiMELINDA.getMelindaVMS('dlo')
            .then((result) => {
                result.forEach(e => {
                    this.MelindaVMSDlo.push({
                        text: e.name,
                        value: e._id
                    })
                });
            })
    }
}
</script>