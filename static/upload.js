
$(function() {
    $("#upload").click(function(e) {

    	var course_ID = $("meta[name='course_id']").attr("content");
    	var input = e.target;
        var examName = $("#title").val()
    	var selected = $("#categories").get(0).files[0];

    	var reader = new FileReader();
    	reader.onload = function() {

    		//this variable holds the csv data!
    		var dataURL = reader.result;
            var toSend = {courseID: course_ID, exam: examName, data: dataURL};

            var request = new XMLHttpRequest();
            request.open('POST', '/sendExam', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));

            request.onreadystatechange = function() {
                if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    if (response.status == 'success') {
                        $('#myModal').modal('hide');
                    } else {
                        $('#modal-alert').text('Something went wrong :(');
                    }
                }
            }
    	};
    	reader.readAsText(selected);
	});
});
$(document).ready(function() {
    $('#user_settings').hover(
        function() {
        $('#user_banner').css('background-image', "url('images/user_banner2.gif')");
        },
        function() {
            $('#user_banner').css('background-image', "url('images/user_banner.gif')");
        }
    );
    $('#course_report').on('click', function() {
    	console.log("course report");
    	var user_ID = $("meta[name='user_id']").attr("content");
    	var course_ID = $("meta[name='course_id']").attr("content");

    	$('#course-report-form').append("<input type='hidden' name='courseID' value='"+course_ID+"'/>");
        $('#course-report-form').append("<input type='hidden' name='userID' value='"+user_ID+"'/>");
        $('#course-report-form').submit();

    });

    $('#part3').on( 'click', '.exam-report', function() {
    	var exam_ID = $(this).attr('id');
    	var user_ID = $("meta[name='user_id']").attr("content");

        $form = $('<form action="/downloadExamData" method="POST"></form>');
        $form.append("<input type='hidden' name='examID' value='"+exam_ID+"'/>");
        $form.append("<input type='hidden' name='userID' value='"+user_ID+"'/>");
        $form.submit();
    });

});

function getExamList() {
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
                if (i == 0) {
                    $('#exam_list').append("<div class='curr exam'><p>"+v.title+"</p></div>");
                } else {
                    $('#exam_list').append("<p class='unselected course'>"+v.title+"</p>");
                }
            });

            $("body").on("click", ".course.unselected", function(){
                $('#exam_list').empty();
                var toSelect = $(this).text();
                $.each(examlist, function(i, v) {
                    if (v.title == toSelect) {
                        $('#exam_list').append("<div class='curr exam'><p>"+v.title+"</p></div>");
                    } else {
                        $('#exam_list').append("<p class='unselected course'>"+v.title+"</p>");
                    }
                });
                $("#part2").hide();
                $("#part3").show();
                visualizeScores(true);
            });
       }
    };
}
