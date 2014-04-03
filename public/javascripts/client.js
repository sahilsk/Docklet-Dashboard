
var AppRouter = require("./client/routes.js");


var app_router = new AppRouter;


 
var socket = Primus.connect('ws://'+window.location.host );
socket.on('open', function () {	
  socket.send('hi', 'hello world');
  socket.on('hello', function (msg) {
	  console.log(msg);
  });

});


var Docklet = socket.resource('Docklet');

Docklet.on('ready', function () {

  // start calling remote events
  Docklet.create('sleep', function (res) {
    console.log(res);
  });

  // call the server remote walk event
  Docklet.walk(function (res) {
    console.log(res);
  });
  console.log("Docklet resource ready")

});



/*************** 
GUI FUNCTION
****************/

$("#newDockletForm").on( "submit", function( event ) {
  event.preventDefault();
  var data = {
  	"host" :   	$( this ).find('#host').val(),
  	"port" : $(this).find("#port").val()
  }
  console.log( data );


  Docklet.create( JSON.stringify(data), function(res){
  	console.log(res);

  } );


});





Backbone.history.start();

