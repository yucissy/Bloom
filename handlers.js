var Reports = require('./reports.js');

var exports = function(app, db) {
	var reports = new Reports(db);

	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.post('/home', function(req, res) {
		var user = req.body.userID;
	})

	app.get('/upload', function(req, res) {

		res.render('upload_questions.html');
	})

	app.post('/sendExam', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		var name = req.body.exam;
		var data = req.body.data;
		reports.makeExam(course, name, data);

	})

	app.post('/getExams', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		console.log(course);
		db.findCourse({_id : course}, function(data) {
			console.log(data);
			var toSend = [];
			for (var t in data.tests) {
				db.findTestWithField({_id : t}, 'name', function(name) {
					toSend.push({id : t, name : name});
				});
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exams : toSend}));
		});
	})
}

module.exports = exports;