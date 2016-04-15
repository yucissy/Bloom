$(document).ready(function() {

    //dummy data
    var course_ID = 'CSCI1230';
    var user_ID = 'test_prof_1';
	//first dropdown button behavior
    $('#select_exams').on('click', function() {
		var toSend = {userID: user_ID, courseID: course_ID};
		console.log(toSend);
		var request = new XMLHttpRequest();
        request.open('POST', '/getExams', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
		  if (request.readyState == 4 && request.status == 200) 
		    var response = request.responseText;
		}
		console.log(response);


    });

    $('.s').on('click', function() {
    	$('#select_exams').html($(this).text());
    	$('#questions').show();
    });

    
});
