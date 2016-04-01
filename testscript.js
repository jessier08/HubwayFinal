queue()
    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
    .await(dataLoaded)


function dataLoaded(err,data){
    
    var nestedData = d3.nest()
        .key(function(d){return d.startStation})
        //.key(function(d){return d.endStation})
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
    
    var nestedTrips = d3.nest()
        .key(function(d){return d.endStation})
        .entries(nestedStations);
    
    console.log(nestedTrips);
    
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
