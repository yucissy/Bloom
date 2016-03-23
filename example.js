var fs = require('fs');
var csv = require('csv');
var express = require('express');

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
var parser = csv.parse({columns:true});
var transformer = csv.transform(function(data){
	for (var key in transformers) {
		data[key] = transformers[key](data[key]);
	}
	return data;
}, function(err, output) {
	calculateReport(output, studentScores);
});

app.post('/examInput', function(req, res) {
	fs.createReadStream('example.csv').pipe(parser).pipe(transformer);
	res.send('Calculating...');
});

app.get('*', function(req, res) {
	res.send('<form action="/examInput" method="POST"><input type="submit" value="EXAM"></form>');
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
