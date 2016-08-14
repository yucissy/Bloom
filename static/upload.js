var subCatId = 0;
var examID;

function inputScores(id, studentID) {
	getExam(id, studentID);
	$('#newExam1').modal('show');
}

function visualizeRoster() {
	var examTitles = [];

	var user_ID = $("meta[name='user_id']").attr("content");
	var course_ID = $("meta[name='course_id']").attr("content");
	var postParameters = {courseID: course_ID, userID: user_ID};

	var request = new XMLHttpRequest();
	request.open('POST', '/getExamListForCourse', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(postParameters));
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);
            console.log(response);
            $.each(response.exams, function(i, v) {
            	examTitles.push({title: v.title, id: v._id});
            });
        }
    }

    var request2 = new XMLHttpRequest();
	request2.open('POST', '/getRosterForCourse', true);
    request2.setRequestHeader('Content-Type', 'application/json');
    request2.send(JSON.stringify(postParameters));

    request2.onreadystatechange = function() {
        if (request2.readyState == 4 && request2.status == 200) {
            var response = JSON.parse(request2.responseText);
            console.log(response);
            $('#part2').empty();
            var table = d3.select("#part2")
            	.append("div")
            	.attr('class', 'table-responsive')
            	.append("table")
            	.attr('class', 'table-hover')
                .attr('id', 'roster');

            var thead = table.append('thead')
            	.append('tr');

            thead.append('th').text('Name');
            $.each(examTitles, function(i,v) {
            	thead.append('th').text(v.title)
            		.attr('id', v.id);
            });

            var tbody = table.append('tbody');
            $.each(response.roster, function(i,v) {
            	var trow = tbody.append('tr').attr('id', v._id);

                var studentID = v._id;
                var studentName = v.name;

            	// append the student name as first td, and set its hover & click behavior
                // HOVER: the row changes color to indicate possible click
                // CLICK: shows the professor that student's exam scores
                var studentNameTd = trow.append('td')
                                    .text(studentName)
                                    .attr('class', 'student-name-td')
                                    .on('mouseover', function() {
                                        $(this).siblings().css('background-color', '#f2ed98');
                                        $(this).css('background-color', 'gold');
                                    })
                                    .on('mouseout', function() {
                                        $(this).siblings().css('background-color', 'white');
                                        $(this).css('background-color', 'white');
                                    })
                                    .on('click', function() {
                                        flipCard(studentID, studentName, true);
                                    });


            	
            	$.each(v.exams, function(i,v) {
            		if (v[examTitles[i].title] == true)
            			trow.append('td').attr('class','y');
            		else
            			trow.append('td').append('button')
            				.attr('type', 'button')
            				.attr('class', 'btn btn-secondary-outline')
            				.on('click', function() {
            					
            					var index = $(this).closest('td').index();
            					var examID = $('th').eq(index).attr('id');
            					var examTitle = $('th').eq(index).html();
            					$('#submitLine').empty();
            					$('#submitLine').html('Submit '+studentName+"'s scores:");
            					$('#exam-title').html(examTitle);
            					inputScores(examID, studentID);
            				})
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


            $('#course_report').on('click', function() {
                var user_ID = $("meta[name='user_id']").attr("content");
                var course_ID = $("meta[name='course_id']").attr("content");
                $form = $('<form action="/downloadAggregate" method="POST"></form>');
                $form.append("<input type='hidden' name='courseID' value='"+course_ID+"'/>");
                $form.append("<input type='hidden' name='userID' value='"+user_ID+"'/>");
                $form.submit();

            });
        }
    }
}

// Flips the main visualization card so the professor sees student name & list of exams with results
// BACK button returns to student roster
function flipCard(nStudentID, sStudentName, bFrontBack) {

    var toggleVisibility = function(e) {
        if (e.css('visibility') == 'hidden') {
            e.css('visibility', 'visible');
        } else {
            e.css('visibility', 'hidden');
        }
    } 

    toggleVisibility($('.back'));
    toggleVisibility($('.front'));

    $('#main_content').flip(bFrontBack);

    // If the card has just been flipped to visualize a student's scores
    // Populate the card with that student's exam data
    if (bFrontBack == true) {
        $('#part4-student-name').html(sStudentName);
        visualizeScores(false, nStudentID, '#part5');
    }
}

function addSubCatInput() {
    $("#newSubCat").remove();
    $('#lastName').removeAttr('id', 'lastName');
    $('.lastTip').removeClass('lastTip');
    subCatId += 1;
    var subcatTable = d3.select('#subcats');
    var subcatRow = subcatTable.append('tr');
    subcatRow.append('td')
        .text(subCatId);
    subcatRow.append('td')
        .append('input')
        .attr('type', 'text')
        .attr('name', 'tip')
        .attr('id', 'lastName')
        .attr('placeholder', 'e.g. Remembering')
        .attr('class', 'subcatName');
    var lastTipTd = subcatRow.append('td');

    lastTipTd.append('input')
        .attr('type', 'text')
        .attr('name', 'tip')
        .attr('class', 'lastTip tipName')
        .attr('placeholder', 'e.g. Make flashcards.')
        .on('keydown', function() {
            listenForTabPress(d3.event, $(this));
        })
    lastTipTd.append('a')
        .attr('href', '#')
        .attr('id', 'newSubCat')
        .append('span')
        .attr('class', 'glyphicon glyphicon-plus')
        .on('click', function() {
            addSubCatInput();
        });
    $('#lastName').focus();

}

function areWordsDistinct(wordArray) {
    var newArray = [];
    var found = false;
    $.each(wordArray, function(i, v) {
        if ($.inArray(v, newArray) != -1) {
            found = true;
            return false;
        }
        newArray.push(v);
    });
    return !found;
}

function areWordsBlank(wordArray) {
    var seenBlanks = false;
    var blanksInArray = false;
    $.each(wordArray, function(i, v) {
        if (v == '') {
            seenBlanks = true;
        } else if (seenBlanks) {
            blanksInArray = true;
            return true;
        }
    });
    return blanksInArray;
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
            console.log(dataURL);
            console.log(dataURL[0]);
            var toSend = {courseID: course_ID, exam: examName, data: dataURL};

            var request = new XMLHttpRequest();
            request.open('POST', '/makeNewExam', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));

            request.onreadystatechange = function() {
                if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    if (response.status == 'success') {
                        $('#newExamError').empty();
                        $('#myModal').modal('hide');
                        visualizeRoster();
                        var user = $("meta[name='user_id']").attr("content");
                        visualizeScores(true, user, '#part3');
                        getExamList(true);
                    } else {
                        $('#newExamError').text('Something went wrong. Please check that the .csv is formatted correctly.');
                    }
                }
            } 
    	};
        if (selected == null) {
            $('#newExamError').text('No file uploaded.');
        } else if (examName == '') {
            $('#newExamError').text('Please enter an exam name.');
        }
        else {
            $('#newExamError').empty();
            reader.readAsText(selected);
        }
	});

    $('#uploadScoresAggregate').click(function(e) {
        var user_ID = $("meta[name='user_id']").attr("content");
        var exam_ID = examID;
        var selected = $("#aggregate-scores-file").get(0).files[0];

        var reader = new FileReader();
        reader.onload = function() {

            //this variable holds the csv data!
            var dataURL = reader.result;
   
            var toSend = {userID: user_ID, examID: exam_ID, data: dataURL};
            console.log(toSend);

            var request = new XMLHttpRequest();
            request.open('POST', '/submitStudentScoreListCsvForExam', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));

            request.onreadystatechange = function() {
                if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    if (response.status == 'success') {
                        $('#submitAggError').empty();
                        $('#submitScoresAggregate').modal('hide');
                        visualizeRoster();
                        var user = $("meta[name='user_id']").attr("content");
                        visualizeScores(true, user, '#part3');
                        getExamList(true);
                    } else {
                        $('#submitAggError').text('Something went wrong. Please check that the .csv is formatted correctly.');
                    }
                }
            } 
        };
        if (selected == null) {
            $('#submitAggError').text('No file uploaded.');
        }
        else {
            $('#submitAggError').empty();
            reader.readAsText(selected);
        }
    });

	$('#upload-course').click(function(e) {

		var user_ID = $("meta[name='user_id']").attr("content");
		var course_ID = $("#course-id").val();
		var course_title = $("#course-title").val();
        var sem = $("#semester-level").val();
        var selected = $("#roster-file").get(0).files[0];

    	//TODO: null check all input
    	var reader = new FileReader();
    	reader.onload = function() {

    		//this variable holds the csv data!
    		var dataURL = reader.result;
            var toSend = {userID: user_ID, courseID: course_ID, title: course_title, semester: sem, data: dataURL};
            console.log(toSend);
            var request = new XMLHttpRequest();
            request.open('POST', '/addNewCourse', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));

            request.onreadystatechange = function() {
            	console.log("ok");
                if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    if (response.status == 'success') {
                        $('#myModal').modal('hide');
                        visualizeRoster();
                    } else {
                        $('#modal-alert').text('Something went wrong :(');
                    }
                }
            }
    	};
    	reader.readAsText(selected);
	});

    $("#addCategory").on('click', function() {
        if (!$("#categoryName").val() || !$("#categoryId").val()) {
            $("#categoryErrorDiv").html('Fields are empty!');
            return;
        }
        var userID = $("meta[name='user_id']").attr("content");
        $.ajax({
            type : 'POST',
            url : "checkIfCategoryIdValid",
            data : {userID : userID, categoryID : $("#categoryId").val()},
            dataType : 'json'
        }).done(function(response) {
            if (response.status == 'success') {
                $("#categoryErrorDiv").empty();
                var catName = $("#categoryName").val();
                var catID = $("#categoryId").val();
                var subcatNames = [];
                var tipNames = [];
                $('.subcatName').each(function() {
                    subcatNames.push($(this).val());
                });
                $('.tipName').each(function() {
                    tipNames.push($(this).val());
                });
                if (!areWordsDistinct(subcatNames)) {
                    $("#categoryErrorDiv").html("Don't enter duplicate subcategories.");
                } else if (areWordsBlank(subcatNames)) {
                    $("#categoryErrorDiv").html("Please leave blank subcategories only at the end.");
                } else if (subcatNames[0] == '') {
                    $("#categoryErrorDiv").html("You need at least one subcategory.");
                } else {
                    var toSend = {userID : userID, categoryID : catID, categoryName : catName, subCategories : subcatNames, studyTips : tipNames};
                    $.ajax({
                        type : 'POST',
                        url : 'makeNewCategory',
                        data : toSend,
                        dataType : 'json'
                    }).done(function(response) {
                        console.log('success making category');
                        $('#uploadCategory').modal('hide');
                        $('#uploadCategory').find('input:text').val(''); 
                        $("#subcats").find("tr:gt(1)").remove();
                    }).fail(function(response) {
                        console.log('error : could not make new category');
                    });
                }              
            } 
            else {
                $("#categoryErrorDiv").html(response.status);
            }
        }).fail(function() {
            console.log('error checking if category ID valid');
        });
        
    });
});

