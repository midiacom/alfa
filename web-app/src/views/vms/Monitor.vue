<template>
  <div>
    <loading :active.sync="isLoading" :is-full-page="true"></loading>
    <b-row>
        <b-col>            
            <h2>
                <v-icon style="width: 32px;" name="layers"></v-icon>
                VMS Monitor <strong>{{this.$route.params.monitorName}}</strong>
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button @click="refresh()" variant="info" class="mr-2">
                <v-icon name="refresh-ccw"></v-icon>
                Update Monitor
            </b-button>
        </b-col>
    </b-row>

    <b-table
        small
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">

        <template v-slot:cell(senderip)="row">
            {{row.item.senderip}}:{{row.item.senderport}}
        </template>

        <template v-slot:cell(to)="row">
            {{row.item.toip}}:{{row.item.toport}}
        </template>

        <div slot="table-busy" class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
        </div>      
    </b-table>
    <b-alert 
        variant="secondary" 
        class="text-center" 
        :show=!items.length>
        There are no Monitors yet!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>

  </div>
</template>

<script>
import {apiVms} from './api'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
    name: 'vmsIndex',
    components: {Loading},
    data() {
        return {
            isBusy: true,
            isLoading: false,
            fields: [
            {
                key: 'senderip',
                label: 'Sender'
            },
            {
                key: 'to',
                label: 'To'
            },
            {
                key: 'milsec',
                label: 'Time Intervall'
            },
            {
                key: 'bs',
                label: 'Total Bytes'
            },
            {
                key: 'ps',
                label: 'Total Packages'
            },
            {
                key: 'timestamp',
                label: 'Timestamp'
            }],

            items: []
        }
    },
    methods: {
        refresh() {
            this.isBusy = true            
            apiVms.getMonitor(this.$route.params.monitorName)
                .then((data) => {
                    this.items = data
                    this.isBusy = false
                    this.isLoading = false
                })
                .catch(e => {
                    console.log(e)
                    this.isBusy = false
                    this.isLoading = false
                })
        }
    },
    created() {
        this.refresh()
    },

}
</script>

<style>
</style>