var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
		var margin = {
			top: 20,
			right: 30,
			bottom: 20,
			left: 30
		};
		var barPadding = 4;
    var width = 400,
    height = 400;

		// define x,y point rule
		var x = d3.scale.ordinal()
		.rangeRoundBands([0, width - margin.left - margin.right]);
    var y = d3.scale.linear()
    .range([height - margin.top - margin.bottom, 0]);

		// define axis
		var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');
		var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left')
		.ticks(10);

    var chart = d3.select('.chart')
    .attr('width', width)
    .attr('height', height)
		.append('g');

    d3.csv('data/chart.csv', type, function(err, data){
			x.domain(data.map(function(d){ return d.name; }));
      y.domain([0, d3.max(data, function(d){
        return d.value;
      })]);

			// append x axis
			chart.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(' + margin.left + ', ' + (height - margin.bottom) + ')')
			.call(xAxis);

			// append y axis
			chart.append('g')
			.attr('class', 'y axis')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.call(yAxis)
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text('value');

			// append rect
			chart.selectAll('.bar')
			.data(data)
			.enter().append('rect')
			.attr('class', 'bar')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('x', function(d){ return x(d.name) + barPadding / 2; })
			.attr('y', function(d){
				var min  = y.domain()[0];
				return y(min);
			}).attr('height', 0)
			.attr('fill', 'steelblue')
			.on('mouseover', function(d, i){
				d3.select(this).attr('fill', 'yellow');
			}).on('mouseout', function(d, i){
				d3.select(this).transition().duration(500).attr('fill', 'steelblue');
			}).transition().delay(function(d, i){
				return i * 200;
			}).duration(2000).ease('bounce')
			.attr('y', function(d){ return y(d.value); })
			.attr('height', function(d){ return height - margin.top - margin.bottom - y(d.value); })
			.attr('width', x.rangeBand() - barPadding);

			// append text to bar
			chart.selectAll('.text')
			.data(data)
			.enter()
			.append('text')
			.attr('class', 'text')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('x', function(d){
				return x(d.name) + barPadding / 2;
			}).attr('y', function(d){
				var min  = y.domain()[0];
				return y(min);
			}).transition()
			.delay(function(d, i){
				return i * 200;
			}).duration(2000).ease('bounce')
			.attr('y', function(d){
				return y(d.value);
			}).attr('dx', function(){
				return (x.rangeBand() - barPadding) / 2;
			}).attr('dy', 20)
			.text(function(d){
				return d.value;
			});
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
