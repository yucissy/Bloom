var csv = require('csv');

function Reports(db) {
	var transformers = {
		'qid': parseInt,
		'max_points': parseFloat
	};

	this.makeExam = function(course, name, data) {
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
		csv.parse(data, {columns:true}, function(err, output) {
			var test = [];
			for (var i=0; i<output.length; i++) {
				var insert = {'categories' : []};
				for (var key in output[i]) {
					if (key in transformers) {
						insert[key] = transformers[key](output[i][key]);
					} else {
						// find category id from db
						insert['categories'].push({'main_cat_id': key, 'sub_cat_id': parseInt(output[i][key])});
					}
				}
				test.push(insert);
			}
			db.insertTestForCourse(course, name, test);
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