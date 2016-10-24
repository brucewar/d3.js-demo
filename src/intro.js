var d3 = require('d3');

window.onload = function(){
  d3.select('body')
  .style('background-color', 'black')
  .style('color', 'white');

  d3.selectAll('p')
  .data([4, 8, 15, 16, 23, 42])
  .style('font-size', (d, i) => { return d + 'px';});

  d3.select('body')
  .selectAll('p')
  .data([4, 8, 15, 16, 23, 42])
  .enter().append('p')
  .text(function(d){
    return 'I\'m number ' + d + '!';
  });
  // Update
  var p =  d3.select('body')
  .selectAll('p')
  .data([4, 8, 15, 16, 23, 42])
  .text(function(d){
    return d;
  });
  // Enter
  p.enter().append('p')
  .text(function(d){
    return d;
  });
  // Exit
  p.exit().remove();

  // d3.select('body').transition()
  // .style('background-color', 'black');
  d3.selectAll('circle').transition()
  .duration(750)
  .delay(function(d, i){
    return i * 10;
  })
  .attr('r', function(d){
    return Math.sqrt(d * 1);
  });
};
