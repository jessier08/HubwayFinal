var stationLoc = d3.map();

queue()
    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
    //.defer(d3.csv, 'data/hubway_stations.csv', parseStations)
    .await(dataLoaded)

function dataLoaded(err,data,stations){
    
    //nesting trips by start station
    var nestedData = d3.nest()
        .key(function(d){return d.startStation})
        .entries(data);
    
    var total = 0;
    
    nestedData.forEach(function(startStation){
        total = startStation.values.length;
        startStation.total = total;
    })
    
    var nestedStations = nestedData
        .sort(function(a,b){
            return d3.descending(a.total,b.total)
        })
    
    console.log(nestedStations);
    
//    var nestByEnd = d3.nest()
//        .key(function (d){return d.endStation})
//        .entries(nestedData.values);
//    
//    var newTotal = 0;
    
    var topStations = ["22","36","53","67","16","42","33","58","52","47","43"];
    
    var cf = crossfilter(data);
    
    var tripsByStart = cf
        .dimension(function(d){return d.startStation;})
        .filterFunction(function(d){return d===topStations})
        .top(Infinity);
    
    console.log(tripsByStart);
    
};



function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn
    }
};

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
};

function parseStations(d){
    //setting the mapping structure (d3.map) - a look up table
    //here setting id | lngLat, station Name
    stationLoc.set(d.id, {
        lngLat: [+d.lng, +d.lat],
        stationName: d.station
    });
};
