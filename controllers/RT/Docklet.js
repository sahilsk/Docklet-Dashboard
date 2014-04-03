var  mDocklet = require("../../models/docklet")
//Docklet Resource

var Docklet = function(){}


Docklet.prototype.oncommand = function (spark, command, fn) {
	  console.log(command);
	  fn('Creature just got command: ' + command);
}

Docklet.prototype.onwalk = function (spark, fn) {
	  // make the creature walk with some code
	  console.log('walk');
	  fn('Creature started to walk');
}

Docklet.prototype.oncreate = function( spark, data, fn){

	try{
		var jData =  JSON.parse(data);

		console.log("Creating docklet", data)
		fn("Docklet .. " + data)
	}catch(err){
				
	}

}



module.exports = Docklet;