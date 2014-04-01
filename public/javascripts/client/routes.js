var $ = require("jquery")
var Backbone = require("backbone")
require("./modal.js")
Backbone.$ = $;
window.Backbone = Backbone;
window.jQuery =$

var AppRouter = Backbone.Router.extend({
    routes: {
    	"docklets/new" :"newDocklet",
        "posts/:id": "getPost",
        "*actions": "defaultRoute",
        
    },
    newDocklet :function(){
    	console.log("New Docklet window");
    	$('#docklets_new').modal();
    },
    getPost : function(id){
		alert( "Get post number " + id );   
	},
	defaultRoute: function(actions){
	   alert( "Action not support : " + actions ); 

	}
});


/*
//Unhandled path
app_router.on('route:defaultRoute', function (actions) {
    alert( "Action not support : " + actions ); 
});

var app_router = new AppRouter;

Backbone.history.start();

*/

module.exports = AppRouter;
