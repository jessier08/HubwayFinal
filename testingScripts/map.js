var m = {t:50,r:0,b:50,l:0},
    mapW = d3.select('#map').node().clientWidth - m.l - m.r,
    mapH = d3.select('#map').node().clientHeight - m.t - m.b;

var svg = d3.select('#map')
  .append('svg')
  .attr('width', mapW)
  .attr('height', mapH);

// creating projection for boston map
var albersProjection = d3.geo.albers()
  .scale( 190000 )
  .rotate( [71.057,0] )
  .center( [0, 42.313] )
  .translate( [mapW/2,mapH/2] );

var geoPath = d3.geo.path()
    .projection(albersProjection);

// drawing boston neighborhoods
var neighborhoods = svg.append('g').attr('id', 'neighborhoods');

neighborhoods.selectAll('path')
  .data( neighborhoods_json.features)
  .enter()
  .append('path')
  .attr('d', geoPath);

// how to plot hubway stations
//var rodents = svg.append( "g" ).attr( "id", "rodents" );
//
//rodents.selectAll( "path" )
//  .data( rodents_json.features )
//  .enter()
//  .append( "path" )
//  .attr( "d", geoPath );


// load data
queue()
    .defer(d3.csv, 'data/hubway_stations.csv', parseStations)
    .await(dataLoaded3);

function dataLoaded3 (err, stations){
    
    var stationDots = svg.append('g').attr('class','circle');
    
    stationDots.selectAll('.circle')
        .data(stations)
        .enter()
        .append('circle')
        .attr('r',3)
        .attr('cx', function(d){return albersProjection(d.lng)})
        .attr('cy', function(d){return albersProjection(d.lat)});
    
    stationDots.exit().remove();
    
};

function parseStations(d){
    //setting the mapping structure (d3.map) - a look up table
    //here setting id | lngLat, station Name
    return {
        lng: +d.lng, 
        lat: +d.lat,
        stationName: d.station
    };
}