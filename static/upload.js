$(function() {
    $("#upload").click(function(e) {
    	var input = e.target;
    	var selected = $("#categories").get(0).files[0];

    	var reader = new FileReader();
    	reader.onload = function() {

    		//this variable holds the csv data!
    		var dataURL = reader.result;
    		console.log(dataURL);
            var toSend = {data: dataURL};

            var request = new XMLHttpRequest();
            request.open('POST', '/examInput', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(toSend));
    	};
    	reader.readAsText(selected);
	});
});
