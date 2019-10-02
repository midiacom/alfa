<template>
  <div id="app" class="h-100">
    <b-container fluid class="h-100">
      <b-row id="head">
        <h1>
          <img src="prism.png"> V-PRISM Manager
        </h1>
      </b-row>
      <b-row>        
        <b-col cols="2" id="menu">
          <ul>
            <li>
              <router-link to="/">
                <v-icon name="home"></v-icon>
                Home
              </router-link>
            </li>
            <li>
              <v-icon name="layers"></v-icon>
              VMS
              <ul>
                <li class="subMenu">
                  <router-link to="/vms">
                    -
                    Running
                  </router-link>
                </li>
                <li class="subMenu">
                  <router-link to="/vms/stopped">- All VMSs Started</router-link>
                </li>
              </ul>
            </li>
            <li>
              <router-link to="/location">
                <v-icon name="map-pin"></v-icon>
                Locations
              </router-link>
            </li>
            <li>
              <router-link to="/device">
                <v-icon name="cast"></v-icon>
                Devices
              </router-link>
            </li>
            <li>
              <router-link to="/vmsType">
                <v-icon name="command"></v-icon>
                VMS Types Plugins
              </router-link>
            </li>
            <li>
              <router-link to="/vmsType/indexSrc">
                <v-icon name="move"></v-icon>
                VMS Types SRC
              </router-link>
            </li>
            <hr/>
            <li>
              <a target="_blank" href="https://github.com/anselmobattisti/alfa">
                <v-icon name="github"></v-icon>
                Github
              </a>
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

#content {
  padding-top: 15px;
}

.subMenu {
  padding-left: 50px !important;
}

#head {
  background-color: #2c3e50;
  border-bottom: 15px solid #e5e5e5;
  padding-top: 5px;
  padding-left: 10px;
  color: #fff;
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
  min-height: 1024px;
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
  font-weight: bold;
}

#app #menu li:hover {
  background-color: #ccc;
}

#app #menu svg {
  margin-right: 10px;
}

.v-icon,
.custom-icon {
    width: 20px;
}

label {
  font-weight: bold;
}

</style>
