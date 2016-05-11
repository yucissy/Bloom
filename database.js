var mongoose = require('mongoose');

function Database() {
    
    var db = mongoose.connect('mongodb://bloom-admin:bloomwebappCS132@ds021989.mlab.com:21989/bloom');

    // Schemas
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

    //functions for inserting a document into their respective schemas
    //Stormpath will take care of error handling for this function
    this.insertUser = function (userId, userName, userEmail, uType, callback) {
        console.log(uType);
        var userToInsert = new User({
            _id: userId,
            name: userName,
            email: userEmail,
            type: uType
        });

        userToInsert.save(function(err, user) {
            if (err) 
                callback("ERR: Could not save User: " + userName + ".");
            else
                callback(user);
        });
    }

    this.insertTestForCourse = function(courseId, testName, qs, callback) {
        var testToInsert = new Test({
                title: testName,
                questions: qs
            });

        testToInsert.save(function(err) {
            if (err) 
                callback("ERR: Could not save Test: " + testName + ".");
            else {
                Course.findOne({_id: courseId}).exec(function(err, course) {
                    if (err) 
                        callback("ERR: Could not find a course with ID: " + courseId + ".");
                    else {
                        if (course == null)
                            callback("ERR: Could not find a course with ID: " + courseId + ".");
                        else {
                            course.tests.push(testToInsert);

                            course.save(function(err) {
                                if (err) 
                                    callback("ERR: Could not save Test: " + testName + " to Course: " + courseId + ".");
                                else
                                    callback(null);
                            });
                        }
                    }
                });
            }
        });
    }

    this.insertStudentReport = function(userId, testId, categoriesList, callback) {
        var reportToInsert = new Report({
            student_id: userId,
            test_id: testId,
            categories: categoriesList
        });

        reportToInsert.save(function(err) {
            if (err) 
                callback("ERR: Could not save report for Student: " + userId + ".");
            else
                callback(null);
        });
    }

    this.insertCategory = function(categoryId, categoryName, categorySubcategories, callback) {
        var categoryToInsert = new Category({
            _id: categoryId,
            name: categoryName,
            sub_categories: categorySubcategories
        });

        categoryToInsert.save(function(err, category) {
            if (err) 
                callback("ERR: Could not save Category: " + categoryName + ".");
            else 
                callback(null);
        });
    }

    this.insertCourse = function(courseId, courseTitle, courseSemester, courseStudents, courseProfessors, courseTests, callback) {
        var courseToInsert = new Course({
            _id: courseId,
            title: courseTitle,
            semester: courseSemester,
            students: courseStudents,
            professors: courseProfessors,
            tests: courseTests
        });

        courseToInsert.save(function(error, course) {
            if (error) 
                callback("ERR: Could not save Course: " + courseId + ".");
            else {
                //iterate through students
                var users = courseStudents.concat(courseProfessors);
                for (var i = 0; i < users.length; i++) {
                    User.findOne({_id: users[i]}, function(error, user){
                        if (error)
                            callback("Warning: Could not find User: " + users[i] + ".");
                        else {
                            if (user != null) {
                                user.courses.push(courseToInsert);

                                user.save(function(error) {
                                    if(error)
                                        callback("ERR: Could not save course to User: " + student + "'s courses.");
                                    else
                                        callback(null);
                                });
                            }
                            else
                                callback("Warning: Could not find User: " + users[i] + ".");
                        }
                    });
                }
            }
        });
    }

    //functions for accessing certain fields of a document
    this.findTestFromCourse = function(course, callback) {        
        Course.findOne({_id: course}).populate('tests', 'title').exec(function(err, course) {
            if (err) 
                callback("ERR: Could not find Course: " + course + ".");
            else {
                if (course != null)
                    callback(course.tests);
                else
                    callback("ERR: Could not find Course: " + course + ".");
            }
        });
    }

    this.findPopulatedTestFromCourse = function(course, callback) {        
        Course.findOne({_id: course}).populate({path: 'tests',
                                                populate: { path: 'questions.categories.main_cat_id' }
                                               }).exec(function(err, course) {
            if (err) 
                callback("ERR: Could not find Course: " + course + ".");
            else {
                if (course != null)
                    callback(course.tests);
                else
                    callback("ERR: Could not find Course: " + course + ".");
            }
        });
    }

    this.getStudentsAndTestsFromCourse = function (courseId, callback) {
        Course.findOne({_id: courseId}).populate('students', 'name').populate('tests', 'title').exec(function(error, course) {
            if (error)
                callback("ERR: Could not find students from Course: " + courseId + ".", null);
            else {
                if (course != null)
                    callback(course.students, course.tests);
                else
                    callback("ERR: Could not find students from Course: " + courseId + ".", null);
            }
        });
    }

    this.findTest = function(testId, callback) {
        Test.findOne({_id: testId}).populate('questions.categories.main_cat_id').exec(function(err, test) {
            if (err) 
                callback("ERR: Could not find Test: " + testId + ".");
            else {
                if (test != null)
                    callback(test);
                else
                    callback("ERR: Could not find Test: " + testId + ".");
            }
        });
    }

    this.findReportForStudent = function(userId, callback) {
        Report.find({student_id : userId}).populate('categories.main_cat_id').exec(function(err, reports) {
            if (err) 
                callback("ERR: Could not find reports for Student: " + userId + ".");
            else {
                if (reports != null)
                    callback(reports);
                else
                    callback("ERR: Could not find reports for Student: " + userId + ".");
            }
        });
    }

    this.findReportForTest = function(testId, callback) {
        Report.find({test_id: testId}).populate('student_id').populate('categories.main_cat_id').exec(function(err, reports) {
            if (err) {
                callback("ERR: Could not find reports for Test: " + testId + ".");
            } else {
                if (reports != null)
                    callback(reports);
                else
                    callback("ERR: Could not find reports for Test: " + testId + ".");
            }
        });
    }

    this.findReport = function(userId, testId, callback) {
        Report.findOne({student_id: userId, test_id: testId}).populate('test_id', 'title').populate('categories.main_cat_id').exec(function(err, report) {
            if (err) 
                callback("ERR: Could not find report for Student: " + userId + " and Test: " + testId + ".");
            else {
                if (report != null)
                    callback(report);
                else
                    callback("ERR: Could not find report for Student: " + userId + " and Test: " + testId + ".");
            }
        });
    }

    this.findUserCourses = function (userId, callback) {
        User.findOne({_id: userId}).populate('courses', 'title').exec(function(err, user) {
            if (err)
                callback("ERR: Could not find user: " + userId + ".");
            else {
                if (user != null)
                    callback(user.courses);
                else
                    callback("ERR: Could not find user: " + userId + ".");
            }
        });
    }

    this.getUID = function(em, callback) {
        User.findOne({email : em}).exec(function(err, user) {
            if (err)
                callback("ERR: Could not find a user with email: " + em + ".");
            else {
                if (user != null)
                    callback(user._id);
                else
                    callback("ERR: Could not find a user with email: " + em + ".");
            }
        });
    }

    // functions for updating values (aggregate data + student count of those who inputted)
    this.updateTestAggregateData = function (testId, questions, callback) { //questions {1:4, 2:5, 3:6}
        for (var key in questions) {
            var userPoints = questions[key];
            var questionId = key;
            Test.update({'_id': testId, 'questions.qid': questionId}, {'$inc': {
                'questions.$.sum_points': userPoints
            }}, function(error, success){
                    if (error)
                        callback("ERR: Could not update Test: " + testId + ", Question: " + questionId + ".");
                    else
                        callback(null)
                });
        }
    }

    this.updateTestCount = function (testId, callback) {
        Test.update({'_id': testId}, {'$inc': {
            'count': 1
        }}, function(error, success){
                if (error)
                    callback("ERR: Could not update count of Test: " + testId + ".");
                else
                    callback(null)
            });
    }

    // insert/delete a course from the User document.
    this.insertUserCourse = function (userId, course, callback) {
        User.findOne({_id: userId}, function(err, user) {
            if (user != null) {
                user.courses.push(course);
                user.save(function(error, success){
                    if (error)
                        callback("ERR: Could not save Course: " + course + " to User: " + userId + ".");
                    else
                        callback(null);
                });
            }
            else {
                callback("ERR: Could not save Course: " + course + " to User: " + userId + ".");
            }
        });
    }

    this.deleteUserCourse = function (userId, course, callback) {
        User.update({'_id': userId}, {'$pull': {
            'courses': course
        }}, function(error, success){
                if (error)
                    callback("ERR: Could not delete Course: " + course + " from User: " + userId + ".");
                else
                    callback(null);
            });
    }

    // insert/delete a student, professor, test from the Course document.
    this.insertStudentIntoCourse = function (courseId, student, callback) {
        Course.findOne({_id: courseId}, function(err, course) {
            if (course != null) {
                course.students.push(student);
                course.save(function(error, success){
                                if (error)
                                    callback("ERR: Could not insert Student: " + student + "into Course: " + courseId + ".");
                                else
                                    callback(null);
                            });
            }
            else
                callback("ERR: Could not insert Student: " + student + "into Course: " + courseId + ".");
        });
    }

    this.deleteStudentFromCourse = function (courseId, student, callback) {
        Course.update({'_id': courseId}, {'$pull': {
            'students': student
        }}, function(error, success){
                if (error)
                    callback("ERR: Could not delete Student: " + student + "into Course: " + courseId + ".");
                else
                    callback(null);
            });
    }

    this.insertProfessorIntoCourse = function (courseId, professor, callback) {
        Course.findOne({_id: courseId}, function(err, course) {
            if (course != null) {
                course.professors.push(professor);
                course.save(function(error, success){
                    if (error)
                        callback("ERR: Could not insert Professor: " + professor + " into Course: " + courseId + ".");
                    else
                        callback(null);
                });
            }
            else
                callback("ERR: Could not insert Professor: " + professor + " into Course: " + courseId + ".");
        });
    }

    this.deleteProfessorFromCourse = function (courseId, professor, callback) {
        Course.update({'_id': courseId}, {'$pull': {
            'professors': professor
        }}, function(error, success){
                if (error)
                    callback("ERR: Could not delete Professor: " + professor + " from Course: " + courseId + ".");
                else
                    callback(null);
            });
    }

    this.insertTestIntoCourse = function (courseId, test) {
        Course.findOne({_id: courseId}, function(err, course) {
            if (course != null) {
                course.tests.push(test);
                course.save(function(error, success){
                    if (error)
                        callback("ERR: Could not insert test into Course: " + courseId + ".");
                    else
                        callback(null);
                });
            }
            else
                callback("ERR: Could not insert test into Course: " + courseId + ".");
        });
    }

    this.deleteTestFromCourse = function (courseId, test) {
        Course.update({'_id': courseId}, {'$pull': {
            'tests': test
        }}, function(error, success){
                if (error)
                    callback("ERR: Could not delete test from Course: " + courseId + ".");
                else
                    callback(null);
            });
    }

    //Function for verifying if the user is a Student or a Professor
    this.isUserStudent = function (userEmail, callback) {
        User.findOne({email: userEmail}).populate('courses', 'title').exec(function(error, user) {
            if (error || user == null) {
                callback("ERR: Could not find a user associated with the email " + userEmail + ".", null);
            }
            else {
                if (user.type === "Student")
                    callback(true, user);
                else
                    callback(false, user);
            }
        });
    }
}

module.exports = Database;
