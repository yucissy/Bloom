var examID;
var userID;
var maxPoints = {};

function getExam(exam_ID, user_ID) {

    var user = $("meta[name='user_id']").attr("content");
    var toSend = {userID: user, examID: exam_ID};
    var request = new XMLHttpRequest();
    request.open('POST', '/getExam', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(toSend));
    request.onreadystatechange = function() {
       if (request.readyState == 4 && request.status == 200) {
            examID = exam_ID;
            userID = user_ID;
            var response = JSON.parse(request.responseText);
            var questions = response.exam.questions;
            $('#questions').empty();
            $('#questions').show();
            $.each(questions, function(i, v) {
                $('#questions').append('<div class="question">'+v.qid+'. '+'<input class="q" type="text"></input>'
                    +'/ '+v.max_points+'</div>');
                maxPoints[v.qid] = v.max_points;
            });
       } 
    }
}



$(document).ready(function() {

    //array to hold max possible points for each question
    

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

            var toSend = {userID: userID, examID: examID, scores: scores};
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
                        visualizeRoster();
                    } else {
                        $('#error').text('Something went wrong :(');
                    }
                    getScores(examID);
                }
            }
            $("#error").empty();
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

function getCourseList(current) {
    var user_ID = $("meta[name='user_id']").attr("content");
    var toSend = {userID: user_ID};
    var request = new XMLHttpRequest();
    request.open('POST', '/getCourses', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(toSend));

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);
            var courselist = response.courses;
            $('#course_list').empty();
            $.each(courselist, function(i, v) {
                if (v._id == current) {
                    $('#course_list').append("<div class='curr course'><p>"+v._id+"</p></div>");
                    $('#curr_title').text(v.title);
                } else {
                    $('#course_list').append("<p class='unselected course'>"+v._id+"</p>");
                }
            });
        }
    };
}


function getExamList(prof) {
    var user_ID = $("meta[name='user_id']").attr("content");
    var course_ID = $("meta[name='course_id']").attr("content");
    var toSend = {userID: user_ID, courseID: course_ID};
    var request = new XMLHttpRequest();
    request.open('POST', '/getExams', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(toSend));
    request.onreadystatechange = function() {
       if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);
            var examlist = response.exams;
            $('#exam_list').empty();
            $.each(examlist, function(i, v) {
                if (!prof && i == 0) {
                    $('#exam_list').append("<div class='curr exam'><p>"+v.title+"</p></div>");
                } else {
                    $('#exam_list').append("<p class='unselected exam'>"+v.title+"</p>");
                }
            });

            $("body").on("click", ".exam.unselected", function(){
                $('#exam_list').empty();
                var toSelect = $(this).text();
                $.each(examlist, function(i, v) {
                    if (v.title == toSelect) {
                        $('#exam_list').append("<div class='curr exam'><p>"+v.title+"</p></div>");
                    } else {
                        $('#exam_list').append("<p class='unselected exam'>"+v.title+"</p>");
                    }
                });

                if (prof) {
                    $("#part2").hide();
                    $("#part3").show();

                    $('#select_1').css('font-weight', 'normal');
                    $('#select_2').css('font-weight', 'bold');

                    visualizeScores(true, "professor");
                } else {
                    visualizeScores(false, "student");
                }
            });

            if (prof) {
                $("#select_1").on('click', function() {
                    $('#exam_list').empty();
                    $.each(examlist, function(i, v) {
                        $('#exam_list').append("<p class='unselected exam'>"+v.title+"</p>");
                    });
                });

                $("#select_2").on('click', function() {
                    $('#exam_list').empty();
                    $.each(examlist, function(i, v) {
                        if (i == 0) {
                            $('#exam_list').append("<div class='curr exam'><p>"+v.title+"</p></div>");
                        } else {
                            $('#exam_list').append("<p class='unselected exam'>"+v.title+"</p>");
                        }
                    });
                });
            }
        }
    };
}
