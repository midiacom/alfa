<template>
    <div>
        <h2>New Location</h2>
        <b-form @submit="onSubmit">
        <b-form-group id="input-group-1" label="Name:" label-for="name">
            <b-form-input id="name" v-model="form.name" type="text" required/>
        </b-form-group>

        <b-form-group id="input-group-2" label="Description:" label-for="description">
            <b-form-input id="description" v-model="form.description" type="text"/>
        </b-form-group>

        <b-button type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script>
import {apiLocation} from './api'

export default {
    name: 'locationNew',
    data() {
        return {
            form: {
                name: '',
                description: ''
            }
        }
    },
    methods: {
        onSubmit(evt) {
            evt.preventDefault()
            apiLocation.newLocation(this.form)
                .then((result) => {
                    console.log(result)
                })
        }
    }
}
</script>