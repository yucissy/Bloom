
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
    	var postParameters = {courseID: course_ID, userID: user_ID};

    	var request = new XMLHttpRequest();
    	request.open('POST', '/downloadAggregate', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(postParameters));

    });

    $('#part3').on( 'click', '.exam-report', function() {
    	var exam_ID = $(this).attr('id');
    	var user_ID = $("meta[name='user_id']").attr("content");
    	var postParameters = {examID: exam_ID, userID: user_ID};

 		var request = new XMLHttpRequest();
    	request.open('POST', '/downloadExamData', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(postParameters));
    });

});
