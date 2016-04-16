// margins for timeSeries histogram
var m = {t:50,r:0,b:50,l:0},
    w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight;

// margins for map 
var mapW = d3.select('#map').node().clientWidth,
    mapH = d3.select('#map').node().clientHeight;

// margins for user type bar graph
var userM = {t:0,r:0,b:0,l:0},
    userW = d3.select('#userType').node().clientWidth,
    userH = d3.select('#userType').node().clientHeight;

//define module functions
var timeSeries = d3.TimeSeries(),
    mapPlot = d3.MapPlot(),
    userTypes = d3.UserTypes();

// create dispatcher 
var globalDispatcher = d3.dispatch('changetimeextent','changedurationextent');

// load data
queue()
    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
    .defer(d3.csv, 'data/hubway_stations.csv', parseStations)
    .await(dataLoaded);

function dataLoaded(err,trips,stations){  
    
    // group by start time
    var cf = crossfilter(trips),
        tripsByStartTime = cf.dimension(function(d){return d.startTime});

    // putting the date range into DOM 
    globalDispatcher.on('changetimeextent',function(extent){
        d3.select('.ranges').select('.start-date').html
        (extent[0].getFullYear()+'/'+(extent[0].getMonth()+1)+'/'+extent[0].getDate()+'&nbsp;-&nbsp;');
        d3.select('.ranges').select('.end-date').html(extent[1].getFullYear()+'/'(extent[1].getMonth()+1)+'/'+extent[1].getDate());                            

        // filter selected trips, return the amount of trips to DOM  
        tripsByStartTime.filterRange(extent);
        
        d3.select('.ranges').select('.count').html(tripsByStartTime.top(Infinity).length);

    }); //end global dispatcher
    
    var newData = tripsByStartTime.top(Infinity);

    var nestednewData =d3.nest()
        .key(function(d){return d.startStation})
        .entries(newData);

    var total = 0;

    nestednewData.forEach(function(startStation){
        total = startStation.values.length;
        startStation.total = total;
    })
    //console.log(nestednewData)

    var nestedStations = nestednewData
        .sort(function(a,b){
            return d3.descending(a.total,b.total)
        })
    //console.log(nestedStations);

    var topStations = nestedStations.slice(0,10);
    // console.log(topStations);
    
    var KeyArray1 = [null],
        NewString1 = "";

    for(var i=0;i<topStations.length;i++){
        NewString1 = NewString1 + topStations[i].key + " ";
        //console.log(NewString1);
        KeyArray1.push(topStations[i].key);
    }

    KeyArray1.shift();
    // console.log(KeyArray1);
    // console.log(KeyArray1[0]);

    //most used endstation
    var cf =crossfilter(trips)
        tripsByStartStation = cf.dimension(function(d){return d.startStation});
        tripsByStartStation.filter(KeyArray1);
    //console.log(tripsByStartStation.top(10));
    var tripsByEndStation = cf.dimension(function(d){return d.endStation});

    //now group by end stations, on the dimension you just created
    var tripsGroupByEndStation = tripsByEndStation.group();

    //console.log(tripsGroupByEndStation.top(10));

    var KeyArray2 = [null],
        NewString2 = "";

    for(var i=0;i<tripsGroupByEndStation.top(10).length;i++){
        NewString2 = NewString2 + tripsGroupByEndStation.top(10)[i].key + " ";
        //console.log(NewString2);
        KeyArray2.push(tripsGroupByEndStation.top(10)[i].key);
    }

    KeyArray2.shift();
    // console.log(KeyArray2);
    // console.log(KeyArray2[0]);   
    
    // filtering data for userTypeGraphs
    var crossF = crossfilter(topStations),
        byUserType = crossF.dimension(function(d){return d.userType});
    
    var casualUser = byUserType.filter('Casual').top(Infinity),
        numCasualUser = casualUser.length;
    
    byUserType.filter(null);
    
    var regUser = byUserType.filter('Registered').top(Infinity),
        numRegUser = regUser.length;
   
    var userTypes = [numCasualUser,numRegUser];
    
    
    // select timeSeries div 
    var plot = d3.select('#plot');

    // select user type graph div
    var userTypePlot = d3.select('#userType')
        .append('svg')
        .attr({ width: userW, height: userH });

    //select map div
    var map = d3.select('#map');
    
    //appending global timeseries histogram
    plot.call(topHistogram);
    
    // append map & stations
    map.call(mapPlot);
    
    // append user type graph
    userTypePlot.call(userTypes);
    
    
};

// parsing functions
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
function parseStations(d){
    return {
        lngLat: [+d.lng,+d.lat],
        stationName: d.station
    };
}
