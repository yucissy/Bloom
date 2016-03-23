var csv = require('csv-parse');
var express = require('express');

var app = express();

app.get('*', function(req, res){

});

app.listen(8080, function(){
	console.log('- Server listening on port 8080');
});