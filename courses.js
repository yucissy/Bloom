var csv = require('csv');

function Courses(db) {
	this.addNewCourse = function(course, title, semester, professor, data, callback) {
		csv.parse(data, {columns:true}, function(err, output) {
			var check = output[0];
			if (check != null && 'Student' in check && 'ID' in check) {
				var students = [];

				for (var i=0; i < output.length; i++) {
					students.push(output[i].ID);
				}

				var prof = [professor];
				var tests = [];

				db.insertCourse(course, title, semester, students, prof, tests, function(err) {
					if (err != null) {
						console.error(err);
						callback('fail');
					} else {
						callback('success');
					}
				});
			} else {
				console.error('ERROR: bad csv input');
			}
		});
	}

	this.getCoursesForUser = function(user, callback) {
		db.findUserCourses(user, callback);
	}

	this.getRoster = function(courseId, callback) {
		db.getStudentsAndTestsFromCourse(courseId, function(students, tests) {
			if (students == null) {
				callback(students, tests);
				return;
			}
			var toReturn = [];
			students.forEach(function(stu, i){
				var studentToAdd = {_id: stu._id, name: stu.name, exams: []}
				db.findReportForStudent(stu._id, function(rts, error) {
					if (rts == null) {
						console.error(error);
					} else {
						for (var k=0; k < tests.length; k++) {
							var flag = true;
							for (var j=0; j < rts.length; j++) {
								if (String(tests[k]._id) == String(rts[j].test_id)) {
									var toPush = {};
									toPush[tests[k].title] = true;
									studentToAdd.exams.push(toPush);
									flag = false;
									break;
								}
							}
							if (flag) {
								var toPush = {};
								toPush[tests[k].title] = false;
								studentToAdd.exams.push(toPush);
							}
						}
					}

					toReturn.push(studentToAdd);

					if (toReturn.length == students.length) {
						callback(toReturn);
					}
				});

			});
		});
	}
}

module.exports = Courses;
