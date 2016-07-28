var Data = require('../database.js');
var db = new Data();
db.findCategoriesForProfessor("B00999999", function(yo){});
// db.insertUser('test_prof_1', 'mlinden', 'monica_linden@brown.edu', '', ['CSCI1230'], 'Professor');
// db.insertCourse('CSCI1230', 'Creating Modern Web Apps', 'Spring 2016', [], ['test_prof_1'], [], ['TEST_ID']);
// db.insertCategory('blooms', "Bloom's Taxonomy", [{1:'Remembering'}, {2:'Understanding'}, {3:'Applying'}, {4:'Analyzing'}, {5:'Evaluating'}, {6:'Creating'}]);

/* The following was used to populate the current database. */

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
