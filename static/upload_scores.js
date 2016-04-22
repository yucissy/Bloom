

$(document).ready(function() {

    //dummy data
    var course_ID = 'CSCI1230';
    var user_ID = 'B0004567';

    //array to hold max possible points for each question
    var maxPoints = {};
    var examID;

    function getExam(id) {
        console.log(id);
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
                console.log(questions);
                $.each(questions, function(i, v) {
                    $('#questions').append('<div class="question">'+v.qid+'. '+'<input class="q" type="text"></input>'
                        +'/ '+v.max_points+'</div>');
                    maxPoints[v.qid] = v.max_points;
                });
           } 
        }
    }

	//first dropdown button behavior
    $('#select_exams').on('click', function() {
		var toSend = {userID: user_ID, courseID: course_ID};
		console.log(toSend);
		var request = new XMLHttpRequest();
        request.open('POST', '/getExams', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
		  if (request.readyState == 4 && request.status == 200) {

            var response = JSON.parse(request.responseText);
            console.log(response);
            console.log(response.exams);   
            $('#exams_list').empty();
            $.each(response.exams, function(i, v) {

                var name = v.title;
                var id = v._id;
                var listElement = $("#exams_list").append('<li><a href="#" id="'+id+
                    '">'+name+'</a></li>');
                listElement.on('click', function(e) {
                    console.log('click');
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
            var val = $(this).val();
            if (val != "" && val <= maxPoints[num])
                scores[num] = parseInt(val);
            else
                valid = false;
            num++;
        });
        if (valid) {
            var toSend = {userID: user_ID, examID: examID, scores: scores};
            console.log(toSend);
            var request = new XMLHttpRequest();
            request.open('POST', '/sendScores', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));
            request.onreadystatechange = function() {
               if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    console.log(response);
                } 
            }
        } else {
            $("#error").empty();
            $("#error").append("<p>Oops. Did you forget to fill out "+
            "a score?</p>");
        }
    });

});
