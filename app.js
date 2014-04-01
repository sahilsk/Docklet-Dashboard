/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');
var app = express();

var routes = require("./routes")

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

app.use( function(req, res, next){
	if( req.session.hasOwnProperty("messages") ){
		app.locals.messages = req.session.messages;
	}
	req.session.messages = null;
	next();
})

app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
routes(app);


module.exports = app;
