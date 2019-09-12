<template>
  <div class="home">
    <h2 class="text-center">
      <v-icon style="width: 48px;" name="bar-chart"></v-icon>
      Dashboard
    </h2>
    <b-card-group deck>
      <b-card header="Location" class="text-center">
        <b-card-text>
          10
        </b-card-text>
      </b-card>
      <b-card header="Devices" class="text-center">
        <b-card-text>
          20
        </b-card-text>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>

export default {
  name: 'home',
}
</script>
