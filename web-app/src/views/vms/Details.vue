<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="layers"></v-icon>
                VMS Details
            </h2>
        </b-col>
    </b-row>

    <b-row>
        <b-col>
            <json-viewer
            :value="vms"
            :expand-depth=5
            copyable
            boxed
            sort></json-viewer>
        </b-col>
    </b-row>
    <br/>
    <b-row>
        <b-col class="text-right">
            <b-button to="/vms/allvms" variant="secondary">Back</b-button>        
        </b-col>
    </b-row>
  </div>
</template>

<script>
import {apiVms} from './api'
import JsonViewer from 'vue-json-viewer'


export default {
    name: 'vmsDetails',
    components: {JsonViewer},
    data() {
        return {
            vms: []
        }
    },
    methods: {  
        refresh() {
            this.isBusy = true
            apiVms.getContainerDetails(this.$route.params.id)
                .then((data) => {
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