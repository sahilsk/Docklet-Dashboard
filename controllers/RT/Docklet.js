var async = require("async");
var _ = require("underscore");
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

Docklet.prototype.oninfo = function( spark, id, fn){
	var resData = { error: null, data:null};

	mDocklet.find(id, function( err, obj){
		if( err){
			console.log("error caught: " + error);
			resData.error = error;
			fn( JSON.stringify( resData ) );		

		}else{
			var docker = new require('dockerode')({host: "http://"+obj.host, port: obj.port});
			docker.info(function(err, info) {
				if(err) {
					console.log("error caught: " + err);
					resData.error = err;
					fn( resData );
				}else{
					console.log("info: ", info);
					resData.data = info;
					fn(resData);
				}
			});		
	
		}
	})
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


Docklet.prototype.onexplore  = function( spark, id, fn){

	var resData = { error: null, data:null};

	mDocklet.find(id, function( err, obj){
		if( err){
			console.log("error caught: " + error);
			resData.error = error;
			fn( resData );		

		}else{
			var docker = new require('dockerode')({host: "http://"+obj.host, port: obj.port});
			async.parallel(
			{
			    info: function(callback){
			     	docker.info(function(err, info) {
						callback(err, info);
					})
			    },
			    version: function(callback){
			    	docker.version( function(err, version){
			    		callback(err, version);
			    	})
				 },
				 images: function(callback){
				 	docker.listImages(function(err, images) {
						callback(err, images);
					});
				 }
			},
			function(err, results) {
			    if(err){
					console.log("error caught: " + err);
					resData.error = err;
					fn( resData );
			    }else{
			    	resData.data = _.extend(results.info, results.version, {images: results.images}, obj);
			    	resData.data.id = id;
			    	fn( resData);
			    }

			});

	
		}
	})

}

Docklet.prototype.onevents = function( spark, data, fn){
	var resData = { error: null, data:null};

	mDocklet.find(data.id, function( err, obj){
		if( err){
			console.log("error caught: " + error);
			resData.error = error;
			fn(  resData );		

		}else{
			var docker = new require('dockerode')({host: "http://"+obj.host, port: obj.port});
			docker.getEvents (data.opts, function(err, stream) {
				if(err) {
					console.log("error caught: " + err);
					resData.error = err;
					fn( resData );
				}else{

					var  connection = require("../../server")
					stream.setEncoding('utf-8');
					//stream.pipe(spark);
					/*
					var through  = require("through")
					var a = through(function write(data) {
						    this.queue(data) //data *must* not be null
						  },
						  function end () { //optional
						    this.queue(null)
						  })


					a.pipe(spark)
					*/
					console.log(spark.id)
					stream.pipe(connection.primus)
					//a.write('Hello Wrld');
					resData.data = "STREAMING";
					fn(resData);
				}
			});		
	
		}
	})
}






module.exports = Docklet;