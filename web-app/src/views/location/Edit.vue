<template>
    <div>
        <h2>Edit Location</h2>

        <b-alert :show="msg.show" :variant=msg.type>
            {{ msg.text }}
        </b-alert>

        <b-form @submit="onSubmit">
        <b-form-group id="input-group-1" label="Name:" label-for="name">
            <b-form-input id="name" v-model="form.name" type="text" required/>
        </b-form-group>

        <b-form-group id="input-group-2" label="Description:" label-for="description">
            <b-form-input id="description" v-model="form.description" type="text"/>
        </b-form-group>

        <b-row>
            <b-col>
                <b-button type="submit" variant="primary">Save</b-button>
            </b-col>
            <b-col class="text-right">
                <b-button to="/location" variant="secondary">Back</b-button>        
            </b-col>
        </b-row>
    </b-form>
  </div>
</template>

<script>
import {apiLocation} from './api'

export default {
    name: 'locationEdit',
    data() {
        return {
            form: {
                id: '',
                name: '',
                description: ''
            },
            msg: {
                text: false,
                type: '',
                show: false
            }
        }
    },
    methods: {
        hasMessage() {
            if (this.msg.text) return true
            return false
        },
        onSubmit(evt) {
            evt.preventDefault()
            apiLocation.updateLocation(this.form)
                .then(() => {
                    this.msg.text = "Location saved"
                    this.msg.type = "success"
                    this.msg.show = true
                })
                .catch((e) => {
                    this.msg.text = `Error when saving location ${e}`
                    this.msg.type = "danger"
                    this.msg.show = true
                })
        },
        refresh() {
            apiLocation.getLocation(this.$route.params.id)
                .then((location) => {
                    this.form.id = location._id
                    this.form.name = location.name
                    this.form.description = location.description
                })
        }
    },
    created() {
        this.refresh()
    }
}
</script>