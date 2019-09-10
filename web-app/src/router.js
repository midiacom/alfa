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
    // LOCATION ROUTES    
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

    // DEVICES ROUTES
    {
      path: '/device',
      name: 'deviceIndex',
      component: () => import(/* webpackChunkName: "deviceIndex" */ './views/device/Index.vue')
    },
    {
      path: '/device/new',
      name: 'deviceNew',
      component: () => import(/* webpackChunkName: "deviceNew" */ './views/device/New.vue')
    },        
    {
      path: '/device/:id/edit',
      name: 'deviceEdit',
      component: () => import(/* webpackChunkName: "deviceEdit" */ './views/device/Edit.vue')
    },    

    // VMSTYPES ROUTES
    {
      path: '/vmsType',
      name: 'vmsTypeIndex',
      component: () => import(/* webpackChunkName: "vmsTypeIndex" */ './views/vmsType/Index.vue')
    },
    {
      path: '/vmsType/new',
      name: 'vmsTypeNew',
      component: () => import(/* webpackChunkName: "vmsTypeNew" */ './views/vmsType/New.vue')
    },        
    {
      path: '/vmsType/:id/edit',
      name: 'vmsTypeEdit',
      component: () => import(/* webpackChunkName: "vmsTypeEdit" */ './views/vmsType/Edit.vue')
    },    
    
    // VMSTYPES ROUTES
    {
      path: '/vms',
      name: 'vmsIndex',
      component: () => import(/* webpackChunkName: "vmsIndex" */ './views/vms/Index.vue')
    },
    {
      path: '/vms/stopped',
      name: 'vmsStopped',
      component: () => import(/* webpackChunkName: "vmsStopped" */ './views/vms/Stopped.vue')
    },
    {
      path: '/vms/new/:id',
      name: 'vmsNew',
      component: () => import(/* webpackChunkName: "vmsNew" */ './views/vms/New.vue')
    },        
    {
      path: '/vms/:id/details',
      name: 'vmsDetails',
      component: () => import(/* webpackChunkName: "vmsTypeEdit" */ './views/vms/Details.vue')
    },
    {
      path: '/vms/:id/bindSrc',
      name: 'vmsBindSrc',
      component: () => import(/* webpackChunkName: "vmsBindSrc" */ './views/vms/BindSrc.vue')
    }
  ]
})
