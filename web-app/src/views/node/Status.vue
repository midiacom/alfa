<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="git-commit"></v-icon>
                Edge Node Informations
            </h2>
        </b-col>
    </b-row>

    <b-row>
        <b-col>
            <json-viewer
            :value="status"
            :expand-depth=5
            copyable
            boxed
            sort></json-viewer>
        </b-col>
    </b-row>
    <br/>
    <b-row>
        <b-col class="text-right">
            <b-button to="/node" variant="secondary">Back</b-button>        
        </b-col>
    </b-row>
  </div>
</template>

<script>
import {apiNode} from './api'
import JsonViewer from 'vue-json-viewer'


export default {
    name: 'edgeNodeStatus',
    components: {JsonViewer},
    data() {
        return {
            status: []
        }
    },
    methods: {  
        refresh() {
            this.isBusy = true
            apiNode.getNodeStats(this.$route.params.id)
                .then((data) => {
                    this.status = data
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