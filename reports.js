var csv = require('csv');
var fs = require('fs');
var csvWriter = require('csv-write-stream');

function Reports(db) {

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

	this.writeTestReportHelper = function(test, wstream, reportService) {
		wstream.write('Exam Title: ' + test.title + '\n');
		wstream.write('Number of Submitted Scores: ' + test.count + '\n\n');
		if (test.count == 0) {
			wstream.write('No data to display.\n\n');
			return;
		}
		var calc = reportService.calculateAggregate(test, reportService);
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

	this.inputScoreCsv = function(examId, data, callback) {
		var reportService = this;
		db.findTest({_id : examId}, function(exam, error) {
			if (exam == null) {
				console.error(error);
				callback('fail');
				return;
			}
			csv.parse(data, {columns:true}, function(err, output) {
				if (output == null) {
					callback('fail');
					return;
				}
				var check = output[0];
				if ('id' in check && Object.keys(check).length-1 == exam.questions.length) {
					var status = 'success';
					var countForCallback = 0;
					for (var i = 0; i < output.length; i++) {
						var currentScores = output[i];
						var studentId = currentScores.id;
						delete currentScores.id;
						reportService.calculateReport(studentId, exam, currentScores, function(stat) {
							console.log(stat);
							if (stat == 'fail') {
								status = stat;
							}
							countForCallback++;

							console.log(countForCallback);
							console.log(output.length);
							if (countForCallback == output.length - 1) {
								callback(status);
							}
						}, reportService);
					}
				} else {
					console.error('ERROR: bad csv input');
					callback('fail');
					return;
				}
			});
		});
	}

	this.inputScore = function(userId, examId, scores, callback) {
		var reportService = this;
		db.findTest({_id : examId}, function(exam) {
			if (exam == null) {
				console.error(error);
				callback('fail');
				return;
			}
			reportService.calculateReport(userId, exam, scores, callback, reportService);
		});
	}

	this.calculateReport = function(userId, exam, scores, callback, reportService) {
		var cats = reportService.calculateHelper(exam.questions, scores, 1);
		console.log(cats);
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

	this.calculateAggregate = function(exam, reportService) {
		var qs = exam.questions;
		var scores = {};
		for (var i = 0; i < qs.length; i++) {
			scores[qs[i].qid] = qs[i].sum_points;
		}

		return reportService.calculateHelper(qs, scores, exam.count);
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

	this.getReportsByStudentAndCourse = function(studentId, courseId, callback) {
		db.findTestFromCourse(courseId, function(exams, error) {
			if (exams == null) {
				callback(exams, error);
				return;
			}
			
			db.findReportForStudent(studentId, function(reports, error) {
				if (reports == null) {
					callback(reports, error);
					return;
				}

				var toReturn = [];
				for (var i = 0; i < exams.length; i++) {
					var toAppend = {test: exams[i], categories: null};
					for (var j = 0; j < reports.length; j++) {
						if (String(reports[j].test_id) == String(exams[i]._id)) {
							toAppend.categories = reports[j].categories;
							break;
						}
					}
					toReturn.push(toAppend);
				}
				callback(toReturn);
			});
		});
	}

	this.getReportByStudentAndExam = function(studentId, examId, callback) {
		db.findReport(studentId, examId, callback);
	}

	this.getAverageScore = function(examId, callback) {
		db.findTest(examId, function(exam, error) {
			if (exam == null) {
				callback(exam, error);
				return;
			}
			var avg = calculateAverageScore(exam);
			callback(avg);
		});
	}

	this.getAllAggregate = function(courseId, callback) {
		var reportService = this;
		db.findPopulatedTestFromCourse(courseId, function(tests, error) {
			if (tests == null) {
				callback(tests, error);
				return;
			}

			var toReturn = [];
			for (var i = 0; i < tests.length; i++) {
				var result = reportService.calculateAggregate(tests[i], reportService);
				toReturn.push({test: {_id: tests[i]._id,
									  title: tests[i].title,
									  count: tests[i].count}, 
							   categories: result});
			}
			callback(toReturn);
		});
	}

	this.getCumulativeReportForStudent = function(studentId, courseId, callback) {
		var calculate = this.calculateCumulativeScore;
		db.findTestFromCourse(courseId, function(tests, error) {
			if (tests == null) {
				callback(tests, error);
				return;
			}

			db.findReportForStudent(studentId, function(reports, error) {
				if (reports == null) {
					callback(reports, error);
					return;
				}

				var reportsToCalculate = [];
				for (var i = 0; i < reports.length; i++) {
					var flag = false;
					for (var j = 0; j < tests.length; j++) {
						if (String(reports[i].test_id) == String(tests[j]._id)) {
							flag = true;
							break;
						}
					}
					if (flag) {
						reportsToCalculate.push(reports[i]);
					}
				}
				var toReturn = calculate(reportsToCalculate);
				callback(toReturn);
			});
		});
	}

	// a text file!!!
	// course name
	// test name, test avg score, test avg categories score
	this.downloadCourseData = function(course, callback) {
		var reportService = this;
		db.findPopulatedTestFromCourse(course, function(tests, error) {
			if (tests == null) {
				callback(tests, error);
				return;
			}

			var date = Date.now();
			var filePath = "./local_storage/" + course + "_" + date + ".txt";

			var wstream = fs.createWriteStream(filePath);
			wstream.write('Report Generated On: ' + (new Date(date)).toString() + '\n');
			wstream.write('Course: ' + course + '\n\n');
			for (var i=0; i < tests.length; i++) {
				wstream.write('-------------------------\n');
				reportService.writeTestReportHelper(tests[i], wstream, reportService);
			}
			wstream.end();
			wstream.on('finish', function() {
				callback(filePath);
			});
		});
	}

	// should check if everyone submitted before generating this
	this.downloadPublicData = function(examId, callback) {
		var reportService = this;
		db.findTest(examId, function(test, error) {
			if (test == null) {
				callback(test, error);
				return;
			}

			var date = Date.now();
			var filePath = "./local_storage/" + test._id + "_PUBLIC_" + date + ".txt";

			var wstream = fs.createWriteStream(filePath);
			wstream.write('Report Generated On: ' + (new Date(date)).toString() + '\n');
			reportService.writeTestReportHelper(test, wstream, reportService);
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
		});
	}

	// a csv file!!!
	// student bloom0 bloom1 bloom2 ...
	this.downloadExamData = function(test, callback) {
		db.findReportForTest(exam, function(reports, error){
			if (reports == null) {
				callback(reports, error);
				return;
			}
			
			if (rts.length == 0) {
				console.error('Should not be called. No reports to download.');
			} else {
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
		});
	}

	this.checkIfAllReportsReady = function(courseId, examId, callback) {
		db.getStudentsAndTestsFromCourse(courseId, function(students, t) {
			if (students == null) {
				console.error(t);
				callback("false");
				return;
			}

			db.findTest(examId, function(test, error) {
				if (test == null) {
					console.error(error);
					callback("false");
					return;
				}
				var ready = "false";
				if (students.length == test.count) {
					ready = "true";
				}
				callback(ready);
			});
		});
	}
}

module.exports = Reports;
