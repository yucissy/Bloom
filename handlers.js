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

	app.get('/home', function(req, res) {
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

		storm.logIn(email, pass, function() {
			res.render('index.html', {alert: "Login failed! Please try again."});
		}, function(err, account) {
			if (err) {
				res.render('index.html', {alert: "Login failed! Please try again."});
			} else {
				var sessID = generateSessionID();
				loggedIn[sessID] = account.username;
				db.isUserStudent(account.email, function(stu, us) {
					if (stu) {
						res.render('upload_questions.html', {user: us, course: us.courses});
					} else {
						res.render('upload_categories.html', {user: us, course: us.courses});
					}
				});
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
				db.insertUser(uID, fName + " " + lName, email, uType, function(us) {
					if (typeof us === 'string') {
                        res.render('signup.html', {alert: "Sign up failed! An account with your credentials may already exist."});
                    } else {
                    	res.render('index.html', {alert: "Sign up success! Please log in."});
                    }
				});
			}
		});
	});

	app.post('/logOut', function(req, res) {
		var sessID = req.body.userID;
		delete loggedIn[sessID];
	});

	app.post('/sendExam', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		var name = req.body.exam;
		var data = req.body.data;
		reports.makeExam(course, name, data, function(stat) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/sendScores', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		var scores = req.body.scores;
		db.findTest({_id: exam}, function(data) {
			reports.calculateReport(user, data, scores, function(stat) {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({status : stat}));
			});
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

				for (var i = 0; i < data.length; i++) {
					var flag = true;
					for (var j = 0; j < reports.length; j++) {
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

	// A list of all categories report for a student in a course
	app.post('/getAllScores', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1230'
		// var user = 'B0004567'
		db.findTestFromCourse(course, function(tests) {
			db.findReportForStudent(user, function(reports) {
				var toReturn = [];
				for (var i = 0; i < tests.length; i++) {
					var toAppend = {test: tests[i], categories: null};
					for (var j = 0; j < reports.length; j++) {
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

	// categories report for student's test
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

	app.post('/getAverageScore', function(req, res){
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		db.findTest(exam, function(test) {
			var avg = reports.calculateAverageScore(test);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({average : avg}));
		});
	});

	// a list of aggregate reports for a professor in a course
	app.post('/getAllAggregate', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1230'
		db.findPopulatedTestFromCourse(course, function(tests) {
			var toReturn = [];
			for (var i = 0; i < tests.length; i++) {
				var calc = reports.calculateAggregate(tests[i]);
				toReturn.push({test: {_id: tests[i]._id,
									  title: tests[i].title,
									  count: tests[i].count}, 
							   categories: calc});
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({aggregate: toReturn}));
		});

	});

	// aggregate report for a test
	app.post('/getAggregate', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		db.findTest(exam, function(data){
			var calc = reports.calculateAggregate(data);
			var toReturn = {test: {_id: data._id,
									  title: data.title,
									  count: data.count}, 
							   categories: calc};
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({aggregate: toReturn}));
		});
	});

	app.post('/downloadAggregate', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// course = 'CSCI1320';
		db.findPopulatedTestFromCourse(course, function(tests) {
			reports.downloadCourseData(course, tests, function(path) {
				res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
				res.setHeader('Content-type', 'text/plain');
				res.download(path);
			});
		});
	});

	app.post('/downloadExamData', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		db.findReportForTest(exam, function(rts){
			reports.downloadExamData(exam, rts, function(path) {
				res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
				res.setHeader('Content-type', 'text/csv');
				res.download(path);
			});
		});
	});

	app.post('/readyForData', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		var course = req.body.courseID;
		db.getStudentsAndTestsFromCourse(course, function(stu, t) {
			db.findTest(exam, function(test) {
				var ready = "false";
				if (stu.length == test.count) {
					ready = "true";
				}
				res.send(JSON.stringify({status: ready}));
			});
		});
	});

	app.post('/downloadPublicData', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// exam = '5730c484f1a94d4245c40c76'
		db.findTest(exam, function(test) {
			reports.downloadPublicData(test, function(path) {
				res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
				res.setHeader('Content-type', 'text/csv');
				res.download(path);
			});
		});
	});

	app.post('/getRoster', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;

		db.getStudentsAndTestsFromCourse(course, function(students, tests) {
			var toReturn = [];
			students.forEach(function(stu, i){
				var studentToAdd = {_id: stu._id, name: stu.name, exams: []}
				db.findReportForStudent(stu._id, function(rts) {
					for (var k=0; k < tests.length; k++) {
						var flag = true;
						for (var j=0; j < rts.length; j++) {
							if (String(tests[k]._id) == String(rts[j].test_id)) {
								var toPush = {};
								toPush[tests[k].title] = true;
								studentToAdd.exams.push(toPush);
								flag = false;
								break;
							}
						}
						if (flag) {
							var toPush = {};
							toPush[tests[k].title] = false;
							studentToAdd.exams.push(toPush);
						}
					}

					toReturn.push(studentToAdd);

					if (toReturn.length == students.length) {
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify({roster : toReturn}));
					}
				});

			});
		});
	});
}

module.exports = exports;
