function visualizeScores(aggregate, page) {
	   	$("#part3").empty();
  		var user_ID = $("meta[name='user_id']").attr("content");
  		var course_ID = $("meta[name='course_id']").attr("content");
	    var toSend = {userID: user_ID, courseID: course_ID};

	    var request = new XMLHttpRequest();
	    if (aggregate)
	    	request.open('POST', '/getAllAggregate', true);
	    else
	    	request.open('POST', '/getAllScores', true);
	    request.setRequestHeader('Content-Type', 'application/json');
	    request.send(JSON.stringify(toSend));
	    request.onreadystatechange = function() {

	       if (request.readyState == 4 && request.status == 200) {
	            var response = JSON.parse(request.responseText);

		
					$('.score').css('display', 'none');
					if (aggregate) {
						$.each(response.aggregate, function(i, v) {
	                	makeBarChart(v, true, page);
	                });
					} else {
	                $.each(response.reports, function(i, v) {
	                	makeBarChart(v, false, page);
	                });
	        	}
	        	setTimeout(function() {
	        		$('.score').css('display', 'block');
	        	}, 1000);
	        } 
	    }
    }

function getColor(percent) {
  if (percent > 80)
    return "#009247";
  if (percent > 60)
    return "#86D500";
  if (percent > 40)
    return "#FFE200";
  if (percent > 20)
    return "#FF7A05";
  return "#ED1B24";
}

function makeButton(div, examID, page) {

	var button = div.append("button")
		.attr("type", "button")
		.attr("class", "btn btn-default exam-report")
		.attr("aria-label", "Left Align")
		.attr("id", examID);


	button.append("span")
		.attr("class", "glyphicon glyphicon-download")
		.attr("aria-hidden", "true");

	button.append("span")
		.attr("class", "btn-text exam-btn-text")
		.text("Report");

}

//actual code
function makeBarChart(data, agg, page) {
  var newDiv = d3.select("#part3")
            .append("div")
            .attr("class", "category");

  var title = data.test.title;
  var header = newDiv.append("h3")
  	.text(title);

  if (page == "professor") {
   makeButton(header, data.test._id); 	
  }

  newDiv.append("div")
  	.style("clear", "both");
  var id = data.test._id;
  var chartArea = newDiv.append("div")
    .attr("id", id);

  if (data.categories != null) {
  	var categoryTitle = data.categories[0].main_cat_id.name;
  

  
  
  var par = chartArea.append("div");
  par.append("h2")
  	.attr("class", "left")
    .text(categoryTitle.toUpperCase());



  if (agg) {
    	var count = data.test.count;
    	var students = "STUDENTS";
		if (count==1)
		  students = "STUDENT";
		if (count==undefined)
			count = 0;
		par.append("h2")
		  	.attr("class", "right")
		  	.text(count +" "+students);
  }
  

  
  var gap = 20;

  var labels = data.categories[0].main_cat_id.sub_categories;
  var data1 = data.categories[0].sub_cats;
  var percent = Array.apply(null, Array(labels.length)).map(Number.prototype.valueOf,0);
  $.each(data1, function(i, v) {
    percent[v._id] = v.percentage;
  });

  var indices = d3.range(0, percent.length);

  var width = 280,
   bar_height =30,
   length = labels.length,
   height = bar_height * length;

  var x, y;
  x = d3.scale.linear()
    .domain([0, 100])
    .range([0, width]);

  y = d3.scale.ordinal()
    .domain(indices)
    .rangeBands([0, height]);

    var y2 = d3.scale.ordinal()
    .domain(labels)
    .rangeBands([0, height]);

  var left_width = 200;

chart = chartArea
  .append('svg')
  .attr('class', 'chart')
  .attr('width', left_width + width)
  .attr('height', height);

chart.selectAll("rect")
  .data(percent)
  .enter().append("rect")
  .attr("x", left_width)
  .attr("y", function(v, i) { return y(i)})
  .attr("width", 0)
  .attr("height", y.rangeBand())
  .attr("fill", function (d) { return getColor(d);})
  .transition()
  .duration(1000)
  .attr("width", x)
  .attr("x", left_width);

chart.selectAll("text.name")
  .data(labels)
  .enter().append("text")
  .attr("x", left_width / 2)
  .attr("y", function(d){ return y2(d) + y2.rangeBand()/2; } )
  .attr("dy", ".36em")
  .attr("text-anchor", "middle")
  .attr('class', 'name')
  .text(String);

  chart.selectAll("text.score")
  .data(percent)
  .enter().append("text")
  .attr("x", function(d) { return x(d) + left_width; })
  .attr("y", function(d, i){ return y(i) + y.rangeBand()/2; } )
  .attr("dx", -5)
  .attr("dy", ".36em")
  .attr("text-anchor", "end")
  .attr('class', 'score')
  .text(function(d) {
  	if (d != 0)
  	return d;
	return '';}); 

} else {
	var user_ID = $("meta[name='user_id']").attr("content");

	var btn = chartArea.append('button')
        .attr('type', 'button')
		.attr('class', 'btn btn-primary-outline')
		.attr("aria-label", "Left Align")
		.text('Enter Scores')
		.on('click', function() {
			getExam($(this).parent().attr('id'), user_ID);
		})
		.attr('data-toggle', 'modal')
		.attr('data-target', '#newExam1')
		.append('span')
		.attr('class', 'glyphicon glyphicon-plus pull-left')
		.attr('aria-hidden', 'true')
		.style('margin-top', '-5px');


}
  

}



