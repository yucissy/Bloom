var Data = require('./database.js');
var db = new Data();

db.insertCourse("CSCI0000", "yo what up", "Spring 2016", ["B0004567", "B0005678"], ["B0001234"], [], function(err) {
	if (err != null) console.error(err);
});