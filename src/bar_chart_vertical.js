var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
		var margin = {
			top: 20,
			right: 30,
			bottom: 30,
			left: 40
		};
    var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

		// define x,y point rule
		var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
    var y = d3.scale.linear()
    .range([height, 0]);

		// define axis
		var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');
		var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left')
		.ticks(10, '%');

    var chart = d3.select('.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv('data/chart.csv', type, function(err, data){
			x.domain(data.map(function(d){ return d.name; }));
      y.domain([0, d3.max(data, function(d){
        return d.value;
      })]);

			chart.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0, ' + height + ')')
			.call(xAxis);

			chart.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text('Frequency');

			chart.selectAll('.bar')
			.data(data)
			.enter().append('rect')
			.attr('class', 'bar')
			.attr('x', function(d){ return x(d.name); })
			.attr('y', function(d){ return y(d.value); })
			.attr('height', function(d){ return height - y(d.value); })
			.attr('width', x.rangeBand());
    });

    function type(d){
      d.value = +d.value;
      return d;
    }
  }
};

$(function(){
  webPage.init();
});
