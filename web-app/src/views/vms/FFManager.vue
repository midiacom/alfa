<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="arrow-up-right"></v-icon>
                Foward Manager
            </h2>
        </b-col>
    </b-row>

    <loading :active.sync="isLoading" :is-full-page="true"></loading>

    <b-alert :show="msg.show" :variant=msg.type>
        {{ msg.text }}
    </b-alert>
    <b-container>
    <b-row>
        <b-col>
            <h3>Add Forwared</h3>
            <b-form @submit="onSubmit">                
                <b-form-group id="input-group-2" label="IP:" label-for="ip">
                    <b-form-input id="ip" v-model="form.ip" type="text"/>
                </b-form-group>

                <b-form-group id="input-group-3" label="Port:" label-for="port">
                    <b-form-input id="port" v-model="form.port" type="text"/>
                </b-form-group>

                <b-row>
                    <b-col>
                        <b-button type="submit" variant="primary">Save</b-button>
                    </b-col>
                    <b-col class="text-right">
                        <b-button to="/vms/allvms" variant="secondary">Back</b-button>        
                    </b-col>
                </b-row>
            </b-form>
        </b-col>
        <b-col>
            <h3>List Forward</h3>

            <b-list-group v-show="vms.forward.length > 0">
                <b-list-group-item v-for="item in vms.forward" :key="item._id">
                    {{ item.ip }}:{{ item.port }}
                    <b-button title="Remove forwarding" variant="danger" size="sm" @click="remove(item)" class="mr-2">
                        <v-icon name="trash"></v-icon>
                    </b-button>  
                </b-list-group-item>
            </b-list-group>

            <b-alert 
                variant="secondary" 
                class="text-center" 
                :show=!vms.forward.length>
                There are no forward itens yet!
            </b-alert>            
        </b-col>
    </b-row>
    </b-container>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

import {apiVms} from './api'

export default {
    name: 'vmsForwarding',
    components: {Loading},
    data() {
        return {
            vms: [],
            form: {
                vmsId: '',
                ip: '',
                port: '',

            },
            msg: {
                text: false,
                type: '',
                show: false
            },            
            isLoading: false
        }
    },
    methods: {          
        remove(forward) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, stop it!'
            }).then((result) => {
                if (result.value) {
                    apiVms.remFoward({
                        vmsId: this.vms._id,
                        forwardId: forward._id
                    })
                    .then(() => {
                        this.refresh()
                    })
                    .catch(e => {
                        this.refresh()
                        console.log(e)
                    })
                }
            })
        },

        onSubmit(evt) {
            evt.preventDefault()
            this.isLoading = true;
            apiVms.addFoward(this.form)
                .then(() => {
                    this.msg.text = "Foward Added"
                    this.msg.type = "success"
                    this.msg.show = true
                    this.isLoading = false
                    this.refresh()
                })
                .catch((e) => {
                    this.msg.text = `Error when fowarding ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                    this.isLoading = false
                    this.refresh()
                })
        },

        refresh() {
            this.isBusy = true
            apiVms.getVms(this.$route.params.id)
                .then((data) => {
                    this.form.vmsId = this.$route.params.id
                    this.vms = data
                })
                .catch(e => {
                    console.log(e)
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>

<style>    
</style>