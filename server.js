var CONFIG = require("config");
var app = require("./app.js");
var http = require('http');
var  rtController = require("./controllers/rtController");

var resource = require('primus-resource')
  , Primus = require('primus')
 


var server = http.createServer(app);


// Primus server
var primus = new Primus(server,{ transformer: 'sockjs' });
// Use resource plugin
primus
.use('multiplex', 'primus-multiplex')
.use('emitter', 'primus-emitter')
.use('resource', resource)
.use('substream', require('substream'));

primus.save(__dirname +'/public/primus/primus.js');

rtController(primus);


var obj = {
	host:"50.18.15.145",
	port: 4273
}


//Start server
server.listen( CONFIG.app.port, function () {
  console.log('Express server listening on port ',  CONFIG.app.port   );

/*
  var docker = new require('dockerode')({host: "http://"+obj.host, port: obj.port});

  docker.getEvents ( {since : 1385863200}, function(err, stream) {
		//console.log( stream)
		stream.on("data", function(chunk){
			console.log( chunk.toString());
			//primus.write( chunk.toString())
		})
		stream.setEncoding('utf-8')
		stream.pipe(primus);
		//stream.pipe( process.stdout );
  })
*/
});




module.exports = {
	server: server,
	primus:primus
}