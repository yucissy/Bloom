var csv = require('csv');

function Reports(db) {
	var transformers = {
		'qid': parseInt,
		'max_points': parseFloat
	};

	this.makeExam = function(course, name, data) {
		csv.parse(data, {columns:true}, function(err, output) {
			var test = [];
			for (var i=0; i<output.length; i++) {
				var insert = {'categories' : []};
				for (var key in output[i]) {
					if (key in transformers) {
						insert[key] = transformers[key](output[i][key]);
					} else {
						// find category id from db
						var cat_id = 0;
						insert['categories'].push({'main_cat_id': cat_id, 'sub_cat_id': parseInt(output[i][key])});
					}
				}
				test.push(insert);
			}
			db.insertTest("TEST_ID", name, test, function(err, status){console.log(status)});
			db.updateCourse({_id : course}, "TEST_ID");
		});
	};

	function calculateReport(exam, scores) {
		var StudentBloom = {};
		var numQs = {};
		var totalPer = {};
		for (i = 0; i < exam.length; i++) {
			var key = exam[i].Blooms;
			numQs[key] = (numQs[key] || 0) + 1;
			totalPer[key] = (totalPer[key] || 0) + (studentScores[exam[i].QuestionNo] / exam[i].FullPoints);
		}
		for (var key in totalPer) {
			studentBloom[key] = Math.round(totalPer[key] / numQs[key] * 10000)/100;
		}
		console.log("Student's Blooms Breakdown: ");
		console.log(studentBloom);
	}
}

module.exports = Reports;