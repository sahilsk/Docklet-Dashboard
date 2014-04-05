
var docklet = require("./RT/Docklet.js")

var client = null;
var Resources = function( primus){
	// Handshake with client
	//STREAM HANDLER
	var dockerEventStream = null;
	primus.on('connection', function (spark) {
	  client = spark;
	  spark.on('hi', function (msg) {
	    console.log(msg); //-> hello world
	    spark.send('hello', 'hello from the server');
	  });

	  dockerEventStream = spark.substream('dockerEvents');

	});	


	// Create our resource
	var Docklet = primus.resource('Docklet', new docklet() );
}



module.exports = {
	Resources: Resources,
	spark:client,
	event:dockerEventStream
}

//Export primus resources
//module.exports = Resources;
