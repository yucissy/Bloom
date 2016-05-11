var csv = require('csv');

function Courses(db) {
	this.addNewCourse = function(course, title, semester, professor, data) {
		csv.parse(data, {columns:true}, function(err, output) {
			var check = output[0];
			if ('Student' in check && 'ID' in check) {
				var students = [];

				for (var i=0; i < output.length; i++) {
					students.push(output[i].ID);
				}

				var prof = [professor];
				var tests = [];

				db.insertCourse(course, title, semester, students, prof, tests, function(err) {
					if (err != null) {
						console.error(err);
					}
				});
			}
		});
	}
}

module.exports = Courses;
