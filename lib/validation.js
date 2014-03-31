/*****************************************************************
name; Validate
Description: Validate object against given object properties

********************/



var Validator = function( properties){
		this.properties = properties

	}

Validator.prototype.validate = function(obj, callback){
		var isValidated = true;
		var errors = {};

		var properties = this.properties;
		for(key in properties){
			errors[key] = [];

			var validations = properties[key].validations;
			

		//HANDLE VALIDATION RULES
			validations.forEach( function( validation){

				switch(validation){

					case "notEmpty":
						if( obj.hasOwnProperty(key) ){
							if( obj[key] === null  || obj[key].length === 0 )
								errors[key].push( key + " should not be empty" );
						}else
							errors[key].push( key + " should not be empty" );

						break;

					default:
						console.log("Unhandled validation rule: %s", validation);
				}
			});// end validations array


		//HANDLE KEY TYPE
			if(  obj.hasOwnProperty(key) && obj[key] != null   ){
				switch( properties[key]["type"] ){
					
					case "email":
						var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						if( re.test(obj[key]) === false){
								errors[key].push( key + " invalid email id" );
						}
						break;
					case "string":
						if(typeof(obj[key]) !== "string"){
							errors[key].push( key + " is not a string but " + typeof(obj[key]) );
						}
						break;
					case "number":
							if(typeof(obj[key]) !== "number"){
								errors[key].push( key + " is not a number but " + typeof(obj[key]) );
							}
							break;
					case "object":
						if(typeof(obj[key]) !== "object"){
							errors[key].push( key + " is not a object but " + typeof(obj[key]) );
						}
						break;						

					default:
						console.log("Un-supported type");
						errors[key].push(  properties[key]['type'] + " not supported yet");
				
				}
			}
				
			if( errors[key].length >  0)
				isValidated = false;

		}// END 'for' LOOP
		
		callback(errors,  isValidated);
};





module.exports = Validator;