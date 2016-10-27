var $ = require('jquery');
var d3 = require('d3');

var webPage = {
  init: function(){
		var margin = {
			top: 20,
			left: 50,
			right: 50,
			bottom: 20
		};
    var width = $(document).width(),
    height = $(document).height(),
    i = 0,
		limit = 2,
    root;

		var tree = d3.layout.tree()
		    .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

		var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on('zoom', zoom);
		function zoom(){
			d3.select('svg').select('g').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
		}

		var diagonal = d3.svg.diagonal()
		    .projection(function(d) { return [d.y, d.x]; });

		var svg = d3.select("#body").append("svg")
		    .attr("width", width - margin.left - margin.right)
		    .attr("height", height - margin.top - margin.bottom)
				.call(zoomListener)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// 获取树的root
		getData({name: 'root'}, function(json){
			root = json;
			root.x0 = height / 2;
			root.y0 = width / 2;

			update(root);
		});

		function update(source) {
		  var duration = d3.event && d3.event.altKey ? 5000 : 500;

		  // Compute the new tree layout.
		  var nodes = tree.nodes(root).reverse();

		  // Normalize for fixed-depth.
		  //nodes.forEach(function(d) { d.y = d.depth * 180; });

			var srcDepth = source.depth;
			nodes.forEach(function(d){
				d.y = height / 2 + 180 * (d.depth - srcDepth);
			});

		  // Update the nodes…
		  var node = svg.selectAll("g.node")
		      .data(nodes, function(d) { return d.id || (d.id = ++i); });

		  // Enter any new nodes at the parent's previous position.
		  var nodeEnter = node.enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
		      .on("click", click)
					.on('mouseover', function(d){
						if(d.name == 'more') return;
						var detail = d3.select(this).append('g')
								.attr('class', 'detail')
								.attr('dx', d3.event.x)
								.attr('dy', d3.event.y + 10);
						detail.append('rect')
								.attr('width', 100)
								.attr('height', 100);
						detail.append('text')
								.attr('dx', '.35em')
								.attr('dy', '2em')
								.attr('text-anchor', 'start')
								.text(function(d){
									return 'name: ' + d.name;
								});
					})
					.on('mousemove', function(d){
						var detail = d3.select(this).select('.detail');
						detail.attr('x', d3.event.x)
								.attr('y', d3.event.y);
					})
					.on('mouseout', function(d){
						if(d.name == 'more') return;
						d3.select(this).select('.detail').remove();
					});

		  nodeEnter.append("circle")
		      .attr("r", 1e-6)
		      .style("fill", function(d){ return !d.isExpand ? "lightsteelblue" : "#fff"; });

		  nodeEnter.append("text")
		      .attr("x", -10)
		      .attr("dy", ".35em")
		      .attr("text-anchor", "end")
		      .text(function(d) { return d.name; })
		      .style("fill-opacity", 1e-6);


		  // Transition nodes to their new position.
		  var nodeUpdate = node.transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

		  nodeUpdate.select("circle")
		      .attr("r", 10)
		      .style("fill", function(d){ return !d.isExpand ? "lightsteelblue" : "#fff"; });

		  nodeUpdate.select("text")
		      .style("fill-opacity", 1);

		  // Transition exiting nodes to the parent's new position.
		  var nodeExit = node.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) {
						if(d.name == 'more') this.remove();
						return "translate(" + source.y + "," + source.x + ")";
					})
		      .remove();

		  nodeExit.select("circle")
		      .attr("r", 1e-6);

		  nodeExit.select("text")
		      .style("fill-opacity", 1e-6);

		  // Update the links…
		  var link = svg.selectAll("path.link")
		      .data(tree.links(nodes), function(d) { return d.target.id; });

		  // Enter any new links at the parent's previous position.
		  link.enter().insert("path", "g")
		      .attr("class", "link")
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return diagonal({source: o, target: o});
		      })
		    .transition()
		      .duration(duration)
		      .attr("d", diagonal);

		  // Transition links to their new position.
		  link.transition()
		      .duration(duration)
		      .attr("d", diagonal);

		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(duration)
		      .attr("d", function(d) {
						if(d.target.name == 'more') this.remove();
		        var o = {x: source.x, y: source.y};
		        return diagonal({source: o, target: o});
		      })
		      .remove();

		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
		}

		function collapse(d){
			delete d._children;
			delete d.isExpand;
			delete d.children;
		}
		function expand(d){
			getData({name: d.name}, function(json){
				if(json && json.children){
					// 获取到此节点有子节点
					d._children = json.children;
					d.children = d._children.slice(0, limit);
					if(d._children.length > d.children.length){
						d.children.push({'name': 'more'});
					}
				}
				d.isExpand = true;
				update(d);
			});
		}

		// 异步获取数据
		function getData(sd, cb){
			d3.json('data/async_city.json', function(err, json){
				cb && cb(json[sd.name]);
			});
		}

		function click(d){
			if(d.name == 'more'){
				// 点击更多
				d.parent.children = d.parent._children.slice(0, (d.parent.children.length - 1) + limit);
				if(d.parent._children.length > d.parent.children.length){
					d.parent.children.push({'name': 'more'});
				}
				update(d.parent);
			}else if(d.isExpand && d.children){
				// 点击展开的节点
				collapse(d);
				update(d);
			}else{
				// 点击未展开的点
				expand(d);
			}
		}
  }
};

$(function(){
  webPage.init();
});
