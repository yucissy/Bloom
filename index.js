var fs = require('fs');
var express = require('express');
var engines = require('consolidate');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Data = require('./db_test.js');
var handlers = require('./handlers.js');

var app = express();
app.engine('html', engines.hogan);
app.set('views', __dirname + '/templates');
app.use(express.static(__dirname + '/static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var db = new Data();

handlers(app, db);

app.listen(8080, function(){
	console.log('- Server listening on port 8080');
});