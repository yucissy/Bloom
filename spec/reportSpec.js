var Report = require('../reports.js');
var report = new Report(null);

describe("Report Test Suite", function() {
	it("makes an exam in the correct format", function() {
		var input = [];
		input.push({'qid': '1', 'max_points': '4', 'blooms': '3'});
		input.push({'qid': '2', 'max_points': '2', 'blooms': '1'});
		input.push({'qid': '3', 'max_points': '5', 'blooms': '2'});
		input.push({'qid': '4', 'max_points': '4', 'blooms': '3'});
		input.push({'qid': '5', 'max_points': '4', 'blooms': '4'});

		var expected = [];
		expected.push({qid: 1, max_points: 4, categories: [{main_cat_id: 'blooms', sub_cat_id: 3}]});
		expected.push({qid: 2, max_points: 2, categories: [{main_cat_id: 'blooms', sub_cat_id: 1}]});
		expected.push({qid: 3, max_points: 5, categories: [{main_cat_id: 'blooms', sub_cat_id: 2}]});
		expected.push({qid: 4, max_points: 4, categories: [{main_cat_id: 'blooms', sub_cat_id: 3}]});
		expected.push({qid: 5, max_points: 4, categories: [{main_cat_id: 'blooms', sub_cat_id: 4}]});

		expect(report.makeExamHelper(input)).toEqual(expected);
	});
});