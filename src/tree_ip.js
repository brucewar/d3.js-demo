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
		center = [(width - margin.left - margin.right) / 2, (height - margin.top - margin.bottom) / 2],
    i = 0,
		limit = 2,
    root;

		var tree = d3.layout.tree()
		    .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

		var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on('zoom', zoom);
		function zoom(){
			d3.select('svg').select('g.tree').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
		}
		function zoomBy(factor){
	    var scale = zoomListener.scale(),
	        extent = zoomListener.scaleExtent(),
	        translate = zoomListener.translate(),
	        x = translate[0], y = translate[1],
	        target_scale = scale * factor;

	    // If we're already at an extent, done
	    if (target_scale === extent[0] || target_scale === extent[1]) { return false; }
	    // If the factor is too much, scale it down to reach the extent exactly
	    var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
	    if (clamped_target_scale != target_scale){
	        target_scale = clamped_target_scale;
	        factor = target_scale / scale;
	    }

	    // Center each vector, stretch, then put back
	    x = (x - center[0]) * factor + center[0];
	    y = (y - center[1]) * factor + center[1];

	    // Enact the zoom immediately
	    zoomListener.scale(target_scale)
	        .translate([x,y]);
	    d3.select('svg').select('g.tree').attr('transform', 'translate(' + zoomListener.translate() + ')scale(' + zoomListener.scale() + ')');
		}

		var diagonal = d3.svg.diagonal()
		    .projection(function(d) { return [d.y, d.x]; });

		var container = d3.select("#treeContainer").append("svg")
		    .attr("width", width - margin.left - margin.right)
		    .attr("height", height - margin.top - margin.bottom)
				.call(zoomListener);

		var zoomBtns = container.selectAll('.button')
		    .data(['zoom_out', 'zoom_in'])
		    .enter()
		    .append("g")
				.attr('class', 'button')
				.attr('transform', function(d, i){
					return 'translate(' + 10 + ', ' + (10 + 50 * i) + ')';
				})
		    .attr("id", function(d){return d;})
				.on('click', function(d){
					zoomBy(this.id == 'zoom_in' ? 2 : 1 / 2);
				});

		zoomBtns.append('rect')
				.attr({width: 30, height: 30});

		zoomBtns.append('text')
				.attr({x: 15, y: 20, 'text-anchor': 'middle'})
				.text(function(d, i){ return d == 'zoom_in' ? '+' : '-'; });

		//var svg = container.append("g")
		    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var svg = container.append("g").attr('class', 'tree');

		root = {
			destIp: '172.20.1.1'
		};
		root.x0 = (height - margin.left - margin.right) / 2;
		root.y0 = (width - margin.top - margin.bottom) / 2;

		update(root);

		function update(source) {
		  var duration = d3.event && d3.event.altKey ? 5000 : 500;

		  // Compute the new tree layout.
		  var nodes = tree.nodes(root).reverse();

		  // Normalize for fixed-depth.
		  //nodes.forEach(function(d) { d.y = d.depth * 180; });

			var srcDepth = source.depth;
			nodes.forEach(function(d){
				d.y = (width - margin.left - margin.right) / 2 + 180 * (d.depth - srcDepth);
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
						if(d.more) return;
						this.timeout = setTimeout(function(){
							var $tooltip = $('#tooltip');
							$tooltip.find('.loader').show();
							$tooltip.find('.tooltip').empty();
							$tooltip.show();
						}, 300);
					})
					.on('mousemove', function(d){
						$('#tooltip').css({
							top: d3.event.y + 10,
							left: d3.event.x + 10
						});
					})
					.on('mouseout', function(d){
						if(d.more) return;
						clearTimeout(this.timeout);
						$('#tooltip').hide();
					});

		  nodeEnter.append("circle")
		      .attr("r", 1e-6)
					.attr('pointer-events', 'none')
		      .style("fill", function(d){ return !d.isExpand ? "lightsteelblue" : "#fff"; });

		  nodeEnter.append("text")
		      .attr("x", -10)
		      .attr("dy", ".35em")
					.attr('pointer-events', 'none')
		      .attr("text-anchor", 'end')
		      .text(function(d) { return d.more ? '' : d.destIp; })
		      .style("fill-opacity", 1e-6);

			nodeEnter.append('text')
					.attr('class', 'hint')
					.attr('text-anchor', 'middle')
					.attr('dy', '.3em')
					.text(function(d){
						return d.more ? '+' : 'IP';
					});

		  // Transition nodes to their new position.
		  var nodeUpdate = node.transition()
		      .duration(duration)
		      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

		  nodeUpdate.select("circle")
		      .attr("r", 10)
		      .style("fill", function(d){ return !d.isExpand ? "lightsteelblue" : "#fff"; });

		  nodeUpdate.select("text")
					.attr('x', function(d){
						return d.children && d.children.length ? -10 : 10;
					})
					.attr('text-anchor', function(d){
						return d.children && d.children.length ? 'end' : 'start';
					})
		      .style("fill-opacity", 1);

		  // Transition exiting nodes to the parent's new position.
		  var nodeExit = node.exit().transition()
		      .duration(duration)
		      .attr("transform", function(d) {
						if(d.more) this.remove();
						return "translate(" + source.y + "," + source.x + ")";
					})
		      .remove();

		  nodeExit.select("circle")
		      .attr("r", 1e-6);

		  nodeExit.select("text")
		      .style("fill-opacity", 1e-6);

			var links = tree.links(nodes);
		  // Update the links…
		  var link = svg.selectAll("path.link")
		      .data(links, function(d) {
						return d.target.id;
					}).attr('class', function(d){
						return 'link ' + (typeof d.target.isExpand !== 'undefined' ? 'trace' : '');
					});

		  // Enter any new links at the parent's previous position.
		  link.enter().insert("path", "g")
		      .attr("class", 'link')
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return diagonal({source: o, target: o});
		      });

		  // Transition links to their new position.
		  link.transition()
		      .duration(duration)
		      .attr("d", diagonal);

		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(duration)
		      .attr("d", function(d) {
						if(d.target.more) this.remove();
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
			d.isExpand = false;
			delete d.children;
		}
		function expand(d){
			getData({destIp: d.destIp}, function(data){
				if(data && data.length){
					// 获取到此节点有子节点
					d._children = data;
					d.children = d._children.slice(0, limit);
					if(d._children.length > d.children.length){
						d.children.push({more: true});
					}
				}
				d.isExpand = true;
				update(d);
			});
		}

		// 异步获取数据
		function getData(sd, cb){
			d3.json('data/ip.json', function(err, json){
				cb && cb(json.filter(function(item){
					return item.srcIp == sd.destIp;
				}));
			});
		}

		function click(d){
			if(d.more){
				// 点击更多
				d.parent.children = d.parent._children.slice(0, (d.parent.children.length - 1) + limit);
				if(d.parent._children.length > d.parent.children.length){
					d.parent.children.push({more: true});
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
