// load data
queue()
    .defer(d3.csv,'../data/hubway_trips_reduced.csv',parse)
    .defer(d3.csv,'../data/hubway_stations.csv',parseStations)
    .await(dataLoaded2);

// set up map to link station numbers to names & lng, lat
var stationLoc = d3.map();

function dataLoaded2(err,trips,stations){
    
    // nest trips by start station  
    var nestedData =d3.nest()
        .key(function(d){return d.startStation})
        .entries(trips);
    
    // create counter to find # of trips from stations    
    var total = 0;
    nestedData.forEach(function(startStation){
        total = startStation.values.length;
        startStation.total = total;
    })
    
    // sort stations by # of trips
    var sortedStations = nestedData
        .sort(function(a,b){
            return d3.descending(a.total,b.total)
        })
    
    // only give the top 10 stations
    var topStations = sortedStations.slice(0,10);
    
    console.log("top 10 start stations w trip arrays");
    console.log(topStations);
    
    var topStationNumbers = [],
        NewString;    
        
    for (var i=0; i<topStations.length; i++) {
            NewString = NewString + topStations[i].key + " ";
            topStationNumbers.push(topStations[i].key);
    }
    
    console.log("top 10 start station #s");
    console.log(topStationNumbers);
    
    
    
    //djfjsjkfsk
        
 
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
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}
function parseStations(d){
    //setting the mapping structure (d3.map) - a look up table
    //here setting id | lngLat, station Name
    stationLoc.set(d.id, {
        lngLat: [+d.lng, +d.lat],
        stationName: d.station
    });
}

