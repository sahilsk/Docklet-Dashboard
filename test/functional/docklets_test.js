var 
	should = require("should")
	,superagent = require("superagent")
	,Browser = require("zombie")
	, testUtil = require("../shared/testUtil")

var browser = new Browser({ debug: true, runScripts: true,maxWait:5000, waitFor :5000 });

describe("TEST-DOCKLETS PAGE", function(){
	var bseURL = null;
	before( function(){
		testUtil.startApp();
		baseURL = testUtil.baseURL;
	});
	after (function(){
		testUtil.stopApp();
		baseURL= null;
	});

	it("should see 'add new docklet' button if no docklet added", function(done){
		superagent
		.get( baseURL +"/docklets")
		.end(function(error, res){
			if(error) 
				throw error
			res.should.have.status(200)
			res.text.should.include("Add new docklet", "Error: Docklet add button not found!!");
			done();
		});
	});

	it("should create new docklet", function(done){
		browser.visit(baseURL +"/docklets", function () {
			should(browser.success).ok
			browser.wait(5000, function(){
				var newDocklet = browser.query("#newDocklet");
				browser.fire(newDocklet, "click", function(){
					browser.
						fill("#title", "test ec2").
						fill("#host", "50.18.15.145").
						fill("#port", "4273").
						fill("#healthURL", "/info").
						pressButton("Save changes", function(){
							browser.wait( 4000, function(){
								browser.query("#dockletsTable").should.be.ok
								done();
							})
							
						})

			})				
			})

		})


	})




})