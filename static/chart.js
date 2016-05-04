function getScores() {
  var user_ID = "B0004567";
        var toSend = {userID: user_ID, courseID: 'CSCI1230'};
        console.log(toSend);
        var request = new XMLHttpRequest();
        request.open('POST', '/getAllScores', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
            console.log("got scores");
           if (request.readyState == 4 && request.status == 200) {
                var response = JSON.parse(request.responseText);
   
                $.each(response.reports, function(i, v) {
                	makeBarChart(v);
                });
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

//actual code
function makeBarChart(data) {

  var newDiv = d3.select("#part1")
            .append("div")
            .attr("class", "category");

  var title = data.test.title;
  newDiv.append("h3")
  	.text(title);
  if (data.categories != null) {
  	var categoryTitle = data.categories[0].main_cat_id.name;
  var id = data.test._id;
  newDiv.append("h2")
    .text(categoryTitle.toUpperCase());

  newDiv.append("hr")
    .style("color", "gray");

  var chartArea = newDiv.append("div")
    .attr("id", id);
  var gap = 20;

  var labels = data.categories[0].main_cat_id.sub_categories;
  var data1 = data.categories[0].sub_cats;
  var percent = Array.apply(null, Array(labels.length)).map(Number.prototype.valueOf,0);
  $.each(data1, function(i, v) {
    percent[v._id] = v.percentage;
  });

  var indices = d3.range(0, percent.length);

  console.log("labels "+labels);
  console.log("percent "+percent);
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

    // var y3 = d3.scale.ordinal()
    //   .domain(percent)
    //   .rangeBands([0, height]);

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
  console.log(chart.id);
} else {
	newDiv.append("p")
		.text("You have not entered scores yet.");
}
  

}

$("#select_2").on('click', function() {
  $("#part1").empty();
});