var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
    var data = [4, 8, 15, 16, 23, 42];

    var x = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([0, 420]);

    d3.select('.chart')
    .selectAll('div')
    .data(data)
    .enter().append('div')
    .style('width', function(d){
      return x(d) + 'px';
    }).text(function(d){
      return d;
    });
  }
};

$(function(){
  webPage.init();
});
