var _ = require("underscore");
var uuid = require('node-uuid');
var redisClient = require("../db");
var CONFIG = require("config");
var async = require("async");
var util = require("util");	
var Validator = require("../lib/validation.js");

/*

###########  Add New docklet
zadd docklets timestamp ID// docklet LIST
hmset docklet:id id ID  host localhost port 4340

###########  Retrive docklet
zscore docklets id == nil  >> Return record not found
hgetall "docklet:id" >> { k:v, k:v,[,]}

###########  Delete Screen
del docklet:id
zrem docklets id


DATABASE
========================
zadd docklets 1395306635123 e50e1468-b057-41b0-8cb7-7a99c6ad26b6

HMSET docklet:e50e1468-b057-41b0-8cb7-7a99c6ad26b6 id e50e1468-b057-41b0-8cb7-7a99c6ad26b6   host localhost  port 4340


*/


var TABLE_NAME = {
	singular: "docklet",
	plural: "docklets"

}


var Docklet = {

	properties :{
		title: {
			type: "string",
			validations:["notEmpty"]
		},
		host: {
			type: "string",
			validations: ["notEmpty"]
		},
		port: {
			type: "number",
			validations:["notEmpty"]
		}
	},
	all: function(callback){
		var screenList = [];
		redisClient.zrange(TABLE_NAME.plural, 0, -1, function(err, list){
			if(err){
				callback(err, screenList)
				return;
			}else{
				async.each(list, function(screen_id, done){
					redisClient.hgetall( TABLE_NAME.singular+":"+screen_id, function(err, screen){
							screenList.push(screen);
							done(err);
					});

				}, function(err){			    
					callback(err, screenList);
				});
			}
		});
			
	},	
	validate : function(record, callback){
				var validator = new Validator(this.properties);
				validator.validate(record, function(err, pass){
					callback( err, pass);
				});
	},
	save :function(obj, callback){
			//ONLY NEW RECORD
			if( !obj.hasOwnProperty("id") ){
				obj.id =  uuid.v1();
			}else{
				util.log("Not a new record. Saving failed");
				calback("Not a new record", null);
				return;
			}	

		
			this.validate(obj, function(err, pass){
				if(!pass){
					util.log("Unable to save. Validation failed");
					console.log("Validation Errors: ", err);
					callback(err, null);
					return;
				}else{
					//VALIDATION PASSED

					var timestamp = +new Date;
					redisClient.multi()
						.zadd(TABLE_NAME.plural, timestamp, obj.id) // SCREENS-ID SET 
						.hmset( TABLE_NAME.singular+":"+obj.id, obj)
						.exec( function(err, replies){
							util.log("MULTI got " + replies.length + " replies");
							replies.forEach(function (reply, index) {
								util.log("Reply " + index + ": " + reply.toString());
							});
							callback(err, obj )
							//redisClient.end();
						});				

				}
			})
	},
	

	find: function(id, callback){
		//Record exist
		redisClient.hgetall(TABLE_NAME.singular +":"+id, function(err, obj){
			callback(err, obj )
			
		//	redisClient.end();
		});
	},


	destroy: function(obj, callback){

		if( !obj){
			callback("Invalid object" );
			return;
		}

		var id =  null;
		if( typeof(obj) == "object")
			id= obj.id
		else
			id = obj;

		redisClient.multi()
			.del( TABLE_NAME.singular +":"+id)
			.zrem( TABLE_NAME.plural , id)
			.exec( function(err, replies){
				util.log("MULTI got " + replies.length + " replies");
				replies.forEach(function (reply, index) {
					util.log("Reply " + index + ": " + reply.toString());
				});
				callback(err);
				//redisClient.end();
			});
	}

}

module.exports = Docklet;