function listenForTabPress(e, div) {
    var keyCode = e.keyCode || e.which; 

    if (keyCode == 9) { 
        e.preventDefault();
        addSubCatInput();
    }
}

function getAvailableCategories() {
    var toSend = {userID: $("meta[name='user_id']").attr("content")}
    var request = new XMLHttpRequest();
    request.open('POST', '/getCategoriesForProfessor', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(toSend));

    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            var response = JSON.parse(request.responseText);
            for (var i = 0; i < response.categories.length; i++) {
                var category = response.categories[i];
                var categoryItem = document.createElement('li');
                categoryItem.appendChild(document.createTextNode(category._id));
                var subCategoryList = document.createElement('ul');
                subCategoryList.setAttribute("style", "list-style: none;");
                for (var j = 0; j < category.sub_categories.length; j++) {
                    var subCategoryItem = document.createElement('li');
                    subCategoryItem.appendChild(document.createTextNode(j + " : " + category.sub_categories[j]));
                    subCategoryList.appendChild(subCategoryItem);
                }
                categoryItem.appendChild(subCategoryList);
                $('#prof_categories').append(categoryItem);
            }
        }
    }
}


$(document).ready(function() {
	visualizeRoster();

    $('#prof_categories').hide();
    getAvailableCategories();
    $('#categories_button').click(function() {
        if ($('#prof_categories').is(":visible")) {
            $('#prof_categories').hide(500);
        } else {
            $('#prof_categories').show(500);
        }
    });

    $('#user_settings').hover(
        function() {
        $('#user_banner').css('background-image', "url('images/user_banner2.gif')");
        },
        function() {
            $('#user_banner').css('background-image', "url('images/user_banner.gif')");
        }
    );

    $('#submit').on('click', function() {
    	visualizeRoster();
    	var user = $("meta[name='user_id']").attr("content");
    	visualizeScores(true, user, '#part3');
    });

    $(".lastTip").on('keydown', function(e) {
        listenForTabPress(e, $(this));
    });

    $('.subcat-close').on('click', function(e) {
     if ($("#subcats").find("tr:gt(1)").length > 0) {
        $("#subcats").find("tr:gt(1)").remove();
        var newButton = $("#hiddenNewSubCat");
        newButton.clone().appendTo('#firstTip');
        newButton.removeAttr('hiddenNewSubCat');
        newButton.attr('id', 'newSubCat');
        newButton.show();        
        $('#newSubCat').click(addSubCatInput);
     }
     
     
     $("#categoryErrorDiv").empty();
    });

    $('#examModalClose').click(function() {
        $('#newExamError').empty();
    });

    $('#catModalClose').click(function() {
        subCatId = 0;
    });

    $('#newSubCat').click(addSubCatInput);

    // Flipping the professor's card functions to see individual student scores
    $('#main_content').flip({trigger:'manual'});
    $('#part4-back').click(function() {
        flipCard(null, null, false);
    });
});