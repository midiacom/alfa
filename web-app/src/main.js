import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import feather from 'vue-icon'
import VueSweetalert2 from 'vue-sweetalert2';

// If you don't need the styles, do not connect
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.use(VueSweetalert2);

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

var filter = function(text, length, clamp){
  clamp = clamp || '...';
  var node = document.createElement('div');
  node.innerHTML = text;
  var content = node.textContent;
  return content.length > length ? content.slice(0, length) + clamp : content;
};

var showPorts = function (text) {
  let ret = "";
  text.forEach(function(e) {
    ret += `${e.port}; `
  })
  return ret;
}

Vue.filter('truncate', filter);
Vue.filter('showPorts', showPorts);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
