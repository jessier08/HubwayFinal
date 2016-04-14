var mapW = d3.select('#map').node().clientWidth,
    mapH = d3.select('#map').node().clientHeight;

var svg = d3.select('#map')
  .append('svg')
  .attr('width', mapW)
  .attr('height', mapH);

// creating projection for boston map
var albersProjection = d3.geo.albers()
  .scale( 400000 )
  .rotate( [71.057,0] )
  .center( [-0.017, 42.347] )
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

// load data
queue()
    .defer(d3.csv, 'data/hubway_stations.csv', parseStations)
    .await(dataLoaded3);

function dataLoaded3 (err, stations){
    
    var stationDots = svg.append('g').attr('class','circle')
    
    stationDots.selectAll('.circle')
        .data(stations)
        .enter()
        .append('circle')
        .attr('r',3)
         .attr('cx', function(d){
            var xy = albersProjection(d.lngLat);
            return xy[0]})
        .attr('cy', function(d){
            var xy = albersProjection(d.lngLat);
            return xy[1]})
    
    //stationDots.exit().remove();
    
};

function parseStations(d){
    //setting the mapping structure (d3.map) - a look up table
    //here setting id | lngLat, station Name
    return {
        lngLat: [+d.lng,+d.lat],
        stationName: d.station
    };
}