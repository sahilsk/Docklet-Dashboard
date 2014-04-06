
var docklet = require("./RT/Docklet.js")
	var dockerEventStream = null;

var client = null;
var Resources = function( primus){
	// Handshake with client
	//STREAM HANDLER
	primus.on('connection', function (spark) {
		console.log(spark.id)
	  spark.on('hi', function (msg) {
	    console.log(msg); //-> hello world
	    spark.send('hello', 'hello from the server');
	  });

	  var foo = spark.substream('foo')

	  dockerEventStream = spark.substream('dockerEvents');

	});	


	// Create our resource
	var Docklet = primus.resource('Docklet', new docklet() );
}


module.exports = Resources;
