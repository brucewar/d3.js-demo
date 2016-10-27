var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
		var width = 400,
		height = 400;
    var data = [30, 10, 43, 55, 13];

		var pie = d3.layout.pie();

		// 获取绘图所需的数据，startAngle, endAngle, data
		var pieData = pie(data);

		var outerRadius = 150;
		var innerRadius = 0;

		// 弧生成器
		var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

		var bigArc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius + 20);

		var svg = d3.select('body').append('svg')
		.attr('width', width)
		.attr('height', height);

		var arcs = svg.selectAll('g')
		.data(pieData)
		.enter()
		.append('g')
		.attr('transform', 'translate(' + (width / 2) + ',' + (width / 2) + ')');

		var color = d3.scale.category10();
		arcs.append('path')
		.attr('fill', function(d, i){
			return color(i);
		}).attr('d', function(d){
			return arc(d);
		}).on('mouseover', function(d, i){
			d3.select(this).transition()
			.duration(500).ease('bounce')
			.attr('d', function(d){
				return bigArc(d);
			});
		}).on('mouseout', function(d, i){
			d3.select(this).transition()
			.duration(500)
			.attr('d', function(d){
				return arc(d);
			});
		});

		arcs.append('text')
		.attr('transform', function(d){
			return 'translate(' + arc.centroid(d) + ')';
		}).attr('text-anchor', 'middle')
		.text(function(d){
			return d.data;
		});
  }
};

$(function(){
  webPage.init();
});
