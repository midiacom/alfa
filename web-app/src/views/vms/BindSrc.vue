<template>
    <div>
        <loading :active.sync="isLoading" :is-full-page="true"></loading>      
        <h2>
            <v-icon style="width: 32px;" name="minimize-2"></v-icon>
            Bind VMS With a Virtual Device
        </h2>

        <b-alert :show="msg.text" :v-show="msg.text" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-alert show=true variant="info">
            The Device SRC <strong>MUST BE</strong> started before binded with the VMS. <br/>
            Before bind the VMS wait some seconds to docker starts the container properly.
        </b-alert>

        <b-form @submit="onSubmit">

        <b-form-group id="input-group-2" label="Choose the device that will send the data:" label-for="deviceId">
            <b-form-select style="margin-top:0px!important" id="deviceId" v-model="form.deviceId" :options="devices" size="sm" class="mt-3"></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-3" label="In which port the VMS is listening for this multimedia stream?" label-for="port">
            <ul style="font-size: 18px; list-style: none">
                <li v-for="port in ports" :key="port" >
                    <label><input type="radio" v-model="form.port" name="port" :value=port :disabled=isBinded(port)>
                        &nbsp;{{port}}
                    </label> &nbsp;
                    <a href="#" @click="unbind(port)" v-show="isBinded(port)">
                        Unbind ({{ getDeviceName(port) }})
                    </a>
                </li>
            </ul>
        </b-form-group>        

        <b-row>
            <b-col>
                <b-button type="submit" variant="primary">Bind</b-button>
            </b-col>
            <b-col class="text-right">
                <b-button to="/vms/allvms" variant="secondary">Back</b-button>        
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
            vms: {
                bindedTo: []
            },
            devices: [],
            device: [],
            ports: [],
            form: {
                vmsId: '',
                deviceId: '',
                port: ''
            },
            msg: {
                text: false,
                type: ''
            }
        }
    },
    methods: {

        getDeviceName(port) {
            let name = "";
            this.vms.bindedTo.forEach((e) =>  {
                if (e.port == port) {
                    this.devices.forEach((el) => {
                        if (el.value == e.device){
                            name = el.text
                        }
                    })
                }
            })
            return name;
        },

        unbind(port) {            
            let data = {
                vmsId: this.vms._id,
                deviceId: '',
                port: port
            }

            this.vms.bindedTo.forEach(function(e) {
                if (e.port == port) {
                    data.deviceId = e.device
                }
            })

            apiVms.unbindSrc(data)
                .then(() => {
                    this.isLoading = false
                    this.msg.text = "VMS unbinded"
                    this.msg.type = "success"
                    this.refresh();
                })
                .catch((e) => {
                    this.isLoading = false
                    this.msg.text = `Error when binding the VMS ${e}`
                    this.msg.type = "danger"
                    this.refresh();
                })
        },

        isBinded(port) {
            let ret = false
            this.vms.bindedTo.forEach(function(e) {
                if (e.port == port) {
                    ret = true
                }
            })
            return ret
        },

        onSubmit(evt) {
            this.isLoading = true
            evt.preventDefault()
            if (!this.form.deviceId) {
                this.isLoading = false
                this.msg.text = `You must need to select the device!`
                this.msg.type = "danger"
                return false;
            }

            if (!this.form.port) {
                this.isLoading = false
                this.msg.text = `You must need to select the port!`
                this.msg.type = "danger"
                return false;
            }

            apiVms.bindSrc(this.form)
                .then(() => {
                    this.isLoading = false
                    this.msg.text = "VMS binded"
                    this.msg.type = "success"
                    this.refresh();
                })
                .catch((e) => {
                    this.isLoading = false
                    this.msg.text = `Error when binding the VMS ${e}`
                    this.msg.type = "danger"
                    this.refresh();
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
                    this.form.port = this.ports[0]
                })

            apiVms.getVms(id)
                .then((vms) => {
                    this.isLoading = false
                    this.vms = vms                    
                })

            apiVms.getContainerDetails(id)
                .then((dc) => {
                    if (dc.length == 0) {
                        this.$swal.fire({
                            title: 'VMS Stopped!',
                            text: "You need to start the VMS first!",
                            type: 'warning',
                        }).then(() => {                
                            this.$router.push(`/vms/allvms`)
                        })
                    }
                })
                .catch(e => {
                    console.log(e)
                })                    

            apiDevice.getDevicesToSelectSRCStarted()
                .then((devices) => {
                    this.isLoading = false
                    this.devices = devices

                    if (this.devices.length == 0) {
                        this.$swal.fire({
                            title: 'No Device Started!',
                            text: "You need at least one started device to bind!",
                            type: 'warning',
                        }).then(() => {                
                            this.$router.push(`/device/`)
                        })
                    }

                    this.form.deviceId = this.devices[0].value
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>