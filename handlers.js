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

	app.post('/home', function(req, res) {
		var email = req.body.email;
		var pass = req.body.pass;
		// unsalt and unhash password
		console.log(email);
		console.log(pass);
		storm.logIn(email, pass, function() { console.log('login failed'); }, function(err, account) {
			if (err) {
				console.error(err);
				//alert user
				return;
			}

			console.log(account);

		});
	});

	app.post('/signUp', function(req, res) {
		var fName = req.body.firstName;
		var lName = req.body.lastName;
		var uID = req.body.BID;
		var email = req.body.email;
		var pass = req.body.password;
		var uType = req.body.type;
		// unsalt and unhash password

		var sessID = generateSessionID();

		// var fName = 'Harry';
		// var lName = 'Potter';
		// var uID = 'B0009999';
		// var email = 'harry@brown.edu';
		// var pass = 'theWizardingWorld55';
		storm.createAccount(fName, lName, uID, email, pass, function(err) {
			if (err) {
				console.error(err);
				return;
			}

			db.insertUser(uID, fName + " " + lName, email, uType);
			loggedIn[sessID] = uID;
		});
	});

	app.post('/logOut', function(req, res) {
		var sessID = req.body.userID;
		delete loggedIn[sessID];
	});

	app.post('/home', function(req, res) {
		var user = req.body.userID;

		var sessID = generateSessionID();
		loggedIn[sessID] = user;
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