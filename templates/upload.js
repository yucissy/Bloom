$(function() {
    $("#upload").click(function(e) {
    	var input = e.target;
    	var selected = $("#categories").get(0).files[0];

    	var reader = new FileReader();
    	reader.onload = function() {

    		//this variable holds the csv data!
    		var dataURL = reader.result;
    		console.log(dataURL);
    	};
    	reader.readAsText(selected);

    	// var request = new XMLHttpRequest();
    	// request.open('POST', '/examInput', true);
    	// request.setRequestHeader('Content-Type', 'multipart/form-data');
    	// var data = $("#categories").prop('files');
    	// console.log(data);
    	// request.send(data);
	});
});
