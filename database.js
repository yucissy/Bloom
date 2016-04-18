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
            password: String,
            courses: [{type: mongoose.Schema.Types.String, ref: 'Course'}],
            type: String,
    });

    var testSchema = new mongoose.Schema({
            _id: String,
            name: String,
            questions: [    
                {
                    qid: String,
                    max_points: Number,
                    categories: [
                        {
                            main_cat_id: Number,
                            sub_cat_id: Number
                        }
                    ]
                }
            ]
    });

    var reportSchema = new mongoose.Schema({
            _id: {student_id: String, test_id: String},
            sub_categories: [    
                {
                    cid: Number,
                    percentage: Number
                }
            ]
    });

    var courseSchema = new mongoose.Schema({
        _id: String,
        title: String,
        semester: String,
        students: [{type: mongoose.Schema.Types.String, ref: 'User'}],
        professors: [{type: mongoose.Schema.Types.String, ref: 'User'}],
        tas: [{type: mongoose.Schema.Types.String, ref: 'User'}],
        tests: [{type: mongoose.Schema.Types.String, ref: 'Test'}]
    });

    var categorySchema = new mongoose.Schema({
        _id: String,
        name: String,
        sub_categories: [
            {
                _id: Number,
                name: String
            }
        ]
    });

    var aggregateDataSchema = new mongoose.Schema({
        _id: String,
        test_id: String,
        count: Number,
        questions: [
            {
                qid: String,
                sum_points: Number
            }
        ]
    });

    var User = mongoose.model('User', userSchema);
    var Test = mongoose.model('Test', testSchema);    
    var Report = mongoose.model('Report', reportSchema);
    var Course = mongoose.model('Course', courseSchema);
    var Category = mongoose.model('Category', categorySchema);
    var AggregateData = mongoose.model('Aggregate Data', aggregateDataSchema);

    this.insertUser = function (userId, userName, userEmail, userPassword, userCourses, user, callback) {
        var userToInsert = new User({
            _id: userId,
            name: userName,
            email: userEmail,
            password: userPassword,
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

    this.insertTest = function(testId, testName, testQuestions, callback) {
        var testToInsert = new Test({
            _id: testId,
            name: testName,
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

    this.insertReport = function(reportId, reportSubcategories, callback) {
        var reportToInsert = new Report({
            _id: reportId,
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

    this.insertCourse = function(courseId, courseTitle, courseSemester, courseStudents, courseProfessors, courseTAs, courseTests, callback) {
        var courseToInsert = new Course({
            _id: courseId,
            title: courseTitle,
            semester: courseSemester,
            students: courseStudents,
            professors: courseProfessors,
            tas: courseTAs,
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

    this.insertAggregateData = function(testId, studentCount, testQuestions) {
        var aggregateDataToInsert = new AggregateData({
            test_id: testId,
            count: studentCount,
            questions: testQuestions
        });

        aggregateDataToInsert.save(function(err, aggregateData) {
            if (err) {
                console.error(err);
                //callback(err, null);
            }
            else {
                console.dir(aggregateData);
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

    this.findAggregateData = function (criteria, field, callback) {
        AggregateData.findOne(criteria, field, callback);
    }

    /*this.updateAggregateData = function (criteria, aggregateDataQuestions) { //criteria should be the same format as the criteria in the find functions
        AggregateData.findOne(aggregateDataId, function(err, doc) {
            doc.questions = aggregateDataQuestions;
            doc.save();
        });
    }*/
}

module.exports = Database;

/*
    example of how to insert a document
*/

/*function testInsert(id, name, email, courses) {
    mongoose.connect('mongodb://bloom-admin:bloomwebappCS132@ds021989.mlab.com:21989/bloom', function(err, db) { //connect to the db
        insertStudent(id, name, email, courses, function(err, status) {
            mongoose.connection.close(); //once it's finished, disconnect from the db
            console.log("successfully disconnected from database");
        });
    });        
}*/


/*
if already connected to a database:

function testInsert(id, name, email, courses) {
    insertStudent(id, name, email, courses, function(err, status) {
    console.log(status);
});
}
*/
