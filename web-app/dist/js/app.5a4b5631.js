(function(n){function e(e){for(var o,a,c=e[0],s=e[1],d=e[2],u=0,m=[];u<c.length;u++)a=c[u],Object.prototype.hasOwnProperty.call(i,a)&&i[a]&&m.push(i[a][0]),i[a]=0;for(o in s)Object.prototype.hasOwnProperty.call(s,o)&&(n[o]=s[o]);f&&f(e);while(m.length)m.shift()();return r.push.apply(r,d||[]),t()}function t(){for(var n,e=0;e<r.length;e++){for(var t=r[e],o=!0,a=1;a<t.length;a++){var c=t[a];0!==i[c]&&(o=!1)}o&&(r.splice(e--,1),n=s(s.s=t[0]))}return n}var o={},a={app:0},i={app:0},r=[];function c(n){return s.p+"js/"+({deviceEdit:"deviceEdit",deviceIndex:"deviceIndex",deviceNew:"deviceNew",locationDevices:"locationDevices",locationEdit:"locationEdit",locationIndex:"locationIndex",locationNew:"locationNew",nodeEdit:"nodeEdit","nodeImages~vmsTypeEdit":"nodeImages~vmsTypeEdit",nodeImages:"nodeImages",vmsTypeEdit:"vmsTypeEdit",nodeIndex:"nodeIndex",nodeNew:"nodeNew",vmsBindSrc:"vmsBindSrc",vmsEdit:"vmsEdit",vmsIndex:"vmsIndex",vmsNew:"vmsNew",vmsStopped:"vmsStopped",vmsTypeIndex:"vmsTypeIndex",vmsTypeIndexSrc:"vmsTypeIndexSrc",vmsTypeNew:"vmsTypeNew"}[n]||n)+"."+{deviceEdit:"72ae7cfb",deviceIndex:"244f4388",deviceNew:"3de89817",locationDevices:"769b5212",locationEdit:"5f478bd9",locationIndex:"1f67fc27",locationNew:"ce914df0",nodeEdit:"16dd4e55","nodeImages~vmsTypeEdit":"f39fa060",nodeImages:"a67c1e16",vmsTypeEdit:"3cf8ca8b",nodeIndex:"b6ec1a61",nodeNew:"63ba43b6",vmsBindSrc:"8aae8b99",vmsEdit:"b0060cbc",vmsIndex:"12bf15b9",vmsNew:"e5305305",vmsStopped:"7f7a955c",vmsTypeIndex:"67772de1",vmsTypeIndexSrc:"324afd26",vmsTypeNew:"cf017562"}[n]+".js"}function s(e){if(o[e])return o[e].exports;var t=o[e]={i:e,l:!1,exports:{}};return n[e].call(t.exports,t,t.exports,s),t.l=!0,t.exports}s.e=function(n){var e=[],t={deviceIndex:1,locationDevices:1,locationIndex:1,nodeImages:1,nodeIndex:1,vmsBindSrc:1,vmsEdit:1,vmsIndex:1,vmsNew:1,vmsStopped:1,vmsTypeIndex:1,vmsTypeIndexSrc:1};a[n]?e.push(a[n]):0!==a[n]&&t[n]&&e.push(a[n]=new Promise((function(e,t){for(var o="css/"+({deviceEdit:"deviceEdit",deviceIndex:"deviceIndex",deviceNew:"deviceNew",locationDevices:"locationDevices",locationEdit:"locationEdit",locationIndex:"locationIndex",locationNew:"locationNew",nodeEdit:"nodeEdit","nodeImages~vmsTypeEdit":"nodeImages~vmsTypeEdit",nodeImages:"nodeImages",vmsTypeEdit:"vmsTypeEdit",nodeIndex:"nodeIndex",nodeNew:"nodeNew",vmsBindSrc:"vmsBindSrc",vmsEdit:"vmsEdit",vmsIndex:"vmsIndex",vmsNew:"vmsNew",vmsStopped:"vmsStopped",vmsTypeIndex:"vmsTypeIndex",vmsTypeIndexSrc:"vmsTypeIndexSrc",vmsTypeNew:"vmsTypeNew"}[n]||n)+"."+{deviceEdit:"31d6cfe0",deviceIndex:"7fc0d0a2",deviceNew:"31d6cfe0",locationDevices:"87f6a13f",locationEdit:"31d6cfe0",locationIndex:"a35edeea",locationNew:"31d6cfe0",nodeEdit:"31d6cfe0","nodeImages~vmsTypeEdit":"31d6cfe0",nodeImages:"fa591ae4",vmsTypeEdit:"31d6cfe0",nodeIndex:"c6fe7999",nodeNew:"31d6cfe0",vmsBindSrc:"2d5f29c2",vmsEdit:"2d5f29c2",vmsIndex:"d2822efb",vmsNew:"2d5f29c2",vmsStopped:"ccbba160",vmsTypeIndex:"6baa3529",vmsTypeIndexSrc:"93019d6e",vmsTypeNew:"31d6cfe0"}[n]+".css",i=s.p+o,r=document.getElementsByTagName("link"),c=0;c<r.length;c++){var d=r[c],u=d.getAttribute("data-href")||d.getAttribute("href");if("stylesheet"===d.rel&&(u===o||u===i))return e()}var m=document.getElementsByTagName("style");for(c=0;c<m.length;c++){d=m[c],u=d.getAttribute("data-href");if(u===o||u===i)return e()}var f=document.createElement("link");f.rel="stylesheet",f.type="text/css",f.onload=e,f.onerror=function(e){var o=e&&e.target&&e.target.src||i,r=new Error("Loading CSS chunk "+n+" failed.\n("+o+")");r.code="CSS_CHUNK_LOAD_FAILED",r.request=o,delete a[n],f.parentNode.removeChild(f),t(r)},f.href=i;var l=document.getElementsByTagName("head")[0];l.appendChild(f)})).then((function(){a[n]=0})));var o=i[n];if(0!==o)if(o)e.push(o[2]);else{var r=new Promise((function(e,t){o=i[n]=[e,t]}));e.push(o[2]=r);var d,u=document.createElement("script");u.charset="utf-8",u.timeout=120,s.nc&&u.setAttribute("nonce",s.nc),u.src=c(n);var m=new Error;d=function(e){u.onerror=u.onload=null,clearTimeout(f);var t=i[n];if(0!==t){if(t){var o=e&&("load"===e.type?"missing":e.type),a=e&&e.target&&e.target.src;m.message="Loading chunk "+n+" failed.\n("+o+": "+a+")",m.name="ChunkLoadError",m.type=o,m.request=a,t[1](m)}i[n]=void 0}};var f=setTimeout((function(){d({type:"timeout",target:u})}),12e4);u.onerror=u.onload=d,document.head.appendChild(u)}return Promise.all(e)},s.m=n,s.c=o,s.d=function(n,e,t){s.o(n,e)||Object.defineProperty(n,e,{enumerable:!0,get:t})},s.r=function(n){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},s.t=function(n,e){if(1&e&&(n=s(n)),8&e)return n;if(4&e&&"object"===typeof n&&n&&n.__esModule)return n;var t=Object.create(null);if(s.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var o in n)s.d(t,o,function(e){return n[e]}.bind(null,o));return t},s.n=function(n){var e=n&&n.__esModule?function(){return n["default"]}:function(){return n};return s.d(e,"a",e),e},s.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},s.p="/",s.oe=function(n){throw console.error(n),n};var d=window["webpackJsonp"]=window["webpackJsonp"]||[],u=d.push.bind(d);d.push=e,d=d.slice();for(var m=0;m<d.length;m++)e(d[m]);var f=u;r.push([0,"chunk-vendors"]),t()})({0:function(n,e,t){n.exports=t("56d7")},"034f":function(n,e,t){"use strict";var o=t("64a9"),a=t.n(o);a.a},"56d7":function(n,e,t){"use strict";t.r(e);t("ac6a"),t("cadf"),t("551c"),t("f751"),t("097d");var o=t("2b0e"),a=function(){var n=this,e=n.$createElement,t=n._self._c||e;return t("div",{staticClass:"h-100",attrs:{id:"app"}},[t("b-container",{staticClass:"h-100",attrs:{fluid:""}},[t("b-row",{attrs:{id:"head"}},[t("div",[t("img",{staticStyle:{float:"left"},attrs:{src:"prism.png"}}),t("div",{staticStyle:{"font-size":"40px",float:"left","margin-top":"3px"}},[t("em",[n._v(" ALFA - IoMT Manager ")])])])]),t("b-row",[t("b-col",{attrs:{cols:"2",id:"menu"}},[t("ul",[t("li",[t("router-link",{attrs:{to:"/"}},[t("v-icon",{attrs:{name:"home"}}),n._v("\n              Home\n            ")],1)],1),t("li",[t("router-link",{attrs:{to:"/vms/allvms"}},[t("v-icon",{attrs:{name:"layers"}}),n._v("\n              VMS\n            ")],1)],1),t("li",[t("router-link",{attrs:{to:"/device"}},[t("v-icon",{attrs:{name:"cast"}}),n._v("\n              Virtual Devices\n            ")],1)],1),t("li",[t("router-link",{attrs:{to:"/node"}},[t("v-icon",{attrs:{name:"git-commit"}}),n._v("\n              Edge Nodes\n            ")],1)],1),t("li",[t("router-link",{attrs:{to:"/location"}},[t("v-icon",{attrs:{name:"map-pin"}}),n._v("\n              Locations\n            ")],1)],1),t("li",[t("v-icon",{attrs:{name:"book"}}),n._v("\n            Types\n            "),t("ul",[t("li",{staticClass:"subMenu"},[t("router-link",{attrs:{to:"/vmsType"}},[t("v-icon",{attrs:{name:"layers"}}),n._v("\n                  VMS\n                ")],1)],1),t("li",{staticClass:"subMenu"},[t("router-link",{attrs:{to:"/vmsType/indexSrc"}},[t("v-icon",{attrs:{name:"cast"}}),n._v("\n                  VD\n                ")],1)],1)])],1),t("li",[t("router-link",{attrs:{to:"/configuration"}},[t("v-icon",{attrs:{name:"settings"}}),n._v("\n              Configurations\n            ")],1)],1),t("li",[t("a",{attrs:{target:"_blank",href:"https://github.com/anselmobattisti/alfa"}},[t("v-icon",{attrs:{name:"github"}}),n._v("\n              Github\n            ")],1)])])]),t("b-col",{staticClass:"h-100",attrs:{id:"content"}},[t("router-view")],1)],1)],1)],1)},i=[],r=(t("034f"),t("2877")),c={},s=Object(r["a"])(c,a,i,!1,null,null,null),d=s.exports,u=t("8c4f"),m=function(){var n=this,e=n.$createElement,t=n._self._c||e;return t("div",{staticClass:"home"},[t("h2",{staticClass:"text-center"},[n._v("\n    Dashboard\n  ")]),t("hr"),t("b-alert",{attrs:{show:n.showMsg,variant:"danger"}},[t("h3",[n._v("Important!")]),t("strong",[n._v("Before using this system you need to build the docker images from SRC and VMS. The easy way to do it is running ./compile_src_and_vms.sh at the alfa/alfa folder .")])]),t("b-alert",{attrs:{show:n.showMsg}},[t("h3",[n._v("It seems that is the first time you are here!")]),t("p",[n._v("If it's true then to run the above button and import the initial data.")]),t("hr"),t("strong",[n._v("This button will gerenate the above data.")]),t("ul",[t("li",[n._v("One Edge Node")]),t("li",[n._v("One Location")]),t("li",[n._v("6 SRC Types")]),t("li",[n._v("4 VMS Types")]),t("li",[n._v("6 Devices")])]),t("b-button",{attrs:{variant:"warning",size:"lg"},on:{click:function(e){return n.bootstrap()}}},[n._v("Import Data")])],1),t("div",{staticStyle:{"font-size":"18px"},attrs:{show:!n.showMsg}},[t("b-card-group",{attrs:{deck:""}},[t("b-card",{attrs:{"bg-variant":"light","text-variant":"black"}},[t("b-card-title",[t("strong",[t("v-icon",{attrs:{name:"cast"}}),n._v("\n            Devices\n          ")],1)]),t("hr"),t("b-card-text",[t("ul",[t("li",[t("strong",[n._v("Created:")]),n._v(" "+n._s(n.devices.total)+"\n          ")]),t("li",[t("strong",[n._v("Started:")]),n._v(" "+n._s(n.devices.started)+"\n          ")])])]),t("b-button",{staticClass:"mr-2",attrs:{to:"/device",variant:"success"}},[n._v("\n        List Devices\n      ")])],1),t("b-card",{attrs:{"bg-variant":"light","text-variant":"black"}},[t("b-card-title",[t("strong",[t("v-icon",{attrs:{name:"command"}}),n._v("\n            VMS\n          ")],1)]),t("hr"),t("b-card-text",[t("ul",[t("li",[t("strong",[n._v("Created:")]),n._v(" "+n._s(n.vms.started)+"\n          ")]),t("li",[t("strong",[n._v("Running:")]),n._v(" #\n          ")])])]),t("b-button",{staticClass:"mr-2 center",attrs:{to:"/vms/allvms",variant:"success"}},[n._v("\n        List VMS\n      ")])],1),t("b-card",{attrs:{"bg-variant":"light","text-variant":"black"}},[t("b-card-title",[t("strong",[t("v-icon",{attrs:{name:"git-commit"}}),n._v("\n            Edge Nodes\n          ")],1)]),t("hr"),t("b-card-text",[t("ul",[t("li",[t("strong",[n._v("Deployed:")]),n._v(" "+n._s(n.node.total)+"\n          ")]),t("li",[t("strong",[n._v("Running:")]),n._v(" "+n._s(n.node.running)+"\n          ")])])]),t("b-button",{staticClass:"mr-2",attrs:{to:"/vms/allvms",variant:"success"}},[n._v("\n        List Edge Nodes\n      ")])],1)],1),t("hr"),t("div",[t("b-row",[t("b-col",{staticStyle:{"text-align":"center"}},[t("b-button",{directives:[{name:"b-toggle",rawName:"v-b-toggle.sidebar-right",modifiers:{"sidebar-right":!0}}],attrs:{variant:"info"}},[t("v-icon",{attrs:{name:"help-circle"}}),n._v("\n      More Informations\n    ")],1),t("b-sidebar",{attrs:{width:"30%",id:"sidebar-right",title:"",right:"",shadow:""}},[t("div",{staticClass:"px-3 py-2"},[t("h4",{staticStyle:{"text-align":"center"}},[n._v("ALFA - IoMT Manager")]),t("h5",{staticStyle:{"text-align":"center"}},[n._v("A V-PRISM Implementation")]),t("p",{staticStyle:{"text-align":"center"}},[t("b-img",{attrs:{src:"logo_vprism_color.png",width:"100%"}})],1),t("p",[n._v("\n          Multimedia sensors have recently become a major data source in the Internet of Things (IoT), \n          giving rise to the Internet of Media Things (IoMT). Since multimedia applications are usually latency-sensitive, \n          data processing in the cloud is not always practical. A strategy to minimize delay is to\n          process the multimedia streams closer to the data sources, \n          exploiting the resources at the edge of the network. V-PRISM, is an architecture to virtualize \n          and manage multimedia sensors with components deployed and executed in multiples edge nodes.\n          The entity that processes the multimedia stream is called Virtual Multimedia Sensor (VMS),\n          and they can be dynamically allocated by the execution of different types of resource allocation algorithm.\n        ")]),t("a",{staticClass:"card-link",attrs:{href:"https://github.com/anselmobattisti/alfa"}},[n._v("More Informations ")])])])],1)],1)],1)],1)],1)},f=[],l=t("a0df"),v=t("7668"),p=t("827f"),h=t("6154"),g=t("db49"),w={name:"home",data:function(){return{items:[],showMsg:!1,devices:{total:0,started:0},vms:{total:0,started:0},node:{total:0,running:0}}},methods:{bootstrap:function(){var n=this;g["a"].api.get("/configuration/bootstrap").then((function(){n.showMsg=!1,n.refresh()})).catch((function(n){console.log(n)}))},refresh:function(){var n=this;v["a"].getDevices().then((function(e){n.devices.total=e.length,e.forEach((function(e){""!=e.dockerId&&n.devices.started++}))})),h["a"].getAllVms().then((function(e){n.vms.started=e.length})),p["a"].getNodes().then((function(e){n.node.total=e.length,e.forEach((function(e){1==e.online&&n.node.running++}))})),l["a"].getLocations().then((function(e){0==e.length&&(n.showMsg=!0)})).catch((function(n){console.log(n)}))}},created:function(){this.refresh()}},b=w,E=Object(r["a"])(b,m,f,!1,null,null,null),y=E.exports;o["default"].use(u["a"]);var I=new u["a"]({routes:[{path:"/",name:"home",component:y},{path:"/configuration",name:"configurationIndex",component:function(){return t.e("locationIndex").then(t.bind(null,"f884"))}},{path:"/location",name:"locationIndex",component:function(){return t.e("locationIndex").then(t.bind(null,"2b94"))}},{path:"/location/new",name:"locationNew",component:function(){return t.e("locationNew").then(t.bind(null,"2292"))}},{path:"/location/:id/edit",name:"locationEdit",component:function(){return t.e("locationEdit").then(t.bind(null,"6041"))}},{path:"/location/:id/devices",name:"locationDevices",component:function(){return t.e("locationDevices").then(t.bind(null,"7aeb"))}},{path:"/device",name:"deviceIndex",component:function(){return t.e("deviceIndex").then(t.bind(null,"c2fc"))}},{path:"/device/new",name:"deviceNew",component:function(){return t.e("deviceNew").then(t.bind(null,"3039"))}},{path:"/device/:id/edit",name:"deviceEdit",component:function(){return t.e("deviceEdit").then(t.bind(null,"4d7f"))}},{path:"/device/:id/details",name:"deviceContainerDetails",component:function(){return Promise.all([t.e("nodeImages~vmsTypeEdit"),t.e("vmsTypeEdit")]).then(t.bind(null,"cad0"))}},{path:"/vmsType",name:"vmsTypeIndex",component:function(){return t.e("vmsTypeIndex").then(t.bind(null,"40dd"))}},{path:"/vmsType/indexSrc",name:"vmsTypeIndex",component:function(){return t.e("vmsTypeIndexSrc").then(t.bind(null,"f171"))}},{path:"/vmsType/new",name:"vmsTypeNew",component:function(){return t.e("vmsTypeNew").then(t.bind(null,"fcf1"))}},{path:"/vmsType/:id/edit",name:"vmsTypeEdit",component:function(){return Promise.all([t.e("nodeImages~vmsTypeEdit"),t.e("vmsTypeEdit")]).then(t.bind(null,"adf8"))}},{path:"/vms",name:"vmsIndex",component:function(){return t.e("vmsIndex").then(t.bind(null,"b2c2"))}},{path:"/vms/allvms",name:"allVms",component:function(){return t.e("vmsStopped").then(t.bind(null,"213f"))}},{path:"/vms/new/:id",name:"vmsNew",component:function(){return t.e("vmsNew").then(t.bind(null,"ad11"))}},{path:"/vms/:id/details",name:"vmsDetails",component:function(){return Promise.all([t.e("nodeImages~vmsTypeEdit"),t.e("vmsTypeEdit")]).then(t.bind(null,"cb7b"))}},{path:"/vms/:id/bindSrc",name:"vmsBindSrc",component:function(){return t.e("vmsBindSrc").then(t.bind(null,"2c24"))}},{path:"/vms/:id/edit",name:"vmsEdit",component:function(){return t.e("vmsEdit").then(t.bind(null,"65fa"))}},{path:"/vms/:id/ffmanager",name:"vmsFFmanager",component:function(){return t.e("vmsEdit").then(t.bind(null,"a72f"))}},{path:"/vms/:id/log",name:"vmsLog",component:function(){return t.e("vmsEdit").then(t.bind(null,"252d"))}},{path:"/vms/:monitorName/monitor",name:"vmsMonitor",component:function(){return t.e("vmsEdit").then(t.bind(null,"bc4e"))}},{path:"/node",name:"nodeIndex",component:function(){return t.e("nodeIndex").then(t.bind(null,"d42d"))}},{path:"/node/new",name:"nodeNew",component:function(){return t.e("nodeNew").then(t.bind(null,"a9f2"))}},{path:"/node/:id/edit",name:"nodeEdit",component:function(){return t.e("nodeEdit").then(t.bind(null,"dac4"))}},{path:"/node/:ip/images",name:"nodeImages",component:function(){return Promise.all([t.e("nodeImages~vmsTypeEdit"),t.e("nodeImages")]).then(t.bind(null,"e6d0"))}},{path:"/node/:id/status",name:"nodeStatus",component:function(){return Promise.all([t.e("nodeImages~vmsTypeEdit"),t.e("nodeImages")]).then(t.bind(null,"0ba7"))}}]}),P=t("2f62");o["default"].use(P["a"]);var T=new P["a"].Store({state:{},mutations:{},actions:{}}),S=t("5f5b"),x=t("3459"),_=t("5886");t("4413"),t("f9e3"),t("2dd8");o["default"].use(_["a"]),o["default"].use(x["a"],{name:"v-icon",props:{baseClass:{type:String,default:"v-icon"},classPrefix:{type:String,default:"v-icon-"}}}),o["default"].use(S["a"]);var N=function(n,e,t){t=t||"...";var o=document.createElement("div");o.innerHTML=n;var a=o.textContent;return a.length>e?a.slice(0,e)+t:a},D=function(n){var e="";return n.forEach((function(n){e+="".concat(n.port,"; ")})),e};o["default"].filter("truncate",N),o["default"].filter("showPorts",D),new o["default"]({router:I,store:T,render:function(n){return n(d)}}).$mount("#app")},6154:function(n,e,t){"use strict";t.d(e,"a",(function(){return a}));var o=t("db49"),a={newVms:function(n){return n?new Promise((function(e,t){o["a"].api.post("/vms/",n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new VMS ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},addFoward:function(n){return n?new Promise((function(e,t){o["a"].api.post("/vms/addfoward",n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when forwarding ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},remFoward:function(n){return console.log(n),n?new Promise((function(e,t){o["a"].api.get("/vms/remfoward/".concat(n.vmsId,"/").concat(n.forwardId)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when forwarding ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},updateVms:function(n){return n?(console.log(n),new Promise((function(e,t){o["a"].api.put("/vms/".concat(n.id),n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new VMS ".concat(n)))}))}))):Promise.reject(new Error("Data not informed"))},bindSrc:function(n){return n?new Promise((function(e,t){o["a"].api.get("/vms/bindSrc/".concat(n.vmsId,"/").concat(n.deviceId,"/").concat(n.port)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new VMS ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},unbindSrc:function(n){return n?new Promise((function(e,t){o["a"].api.get("/vms/unbindSrc/".concat(n.vmsId,"/").concat(n.deviceId,"/").concat(n.port)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new VMS ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},stopVms:function(n){return n?new Promise((function(e,t){o["a"].api.get("/vms/stop/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when stopping the VMS ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},getType:function(n){return n?new Promise((function(e,t){o["a"].api.get("/vms/type/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when getting the VMS type ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},removeVms:function(n){return n?new Promise((function(e,t){o["a"].api.delete("/vms/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when removing a new vmsType ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},getAllVms:function(){return new Promise((function(n,e){o["a"].api.get("/vms/").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getVms:function(n){return new Promise((function(e,t){o["a"].api.get("/vms/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getLog:function(n){return new Promise((function(e,t){o["a"].api.get("/vms/log/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getContainerDetails:function(n){return new Promise((function(e,t){o["a"].api.get("/vms/getContainerDetails/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getMonitor:function(n){return new Promise((function(e,t){o["a"].api.get("/vms/monitors/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))}}},"64a9":function(n,e,t){},"6af5":function(n,e,t){"use strict";t.d(e,"a",(function(){return a}));var o=t("db49"),a={newVmsType:function(n){return n?new Promise((function(e,t){o["a"].api.post("/vmsType/",n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error whem creating a new vmsType ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},updateVmsType:function(n){return n?new Promise((function(e,t){o["a"].api.put("/vmsType/".concat(n.id),n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error whem updating  avmsType ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},removeVmsType:function(n){return n?new Promise((function(e,t){o["a"].api.delete("/vmsType/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error whem removing a new vmsType ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},getVmsTypes:function(){return new Promise((function(n,e){o["a"].api.get("/vmsType/").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getVmsTypesSrc:function(){return new Promise((function(n,e){o["a"].api.get("/vmsType/listSrc").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getVmsTypesVms:function(){return new Promise((function(n,e){o["a"].api.get("/vmsType/listVms").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getVmsType:function(n){return new Promise((function(e,t){o["a"].api.get("/vmsType/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))}}},7668:function(n,e,t){"use strict";t.d(e,"a",(function(){return i}));t("7f7f"),t("ac6a");var o=t("db49"),a=t("6af5"),i={getConnectionTypes:function(){return new Promise((function(n){var e=[];a["a"].getVmsTypesSrc().then((function(t){t.forEach((function(n){e.push({text:n.name,value:n.dockerImage})})),n(e)}))}))},newDevice:function(n){return n?new Promise((function(e,t){o["a"].api.post("/device/",n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new device ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},updateDevice:function(n){return n?new Promise((function(e,t){o["a"].api.put("/device/".concat(n.id),n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when updating a device ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},starSrcDevice:function(n){return n?new Promise((function(e,t){o["a"].api.get("/device/".concat(n,"/startSrc")).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when starting the SRC for the device ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},stopSrcDevice:function(n){return n?new Promise((function(e,t){o["a"].api.get("/device/".concat(n,"/stopSrc")).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when stopping the SRC for the device ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},removeDevice:function(n){return n?new Promise((function(e,t){o["a"].api.delete("/device/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when removing a new device ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},getDevices:function(){return new Promise((function(n,e){o["a"].api.get("/device/").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getDevicesToSelect:function(){return new Promise((function(n,e){o["a"].api.get("/device/").then((function(e){var t=[];e.data.forEach((function(n){t.push({text:n.name,value:n._id})})),n(t)})).catch((function(n){e(n)}))}))},getDevicesToSelectSRCStarted:function(){return new Promise((function(n,e){o["a"].api.get("/device/").then((function(e){var t=[];e.data.forEach((function(n){n.dockerId&&t.push({text:n.name,value:n._id})})),n(t)})).catch((function(n){e(n)}))}))},getDevice:function(n){return new Promise((function(e,t){o["a"].api.get("/device/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getContainerDetails:function(n){return new Promise((function(e,t){o["a"].api.get("/device/getContainerDetails/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))}}},"827f":function(n,e,t){"use strict";t.d(e,"a",(function(){return a}));t("7f7f"),t("ac6a");var o=t("db49"),a={newNode:function(n){return n?new Promise((function(e,t){o["a"].api.post("/node/",n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new node ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},updateNode:function(n){return n?new Promise((function(e,t){o["a"].api.put("/node/".concat(n.id),n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when updating a node ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},removeNode:function(n){return n?new Promise((function(e,t){o["a"].api.delete("/node/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when removing a new node ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},getNodes:function(){return new Promise((function(n,e){o["a"].api.get("/node/").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},updateStatus:function(){return new Promise((function(n,e){o["a"].api.get("/node/updateStatus").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getNode:function(n){return new Promise((function(e,t){o["a"].api.get("/node/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getNodeImages:function(n){return new Promise((function(e,t){o["a"].api.get("/node/images/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getNodeStats:function(n){return new Promise((function(e,t){o["a"].api.get("/node/status/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getNodesForSelect:function(){return new Promise((function(n,e){o["a"].api.get("/node/").then((function(e){var t=[];e.data.forEach((function(n){t.push({value:n.ip,text:"".concat(n.name," ").concat(n.ip),id:n._id})})),n(t)})).catch((function(n){e(n)}))}))},getNodesForVmsSelect:function(){return new Promise((function(n,e){o["a"].api.get("/node/nodeOptions").then((function(e){var t=[];e.data.forEach((function(n){t.push({value:n.ip,text:"".concat(n.name),id:n._id})})),n(t)})).catch((function(n){e(n)}))}))}}},a0df:function(n,e,t){"use strict";t.d(e,"a",(function(){return a}));t("7f7f"),t("ac6a");var o=t("db49"),a={newLocation:function(n){return n?new Promise((function(e,t){o["a"].api.post("/location/",n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when creating a new location ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},updateLocation:function(n){return n?new Promise((function(e,t){o["a"].api.put("/location/".concat(n.id),n).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when updating a location ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},removeLocation:function(n){return n?new Promise((function(e,t){o["a"].api.delete("/location/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(new Error("Error when removing a new location ".concat(n)))}))})):Promise.reject(new Error("Data not informed"))},getLocations:function(){return new Promise((function(n,e){o["a"].api.get("/location/").then((function(e){n(e.data)})).catch((function(n){e(n)}))}))},getLocationsForSelect:function(){return new Promise((function(n,e){o["a"].api.get("/location/").then((function(e){var t=[];e.data.forEach((function(n){t.push({value:n._id,text:n.name})})),n(t)})).catch((function(n){e(n)}))}))},getLocation:function(n){return new Promise((function(e,t){o["a"].api.get("/location/".concat(n)).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))},getDevices:function(n){return new Promise((function(e,t){o["a"].api.get("/location/".concat(n,"/devices")).then((function(n){e(n.data)})).catch((function(n){t(n)}))}))}}},db49:function(n,e,t){"use strict";t.d(e,"a",(function(){return i}));var o=t("bc3a"),a=t.n(o),i={API_MAPS:"",URL_API:"http://192.168.0.150:3000",URL_APP:"http://192.168.0.150:8080",COLOR_DANGER:"red",COLOR_SUCCESS:"green",COLOR_DEFAULT:"grey",COLOR_WARNING:"yellow",api:""};console.log("http://192.168.0.150:3000"),i.api=a.a.create({baseURL:i.URL_API})}});
//# sourceMappingURL=app.5a4b5631.js.map