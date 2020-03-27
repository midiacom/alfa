<template>
    <div>
        <h2>New Device</h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">
            <b-form-group id="input-group-1" label="Name:" label-for="name">
                <b-form-input id="name" v-model="form.name" type="text" required/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Edge Node:" label-for="node">
                <b-form-select style="margin-top:0px!important" id="nodeIp" v-model="form.nodeIp" :options="nodes" size="sm" class="mt-3"></b-form-select>
            </b-form-group>

            <b-form-group id="input-group-1" label="Physical Path:" label-for="physicalPath">
                <b-form-input id="physicalPath" v-model="form.physicalPath" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Connection Type:" label-for="connectionType">
                <b-form-select style="margin-top:0px!important" id="connectionType" v-model="form.connectionType" :options="connectionTypes" size="sm" class="mt-3"></b-form-select>
            </b-form-group>

            <b-form-group id="input-group-2" label="Connection Parameters:" label-for="parameters">
                <b-textarea id="connectionParameters" v-model="form.connectionParameters"/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Location:" label-for="location">
                <b-form-select required style="margin-top:0px!important" id="location" v-model="form.location" :options="locations" size="sm" class="mt-3"></b-form-select>
            </b-form-group>

            <b-form-group id="input-group-2" label="Description:" label-for="description">
                <b-form-textarea id="description" v-model="form.description" type="text"/>
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
import {apiDevice} from './api'
import {apiLocation} from '../location/api'
import {apiNode} from '../node/api'

export default {
    name: 'deviceNew',
    data() {
        return {
            locations: [],
            connectionTypes: [],
            nodes: [],
            form: {
                name: '',
                physicalPath: '',
                connectionType: "",
                connectionParameters: "",                
                description: '',
                nodeIp: '',
                node: ''
            },
            msg: {
                text: false,
                type: ''
            }
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()

           // find the node with the ip
            for(let i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].value == this.form.nodeIp) {
                    this.form.node = this.nodes[i].id
                }
            }
                        
            apiDevice.newDevice(this.form)
                .then(() => {
                    this.msg.text = "Device saved"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.msg.text = `Error when saving device ${e}`
                    this.msg.type = "danger"
                })
        }
    },
    created() {

        apiNode.getNodesForSelect()
            .then((nodes) => {
                this.nodes = nodes
            })

        apiDevice.getConnectionTypes()
            .then((ret) => {
                this.connectionTypes = ret
            })       
 
        apiLocation.getLocationsForSelect()
            .then((ret) => {
                this.locations = ret
            })

    }
}
</script>