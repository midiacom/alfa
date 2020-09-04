<template>
  <div>
    <loading :active.sync="isLoading" :is-full-page="true"></loading>

    <b-row>
        <b-col>            
            <h2>
            <v-icon style="width: 32px;" name="settings"></v-icon>
                Configurations
            </h2>
        </b-col>
    </b-row>

    <b-alert :show="msg.show" :variant=msg.type>
        {{ msg.text }}
    </b-alert>

    <b-row>
        <b-col>
            <b-card-group deck>
                <b-card title="Clear Database">
                    <b-card-text>Remove all data stored in database.</b-card-text>
                    <b-button variant="danger" class="mr-2" @click="cleanDb()">
                        <v-icon name="trash"></v-icon>
                        Clear Database
                    </b-button>
                </b-card>

                <b-card title="Import Data">
                    <b-card-text>Import the basic data from running ALFA, VMS Types, VD Types, Devices, Locations and Edge Nodes.</b-card-text>
                    <b-button variant="success" class="mr-2" @click="bootstrap()">
                        <v-icon name="trash"></v-icon>
                        Bootstrap
                    </b-button>
                </b-card>
            </b-card-group>            
        </b-col>
    </b-row>
  </div>
</template>

<script>
import {apiConfiguration} from './api'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'configurationIndex',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            msg: {
                show: false,
                text: false,
                type: ''
            },
        }
    },
    methods: {
        cleanDb () {
            let that = this;
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, clear the database!'
            }).then((result) => {                
                if (result.value) {
                    that.isLoading = true
                    apiConfiguration.cleanDb()
                        .then((e) => {
                            console.log(e);
                            that.isLoading = false                            
                            that.msg.show = true
                            that.msg.text = "Database cleaned"
                            that.msg.type = "success"
                        })
                        .catch(e => {
                            that.isLoading = false
                            console.log(e)
                        })
                }
            })
        },

        bootstrap () {
            let that = this;
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, clear the database!'
            }).then((result) => {                
                if (result.value) {
                    // that.isLoading = true
                    apiConfiguration.bootstrap()
                        .then((e) => {
                            console.log(e);
                            that.isLoading = false                            
                            that.msg.show = true
                            that.msg.text = "Data imported"
                            that.msg.type = "success"
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            })
        }
    },
    created() {
        // this.refresh()
    },

}
</script>

<style>
    
</style>