<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="align-justify"></v-icon>
                VMS Container LOG Details
            </h2>
        </b-col>
    </b-row>

    <b-row>
        <pre>
            {{ log }}
        </pre>
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
            log: "null"
        }
    },
    methods: {  
        refresh() {
            this.isBusy = true
            apiVms.getLog(this.$route.params.id)
                .then((data) => {
                    this.log = data
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