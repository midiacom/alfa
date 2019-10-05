<template>
    <div>
        <loading :active.sync="isLoading" :is-full-page="true"></loading>      
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

        <b-form-group id="input-group-3" label="In which port the VMS is listening for this data stream?" label-for="port">
            <ul style="font-size: 18px; list-style: none">
                <li v-for="port in ports" :key="port" ><label><input checked type="radio" v-model="form.port" name="port" :value=port>&nbsp;{{port}}</label></li>
            </ul>
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
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'vmsBind',
    components: {Loading},
    data() {
        return {
            isLoading: true,
            devices: [],
            device: [],
            ports: [],
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
            this.isLoading = true
            evt.preventDefault()
            apiVms.bindSrc(this.form)
                .then(() => {
                    this.isLoading = false
                    this.msg.text = "VMS binded"
                    this.msg.type = "success"
                })
                .catch((e) => {
                    this.isLoading = false
                    this.msg.text = `Error when binding the VMS ${e}`
                    this.msg.type = "danger"
                })
        },
        refresh() {
            this.isLoading = true
            let id = this.$route.params.id;
            this.form.vmsId = id;
            apiVms.getType(id)
                .then((vmsType) => {
                    this.isLoading = false
                    this.ports = vmsType.ports.split(";")
                })

            apiDevice.getDevicesToSelectSRCStarted()
                .then((devices) => {
                    this.isLoading = false
                    this.devices = devices
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>