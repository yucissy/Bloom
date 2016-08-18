var Reports = require('./reports.js');
var Exams = require('./exams.js');
var Category = require('./categories.js');
var Stormpath = require('./config/stormpath.js');
var Courses = require('./courses.js');
var lti = require('ims-lti');

var exports = function(app, reportService, examService, categoryService, courseService, db) {

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
	
	//in progress; need to test out
	app.post('/lti_launch', function(req, res) {		
		var consumerKey = req.body.oauth_consumer_key; 
		var consumerSecret = 'secret'; //change to canvas consumer secret
		
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
			
			res.status(200).json(body);
			
			
			//render appropriate pages here if student or professor

			res.status(200).json(body);
			
			//test code 
			/*
				if (body[instructor]) {
					res.render('upload_categories.html', {});
				}
				else {
					res.render('upload_questions.html', {});
				}

			/*
			var userId = provider['userId'];
			var student = provider['student'];
			var email = provider['body']['lis_person_contact_email_primary'];
			var name = provider['body']['lis_person_name_full'];
			
			db.findUID (userId, function(us) {
				//error message, set up new user account
				if (typeof user === "string") {
					if (student)
						db.insertUser(userId, name, email, "Student", function(newUser) {
							res.render('upload_questions.html', {user: us, course:[]});
						});
					else
						db.insertUser(userId, name, email, "Professor", function(newUser) {
							res.render('upload_categories.html', {user: us, course:[]});
						});
				}
				else {
					if (student) {
						res.render('upload_questions.html', {user: us, course:[]});
					}
					else {
						res.render('upload_categories.html', {user: us, course:[]});
					}
				}
			});
			*/
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

	// WILL BE DEAD CODE
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
				courseService.addNewCourse(course_id, course_title, sem, user, data, function(stat) {
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({status : stat}));
				});
			}
		});
	});

	app.post('/getCoursesForUser', function(req, res, next) {
		var user = req.body.userID;
		courseService.getCoursesForUser(user, function(courses, error) {
			if (courses == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({courses : crs}));
			}
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
		
		categoryService.makeNewCategory(user, catId, catName, subcategories, tips, function(stat) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/checkIfCategoryIdValid', function(req, res){
		var user = req.body.userID;
		var catID = req.body.categoryID;
		// catID = "blooms";

		categoryService.isCategoryValid(catID, function(stat) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/getStudyTipsForCategory', function(req, res, next){
		var user = req.body.userID;
		var catId = req.body.categoryID;
		// var catId = "blooms"
		categoryService.getStudyTipsForCategory(catId, function(tips, error) {
			if (tips == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({studyTips : tips}));
			}
		});
	});

	app.post('/getCategoriesForProfessor', function(req, res, next){
		var user = req.body.userID;
		// user = "B00999999";
		categoryService.getCategoriesForProfessor(user, function(profCategories, error) {
			if (profCategories == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({categories : profCategories}));
			}
		});
	});

	app.post('/makeNewExam', function(req, res) {
		var user = req.body.userID;
		var course = req.body.courseID;
		var name = req.body.exam;
		var data = req.body.data;
		examService.makeExam(course, name, data, user, function(stat) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/submitScoreCsvForExam', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		var data = req.body.scores;
		console.log(data);
		reportService.inputScoreCsv(exam, data, function(stat) {
			console.log(stat);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/submitStudentScoresForExam', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		var scores = req.body.scores;
		reportService.inputScore(user, exam, scores, function(stat) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({status : stat}));
		});
	});

	app.post('/getExamById', function(req, res, next) {
		var user = req.body.userID;
		var exam = req.body.examID;
		examService.getExamById(exam, function(data, error){
			if (data == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({exam : data}));
			}
		});
	});

	app.post('/getExamListForCourse', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;
		examService.getExamsByCourseId(course, function(examList, error) {
			if (examList == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({exams : examList}));
			}
		});
	});

	// exams where students have not submitted their scores yet
	app.post('/getPendingExams', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;
		
		examService.getPendingExamsByStudentAndCourse(courseId, studentId, function(examList, error) {
			if (examList == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({exams : examList}));
			}
		});
	});

	// A list of all categories report for a student in a course
	app.post('/getAllScoresForStudent', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1230'
		// var user = 'B0004567'
		reportService.getReportsByStudentAndCourse(user, course, function(reportList, error) {
			if (reportList == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({reports : reportList}));
			}
		});
	});

	// categories report for student's test
	app.post('/getScoreReportForExam', function(req, res, next) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		// var user = 'B0004567'
		reportService.getReportByStudentAndExam(user, exam, function(rep, error) {
			if (rep == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({report : rep}));
			}
		});
	});

	app.post('/getClassAverageScoreForExam', function(req, res, next){
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		reportService.getAverageScore(exam, function(avg, error) {
			if (avg == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({average : avg}));
			}
		});
	});

	// a list of aggregate reports for a professor in a course
	app.post('/getAllAggregate', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1230'

		reportService.getAllAggregate(course, function(agg, error) {
			if (agg == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({aggregate: agg}));
			}
		});

		// find better ways for these checks
		// db.isUserStudentById (user, function(result, person) {
		// 	if (!result) {
		// 	}
		// });
	});

	// scores to display along with study tips
	app.post('/getCumulativeReportForStudent', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// var course = 'CSCI1320';
		// var user = "B00111111";

		reportService.getCumulativeReportForStudent(user, course, function(cumul, error) {
			if (cumul == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({cumulative: cumul}));
			}
		});
	});

	// aggregate data for course - for professor use
	app.post('/downloadAggregate', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;
		// course = 'CSCI1320';
		reportService.downloadCourseData(course, function(path, error) {
			if (path == null) {
				next(error);
			} else {
				res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
				res.setHeader('Content-type', 'text/plain');
				res.download(path);
			}
		});
	});

	// individual exam data with student details - for professor only
	app.post('/downloadExamData', function(req, res, next) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// var exam = '5722c08ea598e9931e085fb8'
		
		reportService.downloadExamData(exam, function(path, error) {
			if (path == null) {
				next(error);
			} else {
				res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
				res.setHeader('Content-type', 'text/csv');
				res.download(path);
			}
		});
	});

	// public data for individual exams - for students
	app.post('/downloadPublicData', function(req, res, next) {
		var user = req.body.userID;
		var exam = req.body.examID;
		// exam = '5730c484f1a94d4245c40c76'
		reportService.downloadPublicData(exam, function(path, error) {
			if (path == null) {
				next(error);
			} else {
				res.setHeader('Content-disposition', 'attachment; filename=' + path.substr(16));
				res.setHeader('Content-type', 'text/csv');
				res.download(path);
			}
		});
	});

	// returns whether all students have submitted their scores (aka ready output class data)
	app.post('/readyForData', function(req, res) {
		var user = req.body.userID;
		var exam = req.body.examID;
		var course = req.body.courseID;
		
		reportService.checkIfAllReportsReady(course, exam, function(ready) {
			res.send(JSON.stringify({status: ready}));
		});
	});

	app.post('/getRosterForCourse', function(req, res, next) {
		var user = req.body.userID;
		var course = req.body.courseID;

		courseService.getRoster(course, function(rost, error) {
			if (rost == null) {
				next(error);
			} else {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({roster : rost}));
			}
		});
	});
}

module.exports = exports;
