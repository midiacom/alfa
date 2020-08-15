(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["locationIndex"],{"2b94":function(t,e,n){"use strict";n.r(e);var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("b-row",[n("b-col",[n("h2",[n("v-icon",{staticStyle:{width:"32px"},attrs:{name:"map-pin"}}),t._v("                                \n              Locations\n          ")],1)]),n("b-col",{staticClass:"text-right"},[n("b-button",{staticClass:"mr-2",attrs:{to:"/location/new",variant:"success"}},[n("v-icon",{attrs:{name:"plus"}}),t._v("\n              New\n          ")],1)],1)],1),n("b-table",{attrs:{busy:t.isBusy,items:t.items,fields:t.fields,striped:"",responsive:"sm"},scopedSlots:t._u([{key:"cell(actions)",fn:function(e){return[n("b-button",{staticClass:"mr-2",attrs:{variant:"primary",size:"sm"},on:{click:function(n){return t.editLocation(e.item)}}},[n("v-icon",{attrs:{name:"edit-2"}}),t._v("\n          Edit\n      ")],1),n("b-button",{staticClass:"mr-2",attrs:{variant:"warning",size:"sm"},on:{click:function(n){return t.devicesLocation(e.item)}}},[n("v-icon",{attrs:{name:"cpu"}}),t._v("\n          Devices\n      ")],1),n("b-button",{staticClass:"mr-2",attrs:{variant:"danger",size:"sm"},on:{click:function(n){return t.removeLocation(e.item)}}},[n("v-icon",{attrs:{name:"trash"}}),t._v("\n          Remove\n      ")],1)]}}])},[n("div",{staticClass:"text-center text-danger my-2",attrs:{slot:"table-busy"},slot:"table-busy"},[n("b-spinner",{staticClass:"align-middle"}),n("strong",[t._v("Loading...")])],1)]),n("b-alert",{staticClass:"text-center",attrs:{variant:"secondary",show:!t.items.length}},[t._v("\n      There are no locations yet!\n  ")]),n("b-row",[n("b-col",{staticClass:"text-right"},[n("strong",[t._v("Total: "+t._s(t.items.length))])])],1)],1)},a=[],r=n("a0df"),o={name:"locationIndex",data:function(){return{isBusy:!0,fields:[{key:"name"},{key:"actions",class:"locationIndexActions"}],items:[]}},methods:{editLocation:function(t){this.$router.push("/location/".concat(t._id,"/edit"))},devicesLocation:function(t){this.$router.push("/location/".concat(t._id,"/devices"))},removeLocation:function(t){var e=this;this.$swal.fire({title:"Are you sure?",text:"You won't be able to revert this!",type:"warning",showCancelButton:!0,confirmButtonText:"Yes, delete it!"}).then((function(n){n.value&&r["a"].removeLocation(t._id).then((function(){e.refresh()})).catch((function(t){console.log(t)}))}))},refresh:function(){var t=this;this.isBusy=!0,r["a"].getLocations().then((function(e){t.items=e,t.isBusy=!1})).catch((function(e){console.log(e),t.isBusy=!1}))}},created:function(){this.refresh()}},s=o,c=(n("e0ce"),n("2877")),u=Object(c["a"])(s,i,a,!1,null,null,null);e["default"]=u.exports},3106:function(t,e,n){},9062:function(t,e,n){!function(e,n){t.exports=n()}("undefined"!=typeof self&&self,(function(){return function(t){var e={};function n(i){if(e[i])return e[i].exports;var a=e[i]={i:i,l:!1,exports:{}};return t[i].call(a.exports,a,a.exports,n),a.l=!0,a.exports}return n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)n.d(i,a,function(e){return t[e]}.bind(null,a));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=1)}([function(t,e,n){},function(t,e,n){"use strict";n.r(e);var i="undefined"!=typeof window?window.HTMLElement:Object,a={mounted:function(){document.addEventListener("focusin",this.focusIn)},methods:{focusIn:function(t){if(this.isActive&&t.target!==this.$el&&!this.$el.contains(t.target)){var e=this.container?this.container:this.isFullPage?null:this.$el.parentElement;(this.isFullPage||e&&e.contains(t.target))&&(t.preventDefault(),this.$el.focus())}}},beforeDestroy:function(){document.removeEventListener("focusin",this.focusIn)}};function r(t,e,n,i,a,r,o,s){var c,u="function"==typeof t?t.options:t;if(e&&(u.render=e,u.staticRenderFns=n,u._compiled=!0),i&&(u.functional=!0),r&&(u._scopeId="data-v-"+r),o?(c=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),a&&a.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(o)},u._ssrRegister=c):a&&(c=s?function(){a.call(this,this.$root.$options.shadowRoot)}:a),c)if(u.functional){u._injectStyles=c;var l=u.render;u.render=function(t,e){return c.call(e),l(t,e)}}else{var d=u.beforeCreate;u.beforeCreate=d?[].concat(d,c):[c]}return{exports:t,options:u}}var o=r({name:"spinner",props:{color:{type:String,default:"#000"},height:{type:Number,default:64},width:{type:Number,default:64}}},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{viewBox:"0 0 38 38",xmlns:"http://www.w3.org/2000/svg",width:this.width,height:this.height,stroke:this.color}},[e("g",{attrs:{fill:"none","fill-rule":"evenodd"}},[e("g",{attrs:{transform:"translate(1 1)","stroke-width":"2"}},[e("circle",{attrs:{"stroke-opacity":".25",cx:"18",cy:"18",r:"18"}}),e("path",{attrs:{d:"M36 18c0-9.94-8.06-18-18-18"}},[e("animateTransform",{attrs:{attributeName:"transform",type:"rotate",from:"0 18 18",to:"360 18 18",dur:"0.8s",repeatCount:"indefinite"}})],1)])])])}),[],!1,null,null,null).exports,s=r({name:"dots",props:{color:{type:String,default:"#000"},height:{type:Number,default:240},width:{type:Number,default:60}}},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{viewBox:"0 0 120 30",xmlns:"http://www.w3.org/2000/svg",fill:this.color,width:this.width,height:this.height}},[e("circle",{attrs:{cx:"15",cy:"15",r:"15"}},[e("animate",{attrs:{attributeName:"r",from:"15",to:"15",begin:"0s",dur:"0.8s",values:"15;9;15",calcMode:"linear",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"fill-opacity",from:"1",to:"1",begin:"0s",dur:"0.8s",values:"1;.5;1",calcMode:"linear",repeatCount:"indefinite"}})]),e("circle",{attrs:{cx:"60",cy:"15",r:"9","fill-opacity":"0.3"}},[e("animate",{attrs:{attributeName:"r",from:"9",to:"9",begin:"0s",dur:"0.8s",values:"9;15;9",calcMode:"linear",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"fill-opacity",from:"0.5",to:"0.5",begin:"0s",dur:"0.8s",values:".5;1;.5",calcMode:"linear",repeatCount:"indefinite"}})]),e("circle",{attrs:{cx:"105",cy:"15",r:"15"}},[e("animate",{attrs:{attributeName:"r",from:"15",to:"15",begin:"0s",dur:"0.8s",values:"15;9;15",calcMode:"linear",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"fill-opacity",from:"1",to:"1",begin:"0s",dur:"0.8s",values:"1;.5;1",calcMode:"linear",repeatCount:"indefinite"}})])])}),[],!1,null,null,null).exports,c=r({name:"bars",props:{color:{type:String,default:"#000"},height:{type:Number,default:40},width:{type:Number,default:40}}},(function(){var t=this.$createElement,e=this._self._c||t;return e("svg",{attrs:{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 30 30",height:this.height,width:this.width,fill:this.color}},[e("rect",{attrs:{x:"0",y:"13",width:"4",height:"5"}},[e("animate",{attrs:{attributeName:"height",attributeType:"XML",values:"5;21;5",begin:"0s",dur:"0.6s",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"y",attributeType:"XML",values:"13; 5; 13",begin:"0s",dur:"0.6s",repeatCount:"indefinite"}})]),e("rect",{attrs:{x:"10",y:"13",width:"4",height:"5"}},[e("animate",{attrs:{attributeName:"height",attributeType:"XML",values:"5;21;5",begin:"0.15s",dur:"0.6s",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"y",attributeType:"XML",values:"13; 5; 13",begin:"0.15s",dur:"0.6s",repeatCount:"indefinite"}})]),e("rect",{attrs:{x:"20",y:"13",width:"4",height:"5"}},[e("animate",{attrs:{attributeName:"height",attributeType:"XML",values:"5;21;5",begin:"0.3s",dur:"0.6s",repeatCount:"indefinite"}}),e("animate",{attrs:{attributeName:"y",attributeType:"XML",values:"13; 5; 13",begin:"0.3s",dur:"0.6s",repeatCount:"indefinite"}})])])}),[],!1,null,null,null).exports,u=r({name:"vue-loading",mixins:[a],props:{active:Boolean,programmatic:Boolean,container:[Object,Function,i],isFullPage:{type:Boolean,default:!0},transition:{type:String,default:"fade"},canCancel:Boolean,onCancel:{type:Function,default:function(){}},color:String,backgroundColor:String,opacity:Number,width:Number,height:Number,zIndex:Number,loader:{type:String,default:"spinner"}},data:function(){return{isActive:this.active}},components:{Spinner:o,Dots:s,Bars:c},beforeMount:function(){this.programmatic&&(this.container?(this.isFullPage=!1,this.container.appendChild(this.$el)):document.body.appendChild(this.$el))},mounted:function(){this.programmatic&&(this.isActive=!0),document.addEventListener("keyup",this.keyPress)},methods:{cancel:function(){this.canCancel&&this.isActive&&(this.hide(),this.onCancel.apply(null,arguments))},hide:function(){var t=this;this.$emit("hide"),this.$emit("update:active",!1),this.programmatic&&(this.isActive=!1,setTimeout((function(){var e;t.$destroy(),void 0!==(e=t.$el).remove?e.remove():e.parentNode.removeChild(e)}),150))},keyPress:function(t){27===t.keyCode&&this.cancel()}},watch:{active:function(t){this.isActive=t}},beforeDestroy:function(){document.removeEventListener("keyup",this.keyPress)}},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("transition",{attrs:{name:t.transition}},[n("div",{directives:[{name:"show",rawName:"v-show",value:t.isActive,expression:"isActive"}],staticClass:"vld-overlay is-active",class:{"is-full-page":t.isFullPage},style:{zIndex:t.zIndex},attrs:{tabindex:"0","aria-busy":t.isActive,"aria-label":"Loading"}},[n("div",{staticClass:"vld-background",style:{background:t.backgroundColor,opacity:t.opacity},on:{click:function(e){return e.preventDefault(),t.cancel(e)}}}),n("div",{staticClass:"vld-icon"},[t._t("before"),t._t("default",[n(t.loader,{tag:"component",attrs:{color:t.color,width:t.width,height:t.height}})]),t._t("after")],2)])])}),[],!1,null,null,null).exports,l=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return{show:function(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:e,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n,r={programmatic:!0},o=Object.assign({},e,i,r),s=new(t.extend(u))({el:document.createElement("div"),propsData:o}),c=Object.assign({},n,a);return Object.keys(c).map((function(t){s.$slots[t]=c[t]})),s}}};n(0),u.install=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=l(t,e,n);t.$loading=i,t.prototype.$loading=i},e.default=u}]).default}))},e0ce:function(t,e,n){"use strict";var i=n("3106"),a=n.n(i);a.a},e40d:function(t,e,n){},f884:function(t,e,n){"use strict";n.r(e);var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("loading",{attrs:{active:t.isLoading,"is-full-page":!0},on:{"update:active":function(e){t.isLoading=e}}}),n("b-row",[n("b-col",[n("h2",[n("v-icon",{staticStyle:{width:"32px"},attrs:{name:"settings"}}),t._v("\n              Configurations\n          ")],1)])],1),n("b-alert",{attrs:{show:t.msg.show,variant:t.msg.type}},[t._v("\n      "+t._s(t.msg.text)+"\n  ")]),n("b-row",[n("b-col",[n("b-card-group",{attrs:{deck:""}},[n("b-card",{attrs:{title:"Clear Database"}},[n("b-card-text",[t._v("Remove all data stored in database.")]),n("b-button",{staticClass:"mr-2",attrs:{variant:"danger"},on:{click:function(e){return t.cleanDb()}}},[n("v-icon",{attrs:{name:"trash"}}),t._v("\n                      Clear Database\n                  ")],1)],1),n("b-card",{attrs:{title:"Import Data"}},[n("b-card-text",[t._v("Import the basic data from running ALFA, VMS Types, VD Types, Devices, Locations and Edge Nodes.")]),n("b-button",{staticClass:"mr-2",attrs:{variant:"success"},on:{click:function(e){return t.bootstrap()}}},[n("v-icon",{attrs:{name:"trash"}}),t._v("\n                      Bootstrap\n                  ")],1)],1)],1)],1)],1)],1)},a=[],r=n("db49"),o={cleanDb:function(){return new Promise((function(t,e){r["a"].api.get("/configuration/cleanDb").then((function(e){t(e.data)})).catch((function(t){e(new Error("Error when cleaning DB ".concat(t)))}))}))},bootstrap:function(){return new Promise((function(t,e){r["a"].api.get("/configuration/bootstrap").then((function(e){t(e.data)})).catch((function(t){e(new Error("Error when bootstraping ".concat(t)))}))}))}},s=n("9062"),c=n.n(s),u=(n("e40d"),{name:"configurationIndex",components:{Loading:c.a},data:function(){return{isBusy:!0,isLoading:!1,msg:{show:!1,text:!1,type:""}}},methods:{cleanDb:function(){var t=this;this.$swal.fire({title:"Are you sure?",text:"You won't be able to revert this!",type:"warning",showCancelButton:!0,confirmButtonText:"Yes, clear the database!"}).then((function(e){e.value&&(t.isLoading=!0,o.cleanDb().then((function(e){t.isLoading=!1,t.msg.show=!0,t.msg.text="Database cleaned",t.msg.type="success"})).catch((function(e){t.isLoading=!1,console.log(e)})))}))},bootstrap:function(){var t=this;this.$swal.fire({title:"Are you sure?",text:"You won't be able to revert this!",type:"warning",showCancelButton:!0,confirmButtonText:"Yes, clear the database!"}).then((function(e){e.value&&o.bootstrap().then((function(e){t.isLoading=!1,t.msg.show=!0,t.msg.text="Data imported",t.msg.type="success"})).catch((function(t){console.log(t)}))}))}},created:function(){}}),l=u,d=n("2877"),f=Object(d["a"])(l,i,a,!1,null,null,null);e["default"]=f.exports}}]);
//# sourceMappingURL=locationIndex.1f67fc27.js.map