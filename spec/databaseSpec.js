var Database = require('../database.js');
var database = new Database();

describe("Database Test Suite", function() {
    //test only if not in database
	/*it("inserts a document (user)", function(done) {
		var _id = "B0123Test";
        var name = "unitTest";
        var email = "unitEmail";
        var type = "Student";

        database.insertUser(_id, name, email, type, function(user) {
            expect(user.id).toEqual(_id);
            done();
        });       
	}); */

    it("finds a user", function(done) {
        var email = "unitEmail";

        database.getUID(email, function(id) {
            expect(id).toEqual("B0123Test");
            done();
        });
    });

    it("finds a user - fail", function(done) {
        var email = "blah";

        database.getUID(email, function(id) {
            expect(id).toEqual(jasmine.any(String));
            done();
        });
    });

    it("finds a report for a user", function(done) {
        var user_id = "B00111111";

        database.findReportForStudent(user_id, function(reports) {
            expect(reports).not.toEqual([]); //should have a report
            done();
        });
    });

    it("finds a report for a user - bad user", function(done) {
        var user_id = "blah";

        database.findReportForStudent(user_id, function(reports) {
            expect(reports).toEqual([]); 
            done();
        });
    });

    it("determines if the user is a student", function(done) {
        var email = "unitEmail";

        database.isUserStudent(email, function(bool, user) {
            expect(bool).toEqual(true);
            done();
        });
    });

    it("determines if the user is a student - bad email", function(done) {
        var email = "unitEmail!";

        database.isUserStudent(email, function(bool, user) {
            expect(bool).toEqual(jasmine.any(String));
            done();
        });
    });

    it("finds test from a course", function(done) {
        var course_id = "CSCI1320";

        database.findTestFromCourse(course_id, function(tests) {
            expect(tests).not.toEqual(jasmine.any(String)); //a string would be an error message.
            done();
        });
    });

    it("finds test from a course - bad course id", function(done) {
        var course_id = "CSCI1320!";

        database.findTestFromCourse(course_id, function(tests) {
            expect(tests).toEqual(jasmine.any(String)); //a string would be an error message.
            done();
        });
    });

    it("finds populated test from a course", function(done) {
        var course_id = "CSCI1320";

        database.findPopulatedTestFromCourse(course_id, function(tests) {
            expect(tests).not.toEqual(jasmine.any(String)); 
            done();
        });
    });

    it("finds populated test from a course - bad course id", function(done) {
        var course_id = "CSCI1320!";

        database.findPopulatedTestFromCourse(course_id, function(tests) {
            expect(tests).toEqual(jasmine.any(String)); 
            done();
        });
    });


    it("finds students + tests from a course", function(done) {
        var course_id = "CSCI1320";

        database.getStudentsAndTestsFromCourse(course_id, function(students, tests) {
            expect(students).not.toEqual(jasmine.any(String)); //a string message would be here
            expect(tests).not.toEqual(null);  //and a null value would be here if there was an error
            done();
        });
    });

    it("finds students + tests from a course - bad course id", function(done) {
        var course_id = "CSCI1320!";

        database.getStudentsAndTestsFromCourse(course_id, function(students, tests) {
            expect(students).toEqual(jasmine.any(String)); //a string message would be here
            expect(tests).toEqual(null);  //and a null value would be here if there was an error
            done();
        });
    });

    it("finds a test with a testId", function(done) {
        var test_id = "5730c484f1a94d4245c40c76";

        database.findTest(test_id, function(test) {
            expect(test).not.toEqual(jasmine.any(String));
            done();
        });
    });

    it("finds a test with a testId - bad test_id", function(done) {
        var test_id = "5730c484f1a94d4245c40c76!";

        database.findTest(test_id, function(test) {
            expect(test).toEqual(jasmine.any(String));
            done();
        });
    });

    it("finds reports for a test", function(done) {
        var test_id = "5730c484f1a94d4245c40c76";

        database.findReportForTest(test_id, function(reports) {
            expect(reports).not.toEqual(jasmine.any(String)); 
            done();
        });
    });

    it("finds reports for a test - bad test_id", function(done) {
        var test_id = "5730c484f1a94d4245c40c76!";

        database.findReportForTest(test_id, function(reports) {
            expect(reports).toEqual(jasmine.any(String)); 
            done();
        });
    });

    it("find a report with a given user id and test id", function(done) {
        var test_id = "5730c484f1a94d4245c40c76";
        var student_id = "B00111111";

        database.findReport(student_id, test_id, function(report) {
            expect(report).not.toEqual(jasmine.any(String)); 
            done();
        });
    });    

    it("find a report with a given user id and test id - bad data", function(done) {
        var test_id = "5730c484f1a94d4245c40c76";
        var student_id = "B00111111!";

        database.findReport(student_id, test_id, function(report) {
            expect(report).toEqual(jasmine.any(String)); 
            done();
        });
    });
});
