var examID;
var userID;
var maxPoints = {};

function getExam(exam_ID, user_ID) {

    var user = $("meta[name='user_id']").attr("content");
    var toSend = {userID: user, examID: exam_ID};
    var request = new XMLHttpRequest();
    request.open('POST', '/getExamById', true);
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
                $('#questions').append('<div class="question">'+v.qid+'. '+'<input class="q" id="'+v.qid+'" type="text"></input>'
                    +'/ '+v.max_points+'</div>');
                maxPoints[v.qid] = v.max_points;
            });
       } 
    }
}

function getCategoryColor(percent) {
  if (percent > 80)
    return "#009247";
  if (percent > 60)
    return "#86D500";
  if (percent > 40)
    return "#FFE200";
  if (percent > 20)
    return "#FF7A05";
  return "#f24f4f";
}

function getStudyTips(userID, categoryID) {
    var request = new XMLHttpRequest();
    var toSend = {userID: userID, categoryID: categoryID};
    var response = "error";
    
    request.open('POST', '/getStudyTipsForCategory', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(toSend));

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            response = JSON.parse(request.responseText);
        }
    };

    return response;
}

function visualizeAreas() {
    var user_ID = $("meta[name='user_id']").attr("content");
    var course_ID = $("meta[name='course_id']").attr("content");
    var toSend = {userID: user_ID, courseID: course_ID};

    var request = new XMLHttpRequest();
    request.open('POST', '/getCumulativeReportForStudent', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(toSend));

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);

            var listDiv = d3.select("#part2");

            $("#part2").empty();

            if (response.cumulative.length == 0) {
                d3.select("#part2")
                    .append("p")
                    .text("No areas to show yet.");
            }

            $.each(response.cumulative, function(index, object) {   
                listDiv.append("h2")
                    .text(object.main_cat_id.name.toUpperCase());

                var studyTips = JSON.parse($.ajax({
                        type: "POST",
                        url: '/getStudyTipsForCategory',
                        data: {userID: user_ID, categoryID: object.main_cat_id._id},
                        async: false
                    }).responseText).studyTips;

                $.each(object.sub_cats, function(index, sub_cat) {
                    var listRow = listDiv.append("div")
                        .attr('class', 'category_row');

                    listRow.append("div")
                        .attr('class', 'category_name')
                        .text(object.main_cat_id.sub_categories[index]);

                    listRow.append("div")
                        .attr('class', 'category_score')
                        .text(sub_cat.percentage + ' %')
                        .style('background-color', getCategoryColor(sub_cat.percentage));

                    listRow.append("div")
                        .attr('class', 'more')
                        .text(' ? ')
                        .style('border', '2px solid ' + getCategoryColor(sub_cat.percentage))
                        .on('click', function() {
                            if ($(this).siblings('.studyTips').length > 0) {
                                console.log('siblings');
                                console.log($(this).siblings('.studyTips'));
                                var that = d3.select(this.parentNode.childNodes[3]);
                                that.transition()
                                    .duration(1000)
                                    .style('color', 'lightgrey')
                                    .style('opacity', '0')
                                    .style('height', '0px')
                                    .style('padding', '0px')
                                    .style('margin', '0px');

                                var tips = $(this).siblings('.studyTips');
                                
                                setInterval(function() { tips.remove();}, 1000);

                            } else {
                                d3.select(this.parentNode)
                                    .append("div")
                                    .attr('class', 'studyTips')
                                    .style('border', '2px solid ' + getCategoryColor(sub_cat.percentage))                                   
                                    .style('height', '0px')
                                    .style('padding', '0px')
                                    .style('opacity', '0')
                                    .text('STUDY TIP: '+studyTips[index])
                                    .style('color', 'white')
                                    .style('margin', '0px')
                                    .transition()
                                    .duration(1000)
                                    .style('padding', '20px')
                                    .style('color', 'black')
                                    .style('height', '100%')
                                    .style('margin', '20px')
                                    .style('opacity', '1');
                                    
                            }
                        });

                    listDiv.append("hr")
                        .style('border-color', '#e0e0de')
                        .style('border-width', '3px')
                        .style('margin', '0px');
                });
    

            });

                
            $('.more').hover(function() {
                console.log($(this).siblings());
                $(this).siblings('.category_name').css('background-color', 'white');
                $(this).siblings('.category_name').css('color', '#4D4D4D');
                $(this).parent().css('background-color', 'lightgrey');
            }, function() {
                $(this).siblings('.category_name').css('background-color', '#4D4D4D');
                $(this).siblings('.category_name').css('color', 'white');
                $(this).parent().css('background-color', 'initial');
            }
            );
        } 
    }
}

$(document).ready(function() {

    //array to hold max possible points for each question
    

    function getScores(exam_ID) {
    	var user_ID = $("meta[name='user_id']").attr("content");
        var toSend = {userID: user_ID, examID: exam_ID};

        var request = new XMLHttpRequest();
        request.open('POST', '/getScoreReportForExam', true);
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

    $('#part3').on( 'click', '.exam-report', function() {
    	var exam_ID = $(this).attr('id');
    	var user_ID = $("meta[name='user_id']").attr("content");

        $form = $('<form action="/downloadPublicData" method="POST"></form>');
        $form.append("<input type='hidden' name='examID' value='"+exam_ID+"'/>");
        $form.append("<input type='hidden' name='userID' value='"+user_ID+"'/>");
        $form.submit();
    });

    $("#submit").on('click', function() {
        var scores = {};
        var valid = true;

        $('.q').each(function() {
            var val = parseFloat($(this).val());
            var qid = $(this).attr('id');
            if (!isNaN(val) && val <= parseFloat(maxPoints[qid]) && val >= 0)
                scores[qid] = val;
            else
                valid = false;
        });
        if (valid) {

            var toSend = {userID: userID, examID: examID, scores: scores};
            var request = new XMLHttpRequest();
            request.open('POST', '/submitStudentScoresForExam', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));
            request.onreadystatechange = function() {
               if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
 
                    if (response.status == 'success') {
                    	$("#error").empty();
                        $('#newExam1').modal('hide');
                        var user = $("meta[name='user_id']").attr("content");
                        visualizeScores(false, user);
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
    request.open('POST', '/getCoursesForUser', true);
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
    request.open('POST', '/getExamListForCourse', true);
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
        }
    };
}
