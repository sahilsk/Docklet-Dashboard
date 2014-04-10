var docklet = require("../models/docklet.js")


exports.index = function(req, res){

	res.send("500")
}

exports.list = function(req, res){
	var session = req.session;

	docklet.all( function(err, list){
		if(err){
			console.log("Error listing docklets: ", err)
			session.messages = { "errors": "err"}
		}else{
			console.log( "Req.url: " + req.url);
			var data = {
				docklets : err?[]: list,
				title: "Docklets",
				page: req.url,
				nav: {
				  'Docklets': '/docklets',
				  'Dashboard': '/'
				}
			};
		}
		res.render("docklets/list", data)
	})


}
