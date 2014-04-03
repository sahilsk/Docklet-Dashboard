
var docklet = require("./RT/Docklet.js")

var Resources = function( primus){
	// Handshake with client
	primus.on('connection', function (spark) {
	  // listen to hi events
	  spark.on('hi', function (msg) {
	    console.log(msg); //-> hello world
	    // send back the hello to client
	    spark.send('hello', 'hello from the server');
	  });
	});	


	// Create our resource
	var Docklet = primus.resource('Docklet', new docklet() );
}





//Export primus resources
module.exports = Resources;
