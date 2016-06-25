var csv = require('csv');
var fs = require('fs');
var csvWriter = require('csv-write-stream');

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

	this.calculateHelper = function(questions, scores, count) {
		var catToReturn = [];

		// loop thru each category
		for (var i = 0; i < questions[0].categories.length; i++) {
			var catToAppend = {main_cat_id: questions[0].categories[i].main_cat_id, sub_cats: []};
			var numQs = {};
			var totalPer = {};
			// for each question, add score and increment number of Q for the sub category it belongs to
			for (var j = 0; j < questions.length; j++) {
				var qid = questions[j].qid;
				var fullPoints = questions[j].max_points;
				var subCat = questions[j].categories[i].sub_cat_id;
				numQs[subCat] = (numQs[subCat] || 0) + 1;
				totalPer[subCat] = (totalPer[subCat] || 0) + (scores[qid] / (fullPoints*count));
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

	this.writeTestReportHelper = function(test, wstream) {
		wstream.write('Test: ' + test.title + '\n');
		wstream.write('Number of Submitted Test Scores: ' + test.count + '\n\n');
		var calc = this.calculateAggregate(test);
		for (var k=0; k < calc.length; k++) {
			wstream.write('Category: ' + calc[k].main_cat_id.name + '\n');
			for (var j=0; j < calc[k].sub_cats.length; j++) {
				var index = calc[k].sub_cats[j]._id;
				wstream.write(index + ' ');
				wstream.write(calc[k].main_cat_id.sub_categories[index] + ': ');
				wstream.write(calc[k].sub_cats[j].percentage + '%\n');
			}
			wstream.write('\n');
		}
		var avg = this.calculateAverageScore(test);
		wstream.write('Average Raw Score: ' + avg + "%\n\n");
	}

	this.makeExam = function(course, name, data, callback) {
		var make = this.makeExamHelper;
		csv.parse(data, {columns:true}, function(err, output) {
			var check = output[0];
			if ('qid' in check && 'max_points' in check && 'blooms' in check) {
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
					var test = make(output);
					db.insertTestForCourse(course, name, test, function(error){
						if (error != null) {
							console.log(error);
							callback('fail');
						} else {
							callback('success');
						}
					});
				}
				else {
					console.log('ERROR: bad csv input, check for proper values');
				}
			} else {
				console.error('ERROR: bad csv input');
				//error
			}
		});
	}

	this.calculateReport = function(userId, exam, scores, callback) {
		var cats = this.calculateHelper(exam.questions, scores, 1);

		db.insertStudentReport(userId, exam._id, cats, function(error) {
            if (error != null) {
                console.log(error);
                callback('fail');
            } else {
            	callback('success');
            }
        });

		// UPDATING TEST DB DOCUMENT FOR AGGREGATE DATA
		db.updateTestAggregateData(exam._id, scores, function(error) {
            if (error != null)
                console.log(error);
        });
		db.updateTestCount(exam._id, function(error) {
            if (error != null)
                console.log(error);
        });
	}

	this.calculateAggregate = function(exam) {
		var qs = exam.questions;
		var scores = {};
		for (var i = 0; i < qs.length; i++) {
			scores[qs[i].qid] = qs[i].sum_points;
		}

		return this.calculateHelper(qs, scores, exam.count);
	}

	this.calculateAverageScore = function(exam) {
		var qs = exam.questions;
		var c = exam.count;
		var total = 0;
		var points = 0;
		for (var i=0; i < qs.length; i++) {
			total += qs[i].max_points * c;
			points += qs[i].sum_points;
		}

		return Math.round(points / total * 10000)/100;
	}

	this.calculateCumulativeScore = function(reports) {
		var catTotalAndCount = {};

		for (var i = 0; i < reports.length; i++) {
			for (var k = 0; k < reports[i].categories.length; k++) {
				var category = reports[i].categories[k].main_cat_id;
				catTotalAndCount[category.id] = catTotalAndCount[category.id] 
					|| {mainCat: category, count: 0, subCats: []};
				catTotalAndCount[category.id].count++;

				for (var j = 0; j < reports[i].categories[k].sub_cats.length; j++) {
					catTotalAndCount[category.id].subCats[j] = (catTotalAndCount[category.id].subCats[j] || 0)
						+ reports[i].categories[k].sub_cats[j].percentage;
				}
			}
		}

		var catToReturn = [];

		for (var catId in catTotalAndCount) {
			var catToAppend = {main_cat_id: catTotalAndCount[catId].mainCat, sub_cats: []};
			var currentCategory = catTotalAndCount[catId];
			for (var k = 0; k < currentCategory.subCats.length; k++) {
				var cumulativePer = Math.round(currentCategory.subCats[k] / currentCategory.count * 100)/100;
				catToAppend.sub_cats.push({_id: k, percentage: cumulativePer});
			}
			catToReturn.push(catToAppend);
		}

		return catToReturn;
	}

	// a text file!!!
	// course name
	// test name, test avg score, test avg categories score
	this.downloadCourseData = function(course, tests, callback) {
		var date = Date.now();
		var filePath = "./local_storage/" + course + "_" + date + ".txt";

		var wstream = fs.createWriteStream(filePath);
		wstream.write('Report Generated On: ' + (new Date(date)).toString() + '\n');
		wstream.write('Course: ' + course + '\n\n');
		for (var i=0; i < tests.length; i++) {
			wstream.write('-------------------------\n');
			this.writeTestReportHelper(tests[i], wstream);
		}
		wstream.end();
		wstream.on('finish', function() {
			callback(filePath);
		});
	}

	// should check if everyone submitted before generating this
	this.downloadPublicData = function(test, callback) {
		var date = Date.now();
		var filePath = "./local_storage/" + test._id + "_PUBLIC_" + date + ".txt";

		var wstream = fs.createWriteStream(filePath);
		wstream.write('Report Generated On: ' + (new Date(date)).toString() + '\n');
		this.writeTestReportHelper(test, wstream);
		wstream.write('Question Breakdown\n');
		var qs = test.questions;
		for (var i=0; i < qs.length; i++) {
			var pt = qs[i].sum_points;
			var total = test.count * qs[i].max_points;
			wstream.write(qs[i].qid + ':' + Math.round(pt/total * 10000)/100 + '%\n');
		}
		wstream.end();
		wstream.on('finish', function() {
			callback(filePath);
		});
	}

	// a csv file!!!
	// student bloom0 bloom1 bloom2 ...
	this.downloadExamData = function(test, reports, callback) {
		var date = Date.now();
		var filePath = "./local_storage/" + test + "_" + date + ".csv";

		var hdr = ["student_id", "student_name"];
		var sample_cats = reports[0].categories;
		for (var i=0; i < sample_cats.length; i++) {
			var cat = sample_cats[i].main_cat_id;
			for (var c=0; c < cat.sub_categories.length; c++) {
				hdr.push(cat._id + "_" + c);
			}
		}

		var writer = csvWriter({ headers: hdr});
		var wstream = fs.createWriteStream(filePath);
		writer.pipe(wstream);

		for (var j=0; j < reports.length; j++) {
			var toWrite = [];
			toWrite.push(reports[j].student_id._id);
			toWrite.push(reports[j].student_id.name);
			var cats = reports[j].categories;
			var count = 2;
			for (var k=0; k < cats.length; k++) {
				for (var m=0; m < cats[k].sub_cats.length; m++) {
					var number = parseInt(hdr[count].substr(hdr[count].length-1));
					if (number == m) {
						toWrite.push(cats[k].sub_cats[m].percentage);
					} else {
						toWrite.push('-');
					}
					count++;
				}
			}
			writer.write(toWrite);
		}
		writer.end();
		wstream.on('finish', function() {
			callback(filePath);
		});
	}
}

module.exports = Reports;
