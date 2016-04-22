var mongoose = require('mongoose');

// var db = mongoose.connection;

// db.on('error', console.error);
// db.once('open', function() {
//     console.log("Connected to DB!");
// });

function Database() {
    
    var db = mongoose.connect('mongodb://bloom-admin:bloomwebappCS132@ds021989.mlab.com:21989/bloom');

    var userSchema = new mongoose.Schema({
        _id: String,
        name: String,
        email: String,
        courses: [{ type: String, ref: 'Course' }],
        type: String
    });

    var testSchema = new mongoose.Schema({
        title: String,
        count: Number,
        questions: [
            {
                qid: Number,
                max_points: Number,
                categories: [
                    {
                        main_cat_id: { type: String, ref: 'Category' },
                        sub_cat: Number
                    }
                ],
                sum_points: Number
            }
        ]
    });

    var reportSchema = new mongoose.Schema({
            student_id: { type: String, ref: 'User' }, 
            test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
            categories: [
                {
                    main_cat_id: { type: String, ref: 'Category' },
                    sub_cats: [{name: String, percentage: Number}]
                }
            ]
    });

    var courseSchema = new mongoose.Schema({
        _id: String,
        title: String,
        semester: String,
        students: [{ type: String, ref: 'User' }],
        professors: [{ type: String, ref: 'User' }],
        tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }]
    });

    var categorySchema = new mongoose.Schema({
        _id: String,
        name: String,
        sub_categories: [String]
    });

    var User = mongoose.model('User', userSchema);
    var Test = mongoose.model('Test', testSchema);    
    var Report = mongoose.model('Report', reportSchema);
    var Course = mongoose.model('Course', courseSchema);
    var Category = mongoose.model('Category', categorySchema);

    this.insertUser = function (userId, userName, userEmail, userCourses, user, callback) {
        var userToInsert = new User({
            _id: userId,
            name: userName,
            email: userEmail,
            courses: userCourses,
            type: user
        });

        userToInsert.save(function(err, user) {
            if (err) {
                console.error(err);
                //callback(err, null);
            }
            else {
                console.dir(user);
                //callback(null, "success");
            }
        });
    }

    this.insertTest = function(testTitle, testCount, testQuestions, callback) {
        var testToInsert = new Test({
            title: testTitle,
            count: testCount,
            questions: testQuestions
        });

        testToInsert.save(function(err, test) {
            if (err) {
                console.error(err);
                //callback(err, null);
            }
            else {
                console.dir(test);
                //callback(null, "success");
            }
        });
    }

    this.insertReport = function(reportStudentId, reportTestId, reportSubcategories, callback) {
        var reportToInsert = new Report({
            student_id: reportId,
            test_id: testId,
            sub_categories: reportSubcategories
        });

        reportToInsert.save(function(err, report) {
            if (err) {
                console.error(err);
                //callback(err, null);
            }
            else {
                console.dir(report);
                //callback(null, "success");
            }
        });
    }

    this.insertCategory = function(categoryId, categoryName, categorySubcategories, callback) {
        var categoryToInsert = new Category({
            _id: categoryId,
            name: categoryName,
            sub_categories: categorySubcategories
        });

        categoryToInsert.save(function(err, category) {
            if (err) {
                console.error(err);
                //callback(err, null);
            }
            else {
                console.dir(category);
                //callback(null, "success");
            }
        });
    }

    this.insertCourse = function(courseId, courseTitle, courseSemester, courseStudents, courseProfessors, courseTests, callback) {
        var courseToInsert = new Course({
            _id: courseId,
            title: courseTitsle,
            semester: courseSemester,
            students: courseStudents,
            professors: courseProfessors,
            tests: courseTests
        });

        courseToInsert.save(function(err, course) {-
            if (err) {
                console.error(err);
                //callback(err, null);
            }
            else {
                console.dir(course);
                //callback(null, "success");
            }
        });
    }

    this.findUser = function (criteria, field, callback) {
        User.findOne(criteria, field, callback);
    }

    this.findTest = function (criteria, field, callback) {
        Test.findOne(criteria, field, callback);
    }

    this.findReport = function (criteria, field, callback) {
        Report.findOne(criteria, field, callback);
    }

    this.findCourse = function (criteria, field, callback) {
        Course.findOne(criteria, field, callback);
    }

    this.findCategory = function (criteria, field, callback) {
        Category.findOne(criteria, field, callback);
    }

    this.updateTestAggregateData = function (testId, questions) { //questions {1:4, 2:5, 3:6}
        Test.findOne({_id: testId}, function(err, test) {
            for (var key in questions) {
                var userPoints = questions[key];
                var questionId = key;
                Test.update({'_id': testId, 'questions.qid': questionId}, {'$inc': {
                    'questions.$.sum_points': userPoints
                }}, function(error, success){console.log(success);});
            }
        });
    }

    this.updateTestCount = function (testId) {
        Test.update({'_id': testId}, {'$inc': {
            'count': 1
        }}, function(error, success){console.log(success);});
    }

    this.insertUserCourse = function (userId, course) {
        User.findOne({_id: userId}, function(err, user) {
            user.courses.push(course);
            user.save(function(error, success){console.log(success);});
        });
    }

    this.deleteUserCourse = function (userId, course) {
        User.update({'_id': userId}, {'$pull': {
            'courses': course
        }}, function(error, success){console.log(success);});
    }
}

module.exports = Database;
