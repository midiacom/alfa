<template>
    <div>
        <h2>
            <v-icon style="width: 32px;" name="minimize-2"></v-icon>
            Bind VMS With a Device
        </h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-alert show=true variant="info">
            The Device SRC <strong>MUST BE</strong> started before binded with the VMS. <br/>
            Before bind the VMS wait some seconds to docker starts the container properly.
        </b-alert>

        <b-form @submit="onSubmit">

        <b-form-group id="input-group-2" label="Chose the device that will send the data:" label-for="deviceId">
            <b-form-select style="margin-top:0px!important" id="deviceId" v-model="form.deviceId" :options="devices" size="sm" class="mt-3"></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-3" label="In which port the VMS is listening?:" label-for="port">
            <b-form-input id="port" v-model="form.port" type="text"/>
        </b-form-group>        

        <b-row>
            <b-col>
                <b-button type="submit" variant="primary">Bind</b-button>
            </b-col>
            <b-col class="text-right">
                <b-button to="/vms" variant="secondary">Back</b-button>        
            </b-col>
        </b-row>
    </b-form>
  </div>
</template>

<script>
import {apiVms} from './api'
import {apiDevice} from '../device/api'

export default {
    name: 'vmsBind',
    data() {
        return {
            devices: [],
            device: [],
            form: {
                vmsId: '',
                deviceId: '',
                port: 5000
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
            apiVms.bindSrc(this.form)
                .then(() => {
                    this.msg.text = "VMS binded"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.msg.text = `Error when binding the VMS ${e}`
                    this.msg.type = "danger"
                })
        },
        refresh() {
            let id = this.$route.params.id;
            this.form.vmsId = id;
            apiVms.getVms(id)
                .then(() => {
                    // console.log(vms)
                })

            apiDevice.getDevicesToSelectSRCStarted()
                .then((devices) => {
                    this.devices = devices
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>