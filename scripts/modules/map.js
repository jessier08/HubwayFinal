var MapPlot = function mapPlot(){

    map.append('svg')
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
    var neighborhoods = map.append('g').attr('id', 'neighborhoods');

    neighborhoods.selectAll('path')
        .data( neighborhoods_json.features)
        .enter()
        .append('path')
        .attr('d', geoPath);

    var stationDots = map.append('g').attr('class','circle')
    
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
