var fs = require('fs');
var express = require('express');
var engines = require('consolidate');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Data = require('./database.js');
var Reports = require('./reports.js');
var Exams = require('./exams.js');
var Category = require('./categories.js');
var Courses = require('./courses.js');
var handlers = require('./handlers.js');

var app = express();
app.engine('html', require('hogan-engine'));
app.set('views', __dirname + '/templates');
app.use(express.static(__dirname + '/static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var db = new Data();
var reportService = new Reports(db);
var examService = new Exams(db);
var categoryService = new Category(db);
var courseService = new Courses(db);

handlers(app, reportService, examService, categoryService, courseService, db);

app.listen(8080, function(){
	console.log('- Server listening on port 8080');
});