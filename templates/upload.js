$(function() {
    $("#upload").click(function() {
    	var request = new XMLHttpRequest();
    	request.open('POST', '/examInput', true);
    	request.setRequestHeader('Content-Type', 'multipart/form-data');
    	var data = $("#categories").prop('files');
    	request.send(data);
	});
});
