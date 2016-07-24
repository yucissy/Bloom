var Reports = require('./reports.js');
var Stormpath = require('./config/stormpath.js');
var Courses = require('./courses.js');
var lti = require('ims-lti');

var exports = function(app, db) {
	var reports = new Reports(db);
	var storm = new Stormpath();
	var courses = new Courses(db);
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
	
	//in progress; need to test out
	app.post('/lti_launch', function(req, res) {
		console.log("test here");
		
		var consumerKey = req.body.oauth_consumer_key;
		var consumerSecret = 'secret';
		
		var provider = new lti.Provider(consumerKey, consumerSecret);
		
		provider.valid_request(req, function(err, isValid) {
			if (err || !isValid) {
				return next(err || new Error('invalid lti'));
			}
			
			var body = {};
			[
				'roles', 'admin', 'alumni', 'content_developer', 'guest', 'instructor',
				'manager', 'member', 'mentor', 'none', 'observer', 'other', 'prospective_student',
				'student', 'ta', 'launch_request', 'username', 'userId', 'mentor_user_ids',
				'context_id', 'context_label', 'context_title', 'body'
			].forEach(function (key) {
				body[key] = provider[key];
			});
			
			//render appropriate pages here if student or professor
			res.render('index.html')	
		});		
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
					var courseMus = [];
					for (var i=0; i < us.courses.length; i++) {
						var c = us.courses[i];
						if (i == 0) {
							c.first = true;
						} else {
							c.other = true;
						}
						courseMus.push(c);
					}
					if (stu) {
						res.render('upload_questions.html', {user: us, course: courseMus});
					} else {
						res.render('upload_categories.html', {user: us, course: courseMus});
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

	app.post('/addNewCourse', function(req, res) {
		var user = req.body.userID;
		var course_id = req.body.courseID;
		var course_title = req.body.title;
		var sem = req.body.semester;
		var data = req.body.data;
		
		// user = 'B00999999';
		// course_id = 'CSCI9999';
		// course_title = 'Testing This Web App';
		// sem = 'Spring 2017';
		// data = 'Student,ID\nKatie Han,B00666666\nStudent Tester,B00111111\nAnother Student,B00222222';
		
		db.isUserStudentById(user, function(result, person) {
			if (!result) {
				courses.addNewCourse(course_id, course_title, sem, user, data, function(stat) {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({status : stat}));
				});
			}
		});
	});

	app.post('/getCoursesForUser', function(req, res) {
		var user = req.body.userID;

		db.findUserCourses(user, function(crs) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({courses : crs}));
		});
	});

	app.post('/makeNewCategory', function(req, res) {
		var user = req.body.userID;
		var catId = req.body.categoryID;
		var catName = req.body.categoryName;
		var subcategories = req.body.subCategories;
		var tips = req.body.studyTips;

		// user = "B00999999";
		// catId = "test_cat";
		// catName = "Test Category";
		// subcategories = ["Chapter 1", "Chapter 2", "Chapter 3"];
		// tips = ["Study ch 1", "study ch 2", "study ch 3"];
		
		db.isUserStudentById(user, function(result, person) {
			if (!result) {
				db.insertCategory(catId, user, catName, subcategories, tips, function(stat) {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({status : stat}));
				});
			}
		});
	});

	app.post('/checkIfCategoryIdValid', function(req, res){
		var user = req.body.userID;
		var catID = req.body.categoryID;
		// catID = "blooms";

		db.doesCategoryExist(catID, function(exists) {
			var message;
			if (exists) {
				message = "This ID already exists. Please try a different ID.";
			} else {
				message = "success";
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : message}));
		});
	});

	app.post('/getStudyTipsForCategory', function(req, res){
		var user = req.body.userID;
		var catId = req.body.categoryID;
		// var catId = "blooms"
		db.findStudyTipsForCategory(catId, function(tips) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({studyTips : tips}));
		});
	});

	app.post('/getCategoriesForProfessor', function(req, res){
		var user = req.body.userID;
		// user = "B00999999";
		db.isUserStudentById (user, function(result, person) {
			if (!result) {
				db.findCategoriesForProfessor(user, function(profCategories) {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({categories : profCategories}));
				});
			}
		});
	});

	app.post('/makeNewExam', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		var name = req.body.exam;
		var data = req.body.data;
		reports.makeExam(course, name, data, function(stat) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/submitStudentScoresForExam', function(req, res) {
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

	app.post('/getExamById', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		db.findTest({_id : exam}, function(data){
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exam : data}));
		});
	});

	app.post('/getExamListForCourse', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		db.findTestFromCourse(course, function(data) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({exams : data}));
		});
	});

	// exams where students have not submitted their scores yet
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
	app.post('/getAllScoresForStudent', function(req, res) {
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
	app.post('/getScoreReportForExam', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		// var user = 'B0004567'
		db.findReport(user, exam, function(data) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({report : data}));
		});
	});

	app.post('/getClassAverageScoreForExam', function(req, res){
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
		db.isUserStudentById (user, function(result, person) {
			if (!result) {
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
			}
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

	// scores to display along with study tips
	app.post('/getCumulativeReportForStudent', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1320';
		// var user = "B00111111";

		db.findTestFromCourse(course, function(data) {
			db.findReportForStudent(user, function(rts) {
				var reportsToCalculate = [];

				for (var i = 0; i < rts.length; i++) {
					var flag = false;
					for (var j = 0; j < data.length; j++) {
						if (String(rts[i].test_id) == String(data[j]._id)) {
							flag = true;
							break;
						}
					}
					if (flag) {
						reportsToCalculate.push(rts[i]);
					}
				}

				var toReturn = reports.calculateCumulativeScore(reportsToCalculate);

				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({cumulative: toReturn}));
			});
		});
	});

	// aggregate data for course - for professor use
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

	// individual exam data with student details - for professor only
	app.post('/downloadExamData', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		db.findReportForTest(exam, function(rts){
			if (rts.length == 0) {
				console.error('Should not be called. No reports to download.');
			} else {
				reports.downloadExamData(exam, rts, function(path) {
					res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
					res.setHeader('Content-type', 'text/csv');
					res.download(path);
				});
			}
		});
	});

	// returns whether all students have submitted their scores (aka ready output class data)
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

	// public data for individual exams - for students
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

	app.post('/getRosterForCourse', function(req, res) {
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
