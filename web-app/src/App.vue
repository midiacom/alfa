<template>
  <b-row id="app">
    <b-col id="nav">      
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
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
