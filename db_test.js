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
                        sub_cat: String
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

    // var csci = new Course({
    //     _id: 'CSCI1230',
    //     title: "Creating Modern Web Apps",
    //     semester: "Spring 2016",
    // });

    // csci.save(function(err) {
    //     if (err) console.error(err);
        
    //     var prof = new User({
    //         _id: 'B0001234',
    //         name: 'Monica Linden',
    //         email: 'monica_linden@brown.edu',
    //         courses: [csci._id],
    //         type: 'professor'
    //     });

    //     var stud1 = new User({
    //         _id: 'B0004567',
    //         name: 'Cissy Yu',
    //         email: 'cissy_yu@brown.edu',
    //         courses: [csci._id],
    //         type: 'student'
    //     });

    //     var stud2 = new User({
    //         _id: 'B0005678',
    //         name: 'Katie Han',
    //         email: 'katie_han@brown.edu',
    //         courses: [csci._id],
    //         type: 'student'
    //     });

    //     var stud3 = new User({
    //         _id: 'B0006789',
    //         name: 'Michael Lee',
    //         email: 'michael_k_lee@brown.edu',
    //         courses: [csci._id],
    //         type: 'student'
    //     });

    //     prof.save(function(err) {
    //         if (err) console.error(err);
    //     });

    //     stud1.save(function(err) {
    //         if (err) console.error(err);
    //     });

    //     stud2.save(function(err) {
    //         if (err) console.error(err);
    //     });

    //     stud3.save(function(err) {
    //         if (err) console.error(err);
    //     });

    // });

    // User.findOne({name:'Katie Han'}).populate('courses', 'title').exec(function(err, user){
    //     if (err) console.error(err);

    //     console.log('%s is taking %s', user.name, user.courses[0].title);
    // });
    
    // Course.findOne({_id:'CSCI1230'}).exec(function(err, course) {
    //     User.find({courses:['CSCI1230'], type:'professor'}).exec(function(err, users) {
    //         console.log(users);
    //         for (var i=0; i<users.length; i++) {
    //             course.professors.push(users[i]._id);
    //         }
    //         course.save(function(err) {
    //             if (err) console.error(err);
    //         });
    //     });
    // });
    
    // var bloom = new Category({
    //     _id: 'blooms',
    //     name: "Bloom's Taxonomy",
    //     sub_categories: ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating']
    // });

    // bloom.save(function(err) {
    //     if (err) console.error(err);
    // });
    
}

var dbTest = new DatabaseTest();
