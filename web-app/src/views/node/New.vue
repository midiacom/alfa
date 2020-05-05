<template>
    <div>
        <h2>New Edge Node</h2>

        <b-alert :show="msg.show" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">
            <b-form-group id="input-group-1" label="Name:" label-for="name">
                <b-form-input id="name" v-model="form.name" type="text" required/>
            </b-form-group>

            <b-form-group id="input-group-1" label="IP:" label-for="name">
                <b-form-input id="ip" v-model="form.ip" type="text" required/>
            </b-form-group>

            <b-form-group label="Role in Doker Swarm" label-for="isMarter">
                <b-form-radio v-model="form.isMaster" name="isMaster" value=true>Master</b-form-radio>
                <b-form-radio v-model="form.isMaster" name="isMaster" value=false>Slave</b-form-radio>
            </b-form-group>            

            <b-form-group id="input-group-3" label="Docker Node ID:" label-for="dockerId">
                <b-form-input id="dockerId" v-model="form.dockerId" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-2" label="Description:" label-for="description">
                <b-form-textarea id="description" v-model="form.description" type="text"/>
            </b-form-group>

            <b-row>
                <b-col>
                    <b-button type="submit" variant="primary">Save</b-button>
                </b-col>
                <b-col class="text-right">
                    <b-button to="/node" variant="secondary">Back</b-button>        
                </b-col>
            </b-row>
        </b-form>
  </div>
</template>

<script>
import {apiNode} from './api'
// import {apiLocation} from '../location/api'

export default {
    name: 'nodeNew',
    data() {
        return {
            locations: [],
            form: {
                name: '',     
                ip: '',
                description: '',
                dockerId: '',
                isMaster: false
            },
            msg: {
                text: false,
                type: '',
                show: false
            }
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            apiNode.newNode(this.form)
                .then(() => {
                    this.msg.text = "Node saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving node ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        }
    },
    created() {

    }
}
</script>