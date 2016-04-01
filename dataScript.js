queue()
    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
    //.defer(d3.csv, 'data/hubway_stations.csv', parseStations)
    .await(dataLoaded)

function dataLoaded(err,trips){  
    
    //CROSSFILTER TRIAL 3
    var cf = crossfilter(trips);
    
    //console.log(trips);
    
    var tripsByStartStation = cf
        .dimension(function(d){return d.startStation});
    
    tripsByStartStation.filter('22');
    
    console.log(startStations.top(10));
    
    //create an end station dimension
    var tripsByEndStation = cf.dimension(function(d){return d.endStation});
    
    //now group by end stations, on the dimension you just created
    var tripsGroupByEndStation = tripsByEndStation.group();
    
    console.log(tripsGroupByEndStation.top(5));
    
};

function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn,
        gender:d.gender,//can read string d.gender=="" ? "none" :d.gender
        birthDate:+d.birth_date
    }
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}