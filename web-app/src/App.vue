<template>
  <div id="app" class="h-100">
    <b-container fluid class="h-100">
      <b-row id="head">        
        <h1>
          <v-icon name="airplay"></v-icon>
          Virtual Multimidia Sensor Manager
        </h1>
      </b-row>
      <b-row>        
        <b-col cols="2" id="menu">
          <ul>
            <li>
              <v-icon name="home"></v-icon>
              <router-link to="/">Home</router-link>
            </li>
            <li>
              <v-icon name="map-pin"></v-icon>
              <router-link to="/location">Locations</router-link>
            </li>
            <li>
              <v-icon name="cast"></v-icon>
              <router-link to="/device">Devices</router-link>
            </li>
            <li>
              <v-icon name="type"></v-icon>
              <router-link to="/vmsType">VMS Types</router-link>
            </li>
          </ul>
        </b-col>
        <b-col class="h-100" id="content">
          <router-view/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<style>
html,body {
  height: 100%;
}

#head {
  border-bottom: 1px solid #e2e2e2;
  margin-bottom: 5px;
  padding-left: 10px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  min-height: 100%;
}

#menu {
  background-color: #e5e5e5;
  min-height: 600px;
  height: 100%;  
}

#app #menu ul {
  width: 100%;
  list-style-type: none;
  text-align: left;
  margin: 0px;
  padding: 0px;
}

#app #menu li {
  width: 100%;
  padding: 5px;
}

#app #menu li a {
  padding:0px
}

#app #menu li a:hover {
  text-decoration: none;
  font-weight: bolder;
}

#app #menu li:hover {
  background-color: #e9e9e9;
}

#app #menu svg {
  margin-right: 10px;
}

.v-icon,
.custom-icon {
    width: 20px;
}

</style>
