<template>
  <div id="app">
    <b-container fluid>
      <b-row>
        <h1>Virtual Multimidia Sensor Manager</h1>
      </b-row>
      <b-row>
        <b-col cols="1" id="menu">
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/location">Location</router-link></li>
            <li><router-link to="/devices">Devices</router-link></li>
          </ul>
        </b-col>
        <b-col>
          <router-view/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  min-height: 100%;
}

#menu {
  background-color: #2c3e50
}

#app #menu ul {
  width: 100%;
  list-style-type: none;
  text-align: left;
  margin: 0px;
  padding: 0px;
}

</style>
