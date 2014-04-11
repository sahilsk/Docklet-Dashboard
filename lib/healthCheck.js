var request = require('request');

var options = {
    headers: {
        'User-Agent': 'request'
    },
    timeout :3000
};


module.exports= function( healthCheckURL, cb){

	options.url = healthCheckURL;

	request( options, function(error, res, body){
	    if (!error && res.statusCode == 200) {
	    	// body.text.includes("OK")
	    	cb(null, true);
	    	return;
	    }else{
	    	cb(error, false)
	    }

	})

}