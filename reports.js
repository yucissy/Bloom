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
						insert['categories'].push({'main_cat_id': key, 'sub_cat_id': parseInt(output[i][key])});
					}
				}
				test.push(insert);
			}
			db.insertTestForCourse(course, name, test);
		});
	};

	this.calculateReport = function(userId, exam, scores) {
		var qs = exam.questions;
		var catToReturn = [];
		for (i = 0; i < qs[0].categories.length; i++) {
			var catToAppend = {main_cat_id: qs[0].categories[i].main_cat_id, sub_cats: []};
			var numQs = {};
			var totalPer = {};
			for (j = 0; j < qs.length; j++) {
				var qid = qs[j].qid;
				var fullPoints = qs[j].max_points;
				var subCat = qs[j].categories[i].sub_cat_id;
				numQs[subCat] = (numQs[subCat] || 0) + 1;
				totalPer[subCat] = (totalPer[subCat] || 0) + (scores[qid] / fullPoints);
			}

			for (var key in totalPer) {
				var per = Math.round(totalPer[key] / numQs[key] * 10000)/100;
				catToAppend.sub_cats.push({_id: key, percentage: per});
			}
			catToReturn.push(catToAppend);
		}
		db.insertStudentReport(userId, exam._id, catToReturn);
	}
}

module.exports = Reports;