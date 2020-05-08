<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="layers"></v-icon>
                Device Container Details
            </h2>
        </b-col>
    </b-row>

    <b-row>
        <b-col>
            <json-viewer
            :value="device"
            :expand-depth=5
            copyable
            boxed
            sort></json-viewer>
        </b-col>
    </b-row>
    <br/>
    <b-row>
        <b-col class="text-right">
            <b-button to="/device/" variant="secondary">Back</b-button>        
        </b-col>
    </b-row>
  </div>
</template>

<script>
import {apiDevice} from './api'
import JsonViewer from 'vue-json-viewer'


export default {
    name: 'deviceContainerDetails',
    components: {JsonViewer},
    data() {
        return {
            device: []
        }
    },
    methods: {  
        refresh() {
            this.isBusy = true
            apiDevice.getContainerDetails(this.$route.params.id)
                .then((data) => {
                    this.device = data
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