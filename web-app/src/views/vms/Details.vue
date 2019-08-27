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
            {{ vms }}
        </b-col>
    </b-row>

  </div>
</template>

<script>
import {apiVms} from './api'

export default {
    name: 'vmsDetails',
    data() {
        return {
            vms: []
        }
    },
    methods: {  
        refresh() {
            this.isBusy = true
            apiVms.getVms(this.$route.params.id)
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