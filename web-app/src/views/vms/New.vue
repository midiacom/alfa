<template>
    <div>

        <loading :active.sync="isLoading" :is-full-page="true"></loading>

        <h2>New VMS</h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>


        <b-form @submit="onSubmit">

            <hr>
            <h4>Details of VMS Type</h4>
            <b-form-group>
                <strong>VMS Type:</strong> {{ vmsType.name }}
            </b-form-group>            

            <b-form-group>
                <strong>Docker Image:</strong> {{ vmsType.dockerImage }}
            </b-form-group>            

            <b-form-group>
                <strong>Description:</strong> {{ vmsType.description }}
            </b-form-group>

            <b-form-group>
                <strong>Startup Parameters Example:</strong> {{ vmsType.startupParameters }}
            </b-form-group>
            <hr>

            <b-form-group id="input-group-2" label="Name:" label-for="name">
                <b-form-input id="name" v-model="form.name" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Startup Parameters:" label-for="startupParameters">
                <b-form-input id="startupParameters" v-model="form.startupParameters" type="text"/>
            </b-form-group>

            <b-row>
                <b-col>
                    <b-button type="submit" variant="primary">Start</b-button>
                </b-col>
                <b-col class="text-right">
                    <b-button to="/vmsType" variant="secondary">Back</b-button>        
                </b-col>
            </b-row>
        </b-form>
  </div>
</template>

<script>
import {apiVms} from './api'
import {apiVmsType} from '../vmsType/api'

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'vmsNew',
    components: {Loading},    
    data() {
        return {            
            vmsType: {
                name: '',
                dockerImage: '',
                startupParameters: '',
                description: ''
            },
            form: {
                name: '',
                vmsType: '',
                startupParameters: ''
            },
            msg: {
                text: false,
                type: ''
            },
            isLoading: false
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            this.isLoading = true;
            apiVms.newVms(this.form)
                .then(() => {
                    this.msg.text = "VMS created"
                    this.msg.type = "success"
                    this.isLoading = false;
                })
                .catch((e) => {
                    this.msg.text = `Error when creating VMS ${e}`
                    this.msg.type = "danger"
                    this.isLoading = false;
                })
        },
        refresh() {
            this.isLoading = false;
            apiVmsType.getVmsType(this.$route.params.id)
                .then((vmsType) => {
                    this.form.vmsType = vmsType._id
                    this.vmsType = vmsType
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>