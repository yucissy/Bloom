
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
            console.log(toSend);
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

    });

});
