var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
    d3.select('svg')
		.selectAll('circle')
		.data([32, 57, 112, 293])
		.enter().append('circle')
		.style('fill', 'steelblue')
		.attr('r', function(d){ return Math.sqrt(d); })
		.attr('cx', function(d, i){ return i * 100 + 30; })
		.attr('cy', 60);
  }
};

$(function(){
  webPage.init();
});
