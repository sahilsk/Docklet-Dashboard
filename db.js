var 
	redis = require("redis")
	, CONFIG  = require("config")

var redisClient =  redis.createClient(CONFIG.redis.port, CONFIG.redis.host)


redisClient.on("error", function(err){
	console.log("REDIS ERROR: " + err.message);
})


module.exports = redisClient;