function visualizeRoster() {
	var examTitles = [];

	var user_ID = $("meta[name='user_id']").attr("content");
	var course_ID = $("meta[name='course_id']").attr("content");
	var postParameters = {courseID: course_ID, userID: user_ID};

	var request = new XMLHttpRequest();
	request.open('POST', '/getExams', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(postParameters));
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);
            $.each(response.exams, function(i, v) {
            	examTitles.push(v.title);
            });
        }
    }

    var request2 = new XMLHttpRequest();
	request2.open('POST', '/getRoster', true);
    request2.setRequestHeader('Content-Type', 'application/json');
    request2.send(JSON.stringify(postParameters));

    request2.onreadystatechange = function() {
        if (request2.readyState == 4 && request2.status == 200) {
            var response = JSON.parse(request2.responseText);

            $('#part2').empty();
            var table = d3.select("#part2")
            	.append("div")
            	.attr('class', 'table-responsive')
            	.append("table")
            	.attr('class', 'table-hover');

            var thead = table.append('thead')
            	.append('tr');

            thead.append('th').text('Name');
            $.each(examTitles, function(i,v) {
            	thead.append('th').text(v);
            });

            var tbody = table.append('tbody');
            $.each(response.roster, function(i,v) {
            	var trow = tbody.append('tr');
            	trow.append('td').text(v.name);
            	$.each(v.exams, function(i,v) {
            		if (v[examTitles[i]] == true)
            			trow.append('td').attr('class','y');
            		else
            			trow.append('td').append('button')
            				.attr('type', 'button')
            				.attr('class', 'btn btn-secondary-outline')
            				.append('span')
            				.attr('class', 'glyphicon glyphicon-pencil')
            				.attr('aria-hidden', 'true');
            	});

            });

            var button = d3.select("#part2")
            	.append("button")
            	.attr('type', 'button')
            	.attr('class', 'btn btn-default')
            	.attr('aria-label', 'Left Align')
            	.attr('id', 'course_report');

            button.append('span')
            	.attr('class', 'glyphicon glyphicon-download')
            	.attr('aria-hidden', 'true');

            button.append('span')
            	.attr('class', 'btn-text')
            	.text('Course Report');

        }
    }
}

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
	visualizeRoster();

    $('#user_settings').hover(
        function() {
        $('#user_banner').css('background-image', "url('images/user_banner2.gif')");
        },
        function() {
            $('#user_banner').css('background-image', "url('images/user_banner.gif')");
        }
    );
    $('#course_report').on('click', function() {
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
