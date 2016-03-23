var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
    console.log("Connected to DB!");

    var studentSchema = new mongoose.Schema({
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
    });

    var testSchema = new mongoose.Schema({
            _id: String,
            questions: [    
                {
                    qid: String,
                    max_points: Number,
                    content_area: String,
                    chapters: [String],
                    category: String
                }
            ]
    });

    var reportSchema = new mongoose.Schema({
            _id: {student_id: String, test_id: String},
            questions: [    
                {
                    qid: String,
                    points: Number
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

    var Student = mongoose.model('Student', studentSchema);
    var Test = mongoose.model('Test', testSchema);    
    var Report = mongoose.model('Report', reportSchema);
    var Professor = mongoose.model('Professor', professorSchema);    
    var TA = mongoose.model('TA', taSchema);
    var Course = mongoose.model('Course', courseSchema);

    /*
    var testReport = new Report({
        _id: {student_id: 'B013214113', test_id: 'test_cs132'},
        questions: [
            {
                qid: "Q1",
                points: 3
            },
            {
                qid: "Q2",
                points: 3
            }
        ]
    });

    testReport.save(function(err, report) {
        if (err)
            return console.error(err);
        else
            console.dir(report);
    });

    var testStudent = new Student({
        _id: 'B013214113',
        name: 'Josiah Carberry',
        email: 'test@brown.edu',
        courses: ['test', 'test2']
    });

    
    testStudent.save(function(err, student) {
        if (err)
            return console.error(err);
        else
            console.dir(student);
    });

    var testTest = new Test({
        _id: 'test_cs132',
        questions: [
            {
                qid: "Q1",
                max_points: 4,
                content_area: "Brain",
                chapters: ['3', '4'],
                category: "Memorizing"
            },
            {
                qid: "Q2",
                max_points: 4,
                content_area: "Brain",
                chapters: ['3', '4'],
                category: "Memorizing"
            },        
        ]
    });

    testTest.save(function(err, test) {
        if (err)
            return console.error(err);
        else
            console.dir(test);
    }); */

});

mongoose.connect('mongodb://bloom-admin:bloomwebappCS132@ds021989.mlab.com:21989/bloom');
