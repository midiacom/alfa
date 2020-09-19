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
    // Configurations ROUTES    
    {
      path: '/configuration',
      name: 'configurationIndex',
      component: () => import(/* webpackChunkName: "locationIndex" */ './views/configuration/Index.vue')
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
      path: '/device/:id/log',
      name: 'virtualDeviceLog',
      component: () => import(/* webpackChunkName: "vmsEdit" */ './views/device/Log.vue')
    },


    {
      path: '/device/new',
      name: 'deviceNew',
      component: () => import(/* webpackChunkName: "deviceNew" */ './views/device/New.vue')
    },        
    {
      path: '/device/new/:connectionType',
      name: 'deviceNew',
      component: () => import(/* webpackChunkName: "deviceNew" */ './views/device/New.vue')
    },        
    {
      path: '/device/:id/edit',
      name: 'deviceEdit',
      component: () => import(/* webpackChunkName: "deviceEdit" */ './views/device/Edit.vue')
    },    

    {
      path: '/device/:id/details',
      name: 'deviceContainerDetails',
      component: () => import(/* webpackChunkName: "vmsTypeEdit" */ './views/device/ContainerDetails.vue')
    },

    // VMSTYPES ROUTES
    {
      path: '/vmsType',
      name: 'vmsTypeIndex',
      component: () => import(/* webpackChunkName: "vmsTypeIndex" */ './views/vmsType/Index.vue')
    },
    {
      path: '/vmsType/indexSrc',
      name: 'vmsTypeIndexSrc',
      component: () => import(/* webpackChunkName: "vmsTypeIndexSrc" */ './views/vmsType/IndexSrc.vue')
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
    
    // VMS ROUTES
    {
      path: '/vms',
      name: 'vmsIndex',
      component: () => import(/* webpackChunkName: "vmsIndex" */ './views/vms/Index.vue')
    },
    {
      path: '/vms/allvms',
      name: 'allVms',
      component: () => import(/* webpackChunkName: "vmsStopped" */ './views/vms/AllVms.vue')
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
    },

    {
      path: '/vms/:id/edit',
      name: 'vmsEdit',
      component: () => import(/* webpackChunkName: "vmsEdit" */ './views/vms/Edit.vue')
    },

    {
      path: '/vms/:id/ffmanager',
      name: 'vmsFFmanager',
      component: () => import(/* webpackChunkName: "vmsEdit" */ './views/vms/FFManager.vue')
    },

    {
      path: '/vms/:id/log',
      name: 'vmsLog',
      component: () => import(/* webpackChunkName: "vmsEdit" */ './views/vms/Log.vue')
    },

    {
      path: '/vms/:monitorName/monitor',
      name: 'vmsMonitor',
      component: () => import(/* webpackChunkName: "vmsEdit" */ './views/vms/Monitor.vue')
    },

    // Nodes ROUTES
    {
      path: '/node',
      name: 'nodeIndex',
      component: () => import(/* webpackChunkName: "nodeIndex" */ './views/node/Index.vue')
    },
    {
      path: '/node/new',
      name: 'nodeNew',
      component: () => import(/* webpackChunkName: "nodeNew" */ './views/node/New.vue')
    },        
    {
      path: '/node/:id/edit',
      name: 'nodeEdit',
      component: () => import(/* webpackChunkName: "nodeEdit" */ './views/node/Edit.vue')
    },        
    {
      path: '/node/:ip/images',
      name: 'nodeImages',
      component: () => import(/* webpackChunkName: "nodeImages" */ './views/node/Images.vue')
    },        
    {
      path: '/node/:id/status',
      name: 'nodeStatus',
      component: () => import(/* webpackChunkName: "nodeImages" */ './views/node/Status.vue')
    },
    // plugins
    {
      path: '/plugins/melinda',
      name: 'pluginsMelindaConfig',
      component: () => import(/* webpackChunkName: "nodeImages" */ './views/plugins/MELINDA/Melinda.vue')
    },    
  ]
})
