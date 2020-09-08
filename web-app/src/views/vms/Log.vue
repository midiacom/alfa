<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="align-justify"></v-icon>
                VMS Container LOG Details
            </h2>
        </b-col>
        <b-col>
            <v-icon style="width: 32px;" name="clock"></v-icon>
            Realod in <strong>{{ reload_time }}</strong> seconds
        </b-col>
    </b-row>
    <hr/>

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

export default {
    name: 'vmsLog',
    data() {
        return {
            log: "null",
            reload_time: 5
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
        },
        countDownTimer() {
            if(this.reload_time >= 0) {
                setTimeout(() => {
                    this.reload_time -= 1
                    this.refresh()
                    this.countDownTimer()
                }, 1000)
            } else {
                this.reload_time = 5
                this.countDownTimer()
            }
        }        
    },

    created() {
        this.refresh()
        this.countDownTimer()
    }
}
</script>

<style>    
</style>