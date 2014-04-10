var CONFIG = require("config");
var app = require("./app.js");
var http = require('http');
var  rtController = require("./controllers/rtController");

var resource = require('primus-resource')
  , Primus = require('primus')
 


var server = http.createServer(app);


// Primus server
var primus = new Primus(server,{ transformer: 'websockets' });
// Use resource plugin
primus
.use('multiplex', 'primus-multiplex')
.use('emitter', 'primus-emitter')
.use('resource', resource)
.use('substream', require('substream'));

primus.save(__dirname +'/public/primus/primus.js');

rtController(primus);

 
//Start server
server.listen( CONFIG.app.port, function () {
  console.log('Express server listening on port ',  CONFIG.app.port   );
});




module.exports = {
	server: server,
	primus:primus
}