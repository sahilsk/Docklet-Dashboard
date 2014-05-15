
var docklet = require("./RT/Docklet.js")
	var dockerEventStream = null;

var client = null;
var Resources = function( primus){
	// Handshake with client
	//STREAM HANDLER
	primus.on('connection', function (spark) {
		console.log("Spark connected............")
	});	


	// Create our resource
	var Docklet = primus.resource('Docklet', new docklet(), false );
}


module.exports = Resources;
