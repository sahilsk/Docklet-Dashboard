var CONFIG = require("config");
var app = require("./app.js");
var http = require('http');
var  rtController = require("./controllers/rtController");

var resource = require('primus-resource')
  , Primus = require('primus.io')


var server = http.createServer(app);


// Primus server
var primus = new Primus(server,{ transformer: 'websockets', parser: 'JSON' });
// Use resource plugin
primus.use('resource', resource);
primus.use('substream', require('substream'));

rtController.Resources(primus);



//Start server
server.listen( CONFIG.app.port, function () {
  console.log('Express server listening on port ',  CONFIG.app.port   );
});
