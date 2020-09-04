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
                    <strong>
                        VMS MLO
                    </strong>
                    <b-form-select 
                        :change="onChangeVMSType(mloSelected, 'mlo')"
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
                                    <b-form-input type="number" size="sm" v-model="form.edge_mlo[node.id]" required/>
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
                    <strong>
                        VMS FLO
                    </strong>
                </b-card-title>
                <hr/>
                <b-card-text>
                
                </b-card-text>
                <b-button to="/device" variant="success" class="mr-2">
                    Salvar
                </b-button>
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
aaa
        {{ form.edge_mlo }}
aaa
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
            form: {
                edge_mlo:[],
                edge_flo:[],
                edge_dlo:[],
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

        onChangeVMSType(vmsTypeId, melindaType) {
            if (!vmsTypeId) return

            apiMELINDA.getMelindaVMSFPS(vmsTypeId)
                .then((result) => {
                    result.forEach(e => {
                        if (melindaType == 'mlo') {
                            this.$set(this.form.edge_mlo, e.node, parseInt(e.FPS))
                        }
                    });
                })
        }, 

        onSubmitStartWorkFlow(evt) {
            evt.preventDefault()
        },

        onSubmitMlo(evt) {
            evt.preventDefault()

           // find the node with the ip
            // for(let i = 0; i < this.nodes.length; i++) {
            //     if (this.nodes[i].value == this.form.nodeIp) {
            //         this.form.node = this.nodes[i].id
            //     }
            // }

            let payload = {
                edge_mlo: this.form.edge_mlo,
                vmsTypeId: this.mloSelected
            }

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
        }
    },
    created() {

        apiNode.getNodesForSelect()
            .then((nodes) => {
                let that = this
                nodes.forEach(node => {
                    console.log('aasa');
                    
                    this.$set(that.form.edge_mlo, node.id, 0)
                    this.$set(that.form.edge_flo, node.id, 0)
                    this.$set(that.form.edge_dlo, node.id, 0)
                    
                    // this.form.edge_mlo[node.id] = 0
                })

                this.nodes = nodes
            })

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
                this.MelindaVMSFlo = result
            })

        apiMELINDA.getMelindaVMS('dlo')
            .then((result) => {
                this.MelindaVMSDlo = result
            })
    }
}
</script>