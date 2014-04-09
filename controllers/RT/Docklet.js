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

Docklet.prototype.ongetContainers = function( spark, data, fn){
	var resData = { error: null, data:null};

	try{

		dockerHost = data.dockerHost;
		var docker = new require('dockerode')({host: "http://"+dockerHost.host, port: dockerHost.port});
		docker.listContainers(data.opts, function(err, containers) {
			if(err) {
				console.log("error caught: " + err);
				resData.error = err;
				fn( resData );
			}else{
				console.log("containers: ", containers);
				resData.data = containers;
				fn(resData);
			}
		});
	} catch(error){
		console.log("error caught: " + error);
		resData.error = error;
		fn( resData  );		
	}
}

Docklet.prototype.ongetContainerProcesses = function( spark, data, fn){
	var resData = { error: null, data:null};

	try{

		dockerHost = data.dockerHost;
		var docker = new require('dockerode')({host: "http://"+dockerHost.host, port: dockerHost.port});
		docker.listContainers(data.containerId, function(err, processes) {
			if(err) {
				console.log("Error caught: " + err);
				resData.error = err;
				fn( resData );
			}else{
				console.log("processes: ", processes);
				resData.data = processes;
				fn(resData);
			}
		});
	} catch(error){
		console.log("Error caught: " + error);
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
    				resData.data.dockerHost = obj;
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
					//stream.setEncoding('utf-8');
					var prettyjson = require('prettyjson');

					var JSONStream = require('JSONStream')
					var es = require("event-stream");
					var through = require("through");
					stream.pipe(JSONStream.parse())
						  .pipe(es.mapSync(function (data) {
						  		data.time = (new Date( parseInt(data.time)*1000)).toString()
						  		console.log( ":::::::::::" + data.time)
								console.log( prettyjson.render(data))
								connection.primus.write(prettyjson.render(data));

						   }))


					//stream.pipe(connection.primus)
					//a.write('Hello Wrld');
					resData.data = "STREAMING";
					fn(resData);
				}
			});		
	
		}
	})
}

Docklet.prototype.oninspectImage = function(spark, data, fn){
	var resData = { error: null, data:null};

	var docker = new require('dockerode')({host: "http://"+data.dockerHost.host, port: data.dockerHost.port});

	var prettyjson = require('prettyjson');

	var image = docker.getImage(data.imageId);
	image.inspect( function(err,res){
		if(err){
			resData.error = err;
			fn(resData);
		}{
			console.log(res);
			var pData = prettyjson.render( res);
			resData.data = pData;
			console.log( pData);
			fn(resData);
		}
	});
}

Docklet.prototype.oninspectContainer = function(spark, data, fn){
	var resData = { error: null, data:null};

	var dockerHost = data.dockerHost;
	var docker = new require('dockerode')({host: "http://"+ dockerHost.host, port: dockerHost.port});

	var prettyjson = require('prettyjson');

	console.log("Inspecting container: ", data.containerId)

	var container = docker.getContainer(data.containerId);
	container.inspect( function(err,res){
		if(err){
			resData.error = err;
			fn(resData);
		}{
			console.log(res);
			var pData = prettyjson.render( res);
			resData.data = pData;
			console.log( pData);
			fn(resData);
		}
	});
}

module.exports = Docklet;