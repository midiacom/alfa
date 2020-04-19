(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["nodeEdit"],{"827f":function(t,e,n){"use strict";n.d(e,"a",(function(){return r}));n("7f7f"),n("ac6a");var o=n("db49"),r={newNode:function(t){return t?new Promise((function(e,n){o["a"].api.post("/node/",t).then((function(t){e(t.data)})).catch((function(t){n(new Error("Error when creating a new node ".concat(t)))}))})):Promise.reject(new Error("Data not informed"))},updateNode:function(t){return t?new Promise((function(e,n){o["a"].api.put("/node/".concat(t.id),t).then((function(t){e(t.data)})).catch((function(t){n(new Error("Error when updating a node ".concat(t)))}))})):Promise.reject(new Error("Data not informed"))},removeNode:function(t){return t?new Promise((function(e,n){o["a"].api.delete("/node/".concat(t)).then((function(t){e(t.data)})).catch((function(t){n(new Error("Error when removing a new node ".concat(t)))}))})):Promise.reject(new Error("Data not informed"))},getNodes:function(){return new Promise((function(t,e){o["a"].api.get("/node/").then((function(e){t(e.data)})).catch((function(t){e(t)}))}))},getNode:function(t){return new Promise((function(e,n){o["a"].api.get("/node/".concat(t)).then((function(t){e(t.data)})).catch((function(t){n(t)}))}))},getNodeImages:function(t){return new Promise((function(e,n){o["a"].api.get("/node/images/".concat(t)).then((function(t){e(t.data)})).catch((function(t){n(t)}))}))},getNodeStats:function(t){return new Promise((function(e,n){o["a"].api.get("/node/status/".concat(t)).then((function(t){e(t.data)})).catch((function(t){n(t)}))}))},getNodesForSelect:function(){return new Promise((function(t,e){o["a"].api.get("/node/").then((function(e){var n=[];e.data.forEach((function(t){n.push({value:t.ip,text:"".concat(t.name," ").concat(t.ip),id:t._id})})),t(n)})).catch((function(t){e(t)}))}))}}},dac4:function(t,e,n){"use strict";n.r(e);var o=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[n("h2",[t._v("Edit Edge Node")]),n("b-alert",{attrs:{show:t.msg.text,"v-show":t.msg.text,variant:t.msg.type}},[t._v("\n          "+t._s(t.msg.text)+"\n      ")]),n("b-form",{on:{submit:t.onSubmit}},[n("b-form-group",{attrs:{id:"input-group-1",label:"Name:","label-for":"name"}},[n("b-form-input",{attrs:{id:"name",type:"text",required:""},model:{value:t.form.name,callback:function(e){t.$set(t.form,"name",e)},expression:"form.name"}})],1),n("b-form-group",{attrs:{id:"input-group-1",label:"IP:","label-for":"name"}},[n("b-form-input",{attrs:{id:"ip",type:"text",required:""},model:{value:t.form.ip,callback:function(e){t.$set(t.form,"ip",e)},expression:"form.ip"}})],1),n("b-form-group",{attrs:{label:"Role in Doker Swarm","label-for":"isMarter"}},[n("b-form-radio",{attrs:{name:"isMaster",value:"true"},model:{value:t.form.isMaster,callback:function(e){t.$set(t.form,"isMaster",e)},expression:"form.isMaster"}},[t._v("Master")]),n("b-form-radio",{attrs:{name:"isMaster",value:"false"},model:{value:t.form.isMaster,callback:function(e){t.$set(t.form,"isMaster",e)},expression:"form.isMaster"}},[t._v("Slave")])],1),n("b-form-group",{attrs:{id:"input-group-3",label:"Docker Node ID:","label-for":"dockerId"}},[n("b-form-input",{attrs:{id:"dockerId",type:"text"},model:{value:t.form.dockerId,callback:function(e){t.$set(t.form,"dockerId",e)},expression:"form.dockerId"}})],1),n("b-form-group",{attrs:{id:"input-group-2",label:"Description:","label-for":"description"}},[n("b-form-textarea",{attrs:{id:"description",type:"text"},model:{value:t.form.description,callback:function(e){t.$set(t.form,"description",e)},expression:"form.description"}})],1),n("b-row",[n("b-col",[n("b-button",{attrs:{type:"submit",variant:"primary"}},[t._v("Save")])],1),n("b-col",{staticClass:"text-right"},[n("b-button",{attrs:{to:"/node",variant:"secondary"}},[t._v("Back")])],1)],1)],1)],1)},r=[],a=(n("7f7f"),n("827f")),i={name:"deviceEdit",data:function(){return{locations:[],form:{id:"",name:"",ip:"",dockerId:"",description:"",isMaster:!1},msg:{text:!1,type:""}}},methods:{onSubmit:function(t){var e=this;t.preventDefault(),a["a"].updateNode(this.form).then((function(){e.msg.text="Node saved",e.msg.type="success"})).catch((function(t){e.msg.text="Error when saving node ".concat(t),e.msg.type="danger"}))},refresh:function(){var t=this;a["a"].getNode(this.$route.params.id).then((function(e){t.form.id=e._id,t.form.name=e.name,t.form.ip=e.ip,t.form.dockerId=e.dockerId,t.form.isMaster=e.isMaster,t.form.description=e.description}))}},created:function(){this.refresh()}},c=i,s=n("2877"),u=Object(s["a"])(c,o,r,!1,null,null,null);e["default"]=u.exports}}]);
//# sourceMappingURL=nodeEdit.4b204ac2.js.map