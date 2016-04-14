var fs = require('fs');
var csv = require('csv');
var express = require('express');
var engines = require('consolidate');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var data = require('./database.js');

var transformers = {
	'QuestionNo': parseInt,
	'FullPoints': parseInt,
	'Blooms': parseInt
};
var studentBloom = {};
var studentScores = {1: 2,
	2: 0.5,
	3: 1,
	4: 1,
	5: 3,
	6: 1,
	7: 1,
	8: 2,
	9: 6.5,
	10: 1,
	11: 2,
	12: 1.5,
	13: 0,
	14: 1,
	15: 1.5,
	16: 1,
	17: 0,
	18: 1
};

var app = express();
app.engine('html', engines.hogan);
app.set('views', __dirname + '/templates');
app.use(express.static(__dirname + '/static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var parser = csv.parse({columns:true});
var transformer = csv.transform(function(data){
	for (var key in transformers) {
		data[key] = transformers[key](data[key]);
	}
	return data;
}, function(err, output) {
	calculateReport(output, studentScores);
});

//make post for sending specific exam data

app.post('/examInput', function(req, res) {
	console.log('here');
	console.log(req.body.data);
	var data = req.body.data;
	csv.parse(data, {columns:true}).pipe(transformer);
	res.send('Calculating...');
});

app.post('/home', function(req, res) {
	console.log(req.body.email);
	console.log(req.body.pass);

	// make & insert student account
	// send over student & course info with render
	res.render('upload_categories.html');
});

app.post('/signup', function(req, res) {
	var id = 'B00000123';
	var name = "Tester One";
	var email = "test@email.com";
	var courses = ["CSCI1320"];
	mongoose.connect('mongodb://bloom-admin:bloomwebappCS132@ds021989.mlab.com:21989/bloom', function(err, db) { //connect to the db
        data(id, name, email, courses, function(err, status) {
            mongoose.connection.close(); //once it's finished, disconnect from the db
            console.log("successfully disconnected from database");
        });
    });
});

app.post('/forgot', function(req, res) {
	var email;
});

app.get('/signup', function(req, res) {
	res.render('signup.html');
});

app.get('/forgot', function(req, res) {
	res.render('forgot.html');
});

app.get('*', function(req, res) {
	res.render('index.html');
});

app.listen(8080, function(){
	console.log('- Server listening on port 8080');
});

function calculateReport(exam, scores) {
	var numQs = {};
	var totalPer = {};
	for (i = 0; i < exam.length; i++) {
		var key = exam[i].Blooms;
		numQs[key] = (numQs[key] || 0) + 1;
		totalPer[key] = (totalPer[key] || 0) + (studentScores[exam[i].QuestionNo] / exam[i].FullPoints);
	}
	for (var key in totalPer) {
		studentBloom[key] = Math.round(totalPer[key] / numQs[key] * 10000)/100;
	}
	console.log("Student's Blooms Breakdown: ");
	console.log(studentBloom);
}
