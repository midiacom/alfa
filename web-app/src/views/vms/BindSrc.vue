<template>
    <div>
        <h2>Bind VMS With a Device</h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">

        <b-form-group id="input-group-3" label="Device SRC:" label-for="deviceId">
            <b-form-select style="margin-top:0px!important" id="deviceId" v-model="form.deviceId" :options="devices" size="sm" class="mt-3"></b-form-select>
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
    {{ form }}
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
                deviceId: ''
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
                .then((vms) => {
                    // console.log(vms)
                })

            apiDevice.getDevicesToSelect()
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