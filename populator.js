var Data = require('./database.js');
var db = new Data();

db.insertUser('test_prof_1', 'mlinden', 'monica_linden@brown.edu', '', ['CSCI1230'], 'Professor');
db.insertCourse('CSCI1230', 'Creating Modern Web Apps', 'Spring 2016', [], ['test_prof_1'], [], ['TEST_ID']);
db.insertCategory('blooms', "Bloom's Taxonomy", [{1:'Remembering'}, {2:'Understanding'}, {3:'Applying'}, {4:'Analyzing'}, {5:'Evaluating'}, {6:'Creating'}]);
