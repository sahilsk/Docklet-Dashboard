
module.exports = {
	server : null,
	baseURL: null,

	startApp : function(){
		process.env["NODE_ENV"] = "test"
		var app = require("../../app.js")
		var http = require('http');
		var CONFIG = require("config")

		this.server = http.createServer(app).listen( CONFIG.app.port, function () {
		  console.log('Express server listening on port ',  CONFIG.app.port   );
		});

		this.baseURL = "http://localhost:"+CONFIG.app.port;
		return this.server;
	},
	stopApp : function(){
		console.log("Stopping test server...")
		if(this.server)
			this.server.close();
	}


}