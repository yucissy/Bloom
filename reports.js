var csv = require('csv');

function Reports(db) {
	var transformers = {
		'qid': parseInt,
		'max_points': parseFloat
	};

	this.makeExamHelper = function(output) {
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
		return test;
	}

	this.calculateReportHelper = function(questions, scores) {
		var catToReturn = [];

		// loop thru each category
		for (i = 0; i < questions[0].categories.length; i++) {
			var catToAppend = {main_cat_id: questions[0].categories[i].main_cat_id, sub_cats: []};
			var numQs = {};
			var totalPer = {};
			// for each question, add score and increment number of Q for the sub category it belongs to
			for (j = 0; j < questions.length; j++) {
				var qid = questions[j].qid;
				var fullPoints = questions[j].max_points;
				var subCat = questions[j].categories[i].sub_cat_id;
				numQs[subCat] = (numQs[subCat] || 0) + 1;
				totalPer[subCat] = (totalPer[subCat] || 0) + (scores[qid] / fullPoints);
			}
			// calculate percentage for each sub category
			for (var key in totalPer) {
				var per = Math.round(totalPer[key] / numQs[key] * 10000)/100;
				catToAppend.sub_cats.push({_id: key, percentage: per});
			}
			catToReturn.push(catToAppend);
		}

		return catToReturn;
	}

	this.makeExam = function(course, name, data) {
		csv.parse(data, {columns:true}, function(err, output) {
			var test = makeExamHelper(output);
			db.insertTestForCourse(course, name, test);
		});
	}

	this.calculateReport = function(userId, exam, scores) {
		var cats = calculateReportHelper(exam.questions, scores);

		db.insertStudentReport(userId, exam._id, cats);

		// UPDATING TEST DB DOCUMENT FOR AGGREGATE DATA
		db.updateTestAggregateData(exam._id, scores);
		db.updateTestCount(exam._id);
	}

	this.calculateAggregate = function(){}
}

module.exports = Reports;