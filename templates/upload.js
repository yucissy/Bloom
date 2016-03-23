$(function() {
	function loadFile(path, success, error) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					if (success)
						success(xhr.responseText);
				} else {
					if (error)
						error(xhr);
				}
			}
		}
		xhr.open("GET", path, true);
		xhr.send();
	}



    $("#upload").click(function() {
    	console.log("path: "+$("#categories").val());
    	var path = $("#categories").val();
    	loadFile(path, function(data) {
    		console.log(data);
    	}, function(xhr) {
    		console.error(xhr);
    	});
    	// var request = new XMLHttpRequest();
    	// request.open('POST', '/examInput', true);
    	// request.setRequestHeader('Content-Type', 'multipart/form-data');
    	// var data = $("#categories").prop('files');
    	// console.log(data);
    	// request.send(data);
	});
});
