var margin = {t:50,r:50,b:50,l:50};
var width = document.getElementById('plot').clientWidth-margin.l-margin.r,
	height = document.getElementById('plot').clientHeight-margin.t-margin.b;


var plot = d3.select('.plot')
	.append('svg')
	.attr('width',width+margin.l+margin.r)
	.attr('height',height+margin.t+margin.b)
	.append('g')
	.attr('class','plot')
	.attr('transform', 'translate (20,'+margin.r+')');


//MAP PROJECTION AND GENERATOR  -------------------------------
	
	//Projection

var albersProjection = d3.geo.albers()
	.scale(240000)
	.rotate( [71.068,0] )
	.center( [0, 42.355] )
	.translate( [width/2,height/8] );
 
	//Path generator

var geoPath = d3.geo.path()
	.projection (albersProjection);


var map = plot.selectAll('path')
		.data(neighborhoods_json.features);

		map
		.append('path')
		.style('fill','rgb(234,234,229)')
		.style('stroke', 'rgb(180,180,180)')
		.style('fill-opacity','1')
		.style('stroke-opacity', '1')
		.attr('d',geoPath);
