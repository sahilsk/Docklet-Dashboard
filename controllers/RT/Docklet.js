var  mDocklet = require("../../models/docklet")
//Docklet Resource

var Docklet = function(){}


Docklet.prototype.oncreate = function( spark, data, fn){
	var resData = { error: null, data:null};

	try{
		mDocklet.save(data, function(err, docklet){
			if(err){
				resData.error = err;
			}else
				{
					console.log("Docklet created successfully");
					resData.data =docklet;
				}
			fn( resData);
		})
	} catch(err){
		resData.error = err;
		fn( resData );
	}

}

Docklet.prototype.ondelete = function( spark, id, fn){
	var resData = { error: null, data:null};

	mDocklet.destroy(id, function(err){
		resData.error = err;
		fn( resData);
	})
}

Docklet.prototype.oninfo = function( spark, data, fn){
	var resData = { error: null, data:null};

	try{
		var docker = new require('dockerode')({host: "http://"+data.host, port: data.port});
		docker.info(function(err, info) {
			if(err) {
				console.log("error caught: " + err);
				resData.error = err;
				fn( resData );
				return;
			}else{
				console.log("info: ", info);
				resData.data = info;
				fn(resData);
				return;
			}
		});
	} catch(error){
		console.log("error caught: " + error);
		resData.error = error;
		fn( JSON.stringify( resData ) );		
	}
}



Docklet.prototype.ongetImages = function( spark, data, fn){
	var resData = { error: null, data:null};

	try{
		var docker = new require('dockerode')({host: "http://"+data.host, port: data.port});
		docker.listImages(function(err, images) {
			if(err) {
				console.log("error caught: " + err);
				resData.error = err;
				fn( resData );
			}else{
				console.log("images: ", images);
				resData.data = images;
				fn(resData);
			}
		});
	} catch(error){
		console.log("error caught: " + error);
		resData.error = error;
		fn( resData  );		
	}
}






module.exports = Docklet;