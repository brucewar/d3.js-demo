var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
    var width = 420,
    barHeight = 20;

    var x = d3.scaleLinear()
    .range([0, width]);

    var chart = d3.select('.chart')
    .attr('width', width);

    d3.tsv('data/chart.tsv', type, function(err, data){
      x.domain([0, d3.max(data, function(d){
        return d.value;
      })]);

      chart.attr('height', barHeight * data.length);

      var bar = chart.selectAll('g')
      .data(data)
      .enter().append('g')
      .attr('transform', function(d, i){
        return 'translate(0, ' + (i * barHeight) + ')';
      });

      bar.append('rect')
      .attr('width', x)
      .attr('height', barHeight - 1);

      bar.append('text')
      .attr('x', function(d, i){
        return x(d) - 3;
      }).attr('y', barHeight - 1)
      .attr('dy', '.35em')
      .text(function(d){
        return d;
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
