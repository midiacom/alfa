<template>
  <div>
    <b-row>
        <b-col>            
            <h2>
                <v-icon name="type"></v-icon>
                VMS Types
            </h2>
        </b-col>
        <b-col class="text-right">
            <b-button to="/vmsType/new" variant="success" size="sm" class="mr-2">New</b-button>    
        </b-col>
    </b-row>
    <b-table
        :busy="isBusy"
        :items="items" 
        :fields="fields" 
        striped 
        responsive="sm">
      <template slot="[actions]" slot-scope="row">
        <b-button variant="primary" size="sm" @click="editVmsType(row.item)" class="mr-2">
            Edit
        </b-button>

        <b-button variant="danger" size="sm" @click="removeVmsType(row.item)" class="mr-2">
            Remove
        </b-button>
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
        There are no VMS Types yet!
    </b-alert>

    <b-row>
        <b-col class="text-right">
            <strong>Total: {{ items.length }}</strong>
        </b-col>
    </b-row>

  </div>
</template>

<script>
import {apiVmsType} from './api'

export default {
    name: 'vmsTypeIndex',
    data() {
        return {
            isBusy: true,
            fields: [{
                key: 'name',
            },{
                key:'actions',
                class: 'vmsTypeIndexActions'
            }],
            items: []
        }
    },
    methods: {
        editVmsType (vmsType) {
            this.$router.push(`/vmsType/${vmsType._id}/edit`)
        },
        removeVmsType(vmsType) {
            this.$swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.value) {
                    apiVmsType.removeVmsType(vmsType._id)
                        .then(() => {
                            this.refresh()
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            })
        },
        refresh() {
            this.isBusy = true
            apiVmsType.getVmsTypes()
                .then((data) => {
                    this.items = data
                    this.isBusy = false
                })
                .catch(e => {
                    console.log(e)
                    this.isBusy = false
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>

<style>
    .vmsTypeIndexActions {
        width: 250px;
        text-align: center;
    }
</style>