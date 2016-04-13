var mapM = {t:50,r:0,b:50,l:0},
    mapW = d3.select('#map').node().clientWidth - m.l - m.r,
    mapH = d3.select('#map').node().clientHeight - m.t - m.b;

var svg = d3.select("#map")
  .append("svg")
  .attr("width", mapW)
  .attr("height", mapH);

var neighborhoods = svg.append("g").attr("id", "neighborhoods");

var albersProjection = d3.geo.albers()
  .scale( 190000 )
  .rotate( [71.057,0] )
  .center( [0, 42.313] )
  .translate( [mapW/2,mapH/2] );

var geoPath = d3.geo.path()
    .projection( albersProjection );

neighborhoods.selectAll( "path" )
  .data( neighborhoods_json.features )
  .enter()
  .append( "path" )
  .attr( "d", geoPath );

// how to plot hubway stations
//var rodents = svg.append( "g" ).attr( "id", "rodents" );
//
//rodents.selectAll( "path" )
//  .data( rodents_json.features )
//  .enter()
//  .append( "path" )
//  .attr( "d", geoPath );