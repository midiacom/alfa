import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/location',
      name: 'locationIndex',
      component: () => import(/* webpackChunkName: "locationIndex" */ './views/location/Index.vue')
    },
    {
      path: '/location/new',
      name: 'locationNew',
      component: () => import(/* webpackChunkName: "locationNew" */ './views/location/New.vue')
    },
    {
      path: '/location/:id/edit',
      name: 'locationEdit',
      component: () => import(/* webpackChunkName: "locationEdit" */ './views/location/Edit.vue')
    },
    {
      path: '/location/:id/devices',
      name: 'locationDevices',
      component: () => import(/* webpackChunkName: "locationDevices" */ './views/location/Devices.vue')
    },
  ]
})
