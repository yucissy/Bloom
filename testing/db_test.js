var mongoose = require('mongoose');

function DatabaseTest() {
    
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
                        sub_cat_id: Number
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
                sub_cats: [{_id: Number, percentage: Number}]
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

    this.insertTestForCourse = function(courseId, testName, qs) {
        var testToInsert = new Test({
                title: testName,
                questions: qs
            });

        testToInsert.save(function(err) {
            if (err) console.error(err);

            Course.findOne({_id: courseId}).exec(function(err, course) {
                if (err) console.error(err);
                
                course.tests.push(testToInsert);

                course.save(function(err) {
                    if (err) console.error(err);
                });
            });
        });
    }

    this.insertStudentReport = function(userId, testId, categoriesList) {
        var reportToInsert = new Report({
            student_id: userId,
            test_id: testId,
            categories: categoriesList
        });

        reportToInsert.save(function(err) {
            if (err) console.error(err);            
        });
    }

    this.findTestFromCourse = function(course, callback){        
        Course.findOne({_id: course}).populate('tests', 'title').exec(function(err, course) {
            if (err) console.error(err);

            callback(course.tests);
        });
    }

    this.findTest = function(testId, callback) {
        Test.findOne({_id: testId}).populate('questions.categories.main_cat_id').exec(function(err, test) {
            if (err) console.error(err);

            callback(test);
        });
    }

    this.findReportForStudent = function(userId, callback) {
        Report.find({student_id : userId}).exec(function(err, reports) {
            if (err) console.error(err);

            callback(reports);
        });
    }

    this.findReport = function(userId, testId, callback) {
        Report.findOne({student_id: userId, test_id: testId}).populate('categories.main_cat_id').exec(function(err, report) {
            if (err) console.error(err);

            callback(report.categories);
        });
    }
    

    this.updateTestAggregateData = function (testId, questions) { //questions {1:4, 2:5, 3:6}
        for (var key in questions) {
            var userPoints = questions[key];
            var questionId = key;
            Test.update({'_id': testId, 'questions.qid': questionId}, {'$inc': {
                'questions.$.sum_points': userPoints
            }}, function(error, success){console.log(success);});
        }
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

// var test = new DatabaseTest();

// var testID = '5715481a29dfb6510595aca3';
// var questions = {1:4, 2:5}

//var userID = 'B0006789';
//var course = 'CSCI1320';

// test.updateTestAggregateData(testID, questions);
//test.updateTestCount(testID);
//test.deleteUserCourse(userID, course);


// var test = new DatabaseTest();
// var testID = '5715481a29dfb6510595aca3';
// var questions = [{qid: 1, points: 5}];

// test.updateTestAggregateData(testID, questions);
