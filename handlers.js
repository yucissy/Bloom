var Reports = require('./reports.js');

var exports = function(app, db) {
	var reports = new Reports(db);

	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.post('/home', function(req, res) {
		var user = req.body.userID;
	});

	app.get('/uploadC', function(req, res) {
		res.render('upload_categories.html');
	})

	app.get('/uploadQ', function(req, res) {
		res.render('upload_questions.html');
	});

	app.post('/sendExam', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		var name = req.body.exam;
		var data = req.body.data;
		reports.makeExam(course, name, data);
	});

	app.post('/getExam', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		db.findTest({_id : exam}, '', function(err, data){
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exam : data}));
		});
	});

	app.post('/getExams', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		db.findCourse({_id : course}, 'tests', function(err, data) {
			var toSend = [];
			var tests = data.tests;
			for (var i=0; i<tests.length; i++) {
				console.log(tests[i]);
				db.findTest({_id : tests[i]}, 'name', function(err, tdata) {
					console.log(tdata);
					toSend.push();
				});
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exams : toSend}));
		});
	});
}

module.exports = exports;