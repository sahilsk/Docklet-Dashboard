var 
	should = require("should")
	,superagent = require("superagent")
	, testUtil = require("./shared/testUtil")





describe("Test-Routes", function(){
	var bseURL = null;
	before( function(){
		testUtil.startApp();
		baseURL = testUtil.baseURL;
	});
	after (function(){
		testUtil.stopApp();
		baseURL= null;
	})


	describe("Docklets", function(){

		it("GET /", function(done){
			superagent
			.get( baseURL +"/")
			.end(function(error, res){
				if(error) 
					throw error
				res.should.have.status(200);
				done();
			});

		})

		it("GET /docklets", function(done){
			superagent
			.get( baseURL +"/")
			.end(function(error, res){
				if(error) 
					throw error
				res.should.have.status(200);
				done();
			});


		})


	})
});