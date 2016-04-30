function getScores(exam_ID) {
  var user_ID = "B0004567";
        var toSend = {userID: user_ID, examID: exam_ID};
        console.log(toSend);
        var request = new XMLHttpRequest();
        request.open('POST', '/getScores', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(toSend));
        request.onreadystatechange = function() {
            console.log("got scores");
           if (request.readyState == 4 && request.status == 200) {
                var response = JSON.parse(request.responseText);
                console.log(response);
                makeBarChart(response);
            } 
        }
    }



//actual code
function makeBarChart(data) {




  data = {"understanding":11, "concepts":22, "other":33, "remembering":44, "cool": 44};
  var percent = [11, 22, 33, 44, 55];
  var width = 280,
   bar_height = 20,
   length = Object.keys(data).length,
   height = bar_height * length;

  var x, y;
  x = d3.scale.linear()
    .domain([0, 100])
    .range([0, width]);

    console.log("length"+length);
    console.log("height"+height);
  y = d3.scale.ordinal()
    .domain(percent)
    .rangeBands([0, height]);

    var y2 = d3.scale.ordinal()
    .domain(Object.keys(data))
    .rangeBands([0, height]);

  var left_width = 200;

chart = d3.select($("#chart_container")[0])
  .append('svg')
  .attr('class', 'chart')
  .attr('width', left_width + width)
  .attr('height', height);

chart.selectAll("rect")
  .data(percent)
  .enter().append("rect")
  .attr("x", left_width)
  .attr("y", y)
  .attr("width", x)
  .attr("height", y.rangeBand());

chart.selectAll("text.score")
  .data(percent)
  .enter().append("text")
  .attr("x", function(d) { return x(d) + left_width; })
  .attr("y", function(d){ console.log("scores"+y(d));return y(d) + y.rangeBand()/2; } )
  .attr("dx", -5)
  .attr("dy", ".36em")
  .attr("text-anchor", "end")
  .attr('class', 'score')
  .text(String);

chart.selectAll("text.name")
  .data(Object.keys(data))
  .enter().append("text")
  .attr("x", left_width / 2)
  .attr("y", function(d){
    console.log("names"+y2(d));return y2(d) + y2.rangeBand()/2; } )
  .attr("dy", ".36em")
  .attr("text-anchor", "middle")
  .attr('class', 'name')
  .text(String);
}

getScores("5722c08ea598e9931e085fb8");