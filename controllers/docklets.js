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
			var data = {
				docklets : err?[]: list,
				title: "Docklets"
			};
		}
		res.render("docklets/list", data)
	})


}