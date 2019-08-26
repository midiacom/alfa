<template>
    <div>
        <h2>New VMS Type</h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">
            <b-form-group id="input-group-1" label="Name:" label-for="name">
                <b-form-input id="name" v-model="form.name" type="text" required/>
            </b-form-group>

            <b-form-group id="input-group-3" label="Docker Image:" label-for="dockerimage">
                <b-form-input id="dockerImage" v-model="form.dockerImage" type="text"/>
            </b-form-group>

            <b-form-group id="input-group-2" label="Description:" label-for="description">
                <b-form-input id="description" v-model="form.description" type="text"/>
            </b-form-group>

            <b-row>
                <b-col>
                    <b-button type="submit" variant="primary">Save</b-button>
                </b-col>
                <b-col class="text-right">
                    <b-button to="/vmsType" variant="secondary">Back</b-button>        
                </b-col>
            </b-row>
        </b-form>
  </div>
</template>

<script>
import {apiVmsType} from './api'

export default {
    name: 'locationNew',
    data() {
        return {
            form: {
                name: '',
                dockerImage: '',
                description: ''
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
            apiVmsType.newVmsType(this.form)
                .then(() => {
                    this.msg.text = "VMS Type saved"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.msg.text = `Error when saving VMS Type ${e}`
                    this.msg.type = "danger"
                })
        }
    }
}
</script>