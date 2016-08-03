var csv = require('csv');

function Exams(db) {
	var transformers = {
		'qid': parseInt,
		'max_points': parseFloat
	};

	this.makeExamHelper = function(validCategories, output) {
		var test = [];

		for (var i=0; i<output.length; i++) {
			var insert = {categories : []};
			for (var key in output[i]) {
				if (key in transformers) {
					insert[key] = transformers[key](output[i][key]);
				} else {
					var keyIsValid = validCategories.some(function(curr) {
						return curr._id == key;
					});
					if (keyIsValid) {
						insert.categories.push({'main_cat_id': key, 'sub_cat_id': parseInt(output[i][key])});
					} else {
						//error
					}
				}
			}
			test.push(insert);
		}
		return test;
	}

	this.makeExam = function(course, name, data, user, callback) {
		var make = this.makeExamHelper;
		csv.parse(data, {columns:true}, function(err, output) {
			if (output == null || output.length == 0) {
				callback('fail');
				return;
			}
			var check = output[0]; // check if rows have all required keys using first row
			if ('qid' in check && 'max_points' in check) {
				var proper_input = true;
				var qidDict = {}
				for (var i = 0; i < output.length; i++) {
					var questionData = output[i];
					var qid = questionData['qid'];
					var max_points = questionData['max_points'];
					if (qid in qidDict) { //check if the qid is already used.
						proper_input = false;
						break;
					}
					qidDict[qid] = 1;
					if (max_points < 0) {
						proper_input = false;
						break;
					}
				}
				if (proper_input) {
					db.findCategoriesForProfessor(user, function(validCategories){
						var test = make(validCategories, output);
						db.insertTestForCourse(course, name, test, function(error){
							if (error != null) {
								console.log(error);
								callback('fail');
							} else {
								callback('success');
							}
						});
					});
				}
				else {
					console.log('ERROR: bad csv input, check for proper values');
					callback('fail');
					return;
				}
			} else {
				console.error('ERROR: bad csv input');
				callback('fail');
				return;
			}
		});
	}
}

module.exports = Exams;