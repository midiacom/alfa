<template>
  <div>
    <b-table striped hover :items="items"></b-table>
  </div>
</template>

<script>
import {apiLocation} from './api'

export default {
    name: 'locationIndex',
    data() {
        return {
            items: []
        }
    },
    methods: {

    },
    created() {
        apiLocation.getLocations()
            .then((data) => {
                this.items = data
            })
            .catch(e => {
                console.log(e)
            })
    }
}
</script>