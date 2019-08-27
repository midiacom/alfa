<template>
    <div>
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

export default {
    name: 'vmsNew',
    data() {
        return {
            vmsType: {
                name: '',
                dockerImage: '',
                startupParameters: '',
                description: ''
            },
            form: {
                vmsType: '',
                startupParameters: ''
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
            apiVms.newVms(this.form)
                .then(() => {
                    this.msg.text = "VMS created"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.msg.text = `Error when creating VMS ${e}`
                    this.msg.type = "danger"
                })
        },
        refresh() {
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