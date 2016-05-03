var Reports = require('./reports.js');
var Stormpath = require('./config/stormpath.js');

var exports = function(app, db) {
	var reports = new Reports(db);
	var storm = new Stormpath();
	var loggedIn = {};

	function generateSessionID() {
		var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		var result = '';
		for (var i = 0; i < 10; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/signup', function(req, res) {
		res.render('signup.html');
	});

	app.get('/forgot', function(req, res) {
		res.render('forgot.html');
	});

	app.post('/home', function(req, res) {
		var email = req.body.email;
		var pass = req.body.pass + "A";

		// unsalt and unhash password
		storm.logIn(email, pass, function() {
			res.render('index.html', {alert: "Login failed! Please try again."});
		}, function(err, account) {
			if (err) {
				res.render('index.html', {alert: "Login failed! Please try again."});
			} else {
				var sessID = generateSessionID();
				loggedIn[sessID] = account.username;
				res.render('upload_categories.html')
			}
		});
	});

	app.post('/signUp', function(req, res) {
		var fName = req.body.first_name;
		var lName = req.body.last_name;
		var uID = req.body.banner_id;
		var email = req.body.email;
		var pass = req.body.pass + "A";
		var uType = req.body.type;

		var sessID = generateSessionID();

		storm.createAccount(fName, lName, uID, email, pass, function(err) {
			if (err) {
				console.error(err);
				res.render('signup.html', {alert: "Sign up failed! An account with your credentials may already exist."});
			} else {
				db.insertUser(uID, fName + " " + lName, email, uType);
				loggedIn[sessID] = uID;
				res.render('upload_categories.html');
			}
		});
	});

	app.post('/logOut', function(req, res) {
		var sessID = req.body.userID;
		delete loggedIn[sessID];
	});

	app.get('/uploadC', function(req, res) {
		console.log(req);
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

	app.post('/sendScores', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		var scores = req.body.scores;
		db.findTest({_id: exam}, function(data) {
			reports.calculateReport(user, data, scores);
		});
	});

	app.post('/getExam', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		db.findTest({_id : exam}, function(data){
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exam : data}));
		});
	});

	app.post('/getExams', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		db.findTestFromCourse(course, function(data) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exams : data}));
		});
	});

	app.post('/getPendingExams', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		db.findTestFromCourse(course, function(data) {
			db.findReportForStudent(user, function(reports) {
				var testsToReturn = [];

				for (i = 0; i < data.length; i++) {
					var flag = true;
					for (j = 0; j < reports.length; j++) {
						if (String(data[i]._id) == String(reports[j].test_id)) {
							flag = false;
							break;
						}
					}
					if (flag) {
						testsToReturn.push(data[i]);
					}
				}

				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({exams : testsToReturn}));
			});
		});
	});

	app.post('/getAllScores', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1230'
		// var user = 'B0004567'
		db.findTestFromCourse(course, function(tests) {
			db.findReportForStudent(user, function(reports) {
				var toReturn = [];
				for (i = 0; i < tests.length; i++) {
					var toAppend = {test: tests[i], categories: null};
					for (j = 0; j < reports.length; j++) {
						if (String(reports[j].test_id) == String(tests[i]._id)) {
							toAppend.categories = reports[j].categories;
							break;
						}
					}
					toReturn.push(toAppend);
				}
				
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({reports : toReturn}));
			});
		});
	});

	app.post('/getScores', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		// var user = 'B0004567'
		db.findReport(user, exam, function(data) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({report : data}));
		});
	});

	app.post('/getAggregate', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		db.findTest({_id : exam}, function(data){
			var results = reports.calculateAggregate(data);
		});
	});
}

module.exports = exports;