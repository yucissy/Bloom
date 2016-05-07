

$(document).ready(function() {

    //array to hold max possible points for each question
    var maxPoints = {};
    var examID;

    function getExam(id) {

        
        var user_ID = $("meta[name='user_id']").attr("content");
        var toSend = {userID: user_ID, examID: id};
        var request = new XMLHttpRequest();
        request.open('POST', '/getExam', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
           if (request.readyState == 4 && request.status == 200) {
                examID = id;
                var response = JSON.parse(request.responseText);
                var questions = response.exam.questions;
                $('#questions').empty();
                $.each(questions, function(i, v) {
                    $('#questions').append('<div class="question">'+v.qid+'. '+'<input class="q" type="text"></input>'
                        +'/ '+v.max_points+'</div>');
                    maxPoints[v.qid] = v.max_points;
                });
           } 
        }
    }

    function getScores(exam_ID) {
    	var user_ID = $("meta[name='user_id']").attr("content");
        var toSend = {userID: user_ID, examID: exam_ID};

        var request = new XMLHttpRequest();
        request.open('POST', '/getScores', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
 
           if (request.readyState == 4 && request.status == 200) {
                var response = JSON.parse(request.responseText);
            } 
        }
    }

	//first dropdown button behavior
    $('#select_exams').on('click', function() {
    	var course_ID = $("meta[name='course_id']").attr("content");
    	var user_ID = $("meta[name='user_id']").attr("content");
		var toSend = {userID: user_ID, courseID: course_ID};

		var request = new XMLHttpRequest();
        request.open('POST', '/getPendingExams', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
		  if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);   
            $('#exams_list').empty();
            $.each(response.exams, function(i, v) {

                var name = v.title;
                var id = v._id;
                var listElement = $('<li><a href="#" id="'+id+
                    '">'+name+'</a></li>');
                $("#exams_list").append(listElement);
                listElement.on('click', function(e) {

                    $("#select_exams").empty();
                    $('#select_exams').html($(this).text());
                    getExam(id);
                    $('#questions').show();
                });
            });
          }

		}

        return true;
    });

    $('#user_settings').hover(
        function() {
        $('#user_banner').css('background-image', "url('images/user_banner2.gif')");
        },
        function() {
            $('#user_banner').css('background-image', "url('images/user_banner.gif')");
        }
    );

    $("#submit").on('click', function() {
        var scores = [];
        var valid = true;
        var num = 1;

        $('.q').each(function() {
            var val = parseFloat($(this).val());
            if (!isNaN(val) && val <= parseFloat(maxPoints[num]) && val >= 0)
                scores[num] = val;
            else
                valid = false;
            num++;
        });
        if (valid) {
        	var user_ID = $("meta[name='user_id']").attr("content");
            var toSend = {userID: user_ID, examID: examID, scores: scores};
            var request = new XMLHttpRequest();
            request.open('POST', '/sendScores', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));
            request.onreadystatechange = function() {
               if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
 
                    if (response.status == 'success') {
                    	$("#error").empty();
                        $('#newExam1').modal('hide');
                        visualizeScores(false);
                    } else {
                        $('#error').text('Something went wrong :(');
                    }
                    getScores(examID);
                }
            }
            $("#questions").empty();
            $("#exams_list").empty();
            $('#select_exams').html("None");        
        } else {
            $("#error").empty();
            $("#error").append("<p>Oops. Did you forget to fill out "+
            "a score?</p>");
        }
    });

    $(".closebut").on('click', function() {
        $("#questions").empty();
        $("#exams_list").empty();
        $('#select_exams').html("None");

    });

   
});
