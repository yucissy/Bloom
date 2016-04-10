var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
    console.log("Connected to DB!");
});

/*var studentSchema = new mongoose.Schema({
        _id: String,
        name: String,
        email: String,
        courses: [String]
});

var professorSchema = new mongoose.Schema({
        _id: String,
        name: String,
        email: String,
        courses: [String]
});

var taSchema = new mongoose.Schema({
        _id: String,
        name: String,
        email: String,
        courses: [String]
}); */

var userSchema = new mongoose.Schema({
        _id: String,
        name: String,
        email: String,
        password: String,
        courses: [String],
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
    students: [String],
    professors: [String],
    tas: [String],
    tests: [String]
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

var Student = mongoose.model('Student', studentSchema);
//var User = mongoose.model('User', userSchema);
var Test = mongoose.model('Test', testSchema);    
var Report = mongoose.model('Report', reportSchema);
var Professor = mongoose.model('Professor', professorSchema);    
var TA = mongoose.model('TA', taSchema);
var Course = mongoose.model('Course', courseSchema);
var Category = mongoose.model('Category', categorySchema);

function insertUser(userId, userName, userEmail, userPassword, userCourses, user, callback) {
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
            callback(err, null);
        }
        else {
            console.dir(user);
            callback(null, "success");
        }
    });
}

/*function insertStudent(studentId, studentName, studentEmail, studentCourses, callback) {
    var studentToInsert = new Student({
        _id: studentId,
        name: studentName,
        email: studentEmail,
        courses: studentCourses
    });

    studentToInsert.save(function(err, student) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(student);
            callback(null, "success");
        }
    });
}

function insertProfessor(professorId, professorName, professorEmail, professorCourses, callback) {
    var professorToInsert = new Professor({
        _id: professorId,
        name: professorName,
        email: professorEmail,
        courses: professorCourses
    });

    professorToInsert.save(function(err, professor) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(professor);
            callback(null, "success");
        }
    });
}

function insertTA(taId, taName, taEmail, taCourses, callback) {
    var taToInsert = new Professor({
        _id: taId,
        name: taName,
        email: taEmail,
        courses: taCourses
    });

    taToInsert.save(function(err, ta) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(ta);
            callback(null, "success");
        }
    });
} */

function insertTest(testId, testName, testQuestions, callback) {
    var testToInsert = new Test({
        _id: testId,
        name: testName,
        email: testQuestions
    });

    testToInsert.save(function(err, test) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(test);
            callback(null, "success");
        }
    });
}

function insertReport(reportId, reportSubcategories, callback) {
    var reportToInsert = new Report({
        _id: reportId,
        sub_categories: reportSubcategories
    });

    reportToInsert.save(function(err, report) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(report);
            callback(null, "success");
        }
    });
}

function insertCategory(categoryId, categoryName, categorySubcategories, callback) {
    var categoryToInsert = new Category({
        _id: categoryId,
        name: categoryName,
        sub_categories: categorySubcategories
    });

    categoryToInsert.save(function(err, category) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(category);
            callback(null, "success");
        }
    });
}

function insertCourse(courseId, courseTitle, courseSemester, courseStudents, courseProfessors, courseTAs, courseTests, callback) {
    var courseToInsert = new Course({
        _id: courseId,
        title: courseTitle,
        semester: courseSemester,
        students: courseStudents,
        professors: courseProfessors,
        tas: courseTAs,
        tests: courseTests
    });

    courseToInsert.save(function(err, course) {
        if (err) {
            console.error(err);
            callback(err, null);
        }
        else {
            console.dir(course);
            callback(null, "success");
        }
    });
}

module.exports = insertStudent;

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
