var request = require('request');

var options = {
    headers: {
        'User-Agent': 'request'
    },
    timeout :3000
};


module.exports= function( healthCheckURL, cb){

	options.url = healthCheckURL;
	console.log("::::::::::::::: checking health: ", healthCheckURL)
	request( options, function(error, res, body){
	    if (!error && res.statusCode == 200) {
	    	// body.text.includes("OK")
	    	console.log("-----------Service is healthy-------------")
	    	cb(null, true);
	    	return;
	    }else{
	    	console.log("Error checking health: ", error);
	    	cb(error, false)
	    }

	})

}