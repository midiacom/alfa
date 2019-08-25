import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import feather from 'vue-icon'

Vue.use(feather, {
  name: 'v-icon',
  props: {
      baseClass: {
          type: String,
          default: 'v-icon'
      },
      classPrefix: {
          type: String,
          default: 'v-icon-'
      }
  }
})

Vue.use(BootstrapVue)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
