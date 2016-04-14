// margins for timeSeries histogram
var m = {t:50,r:0,b:50,l:0},
    w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight;

// select top div 
var plot = d3.select('#plot').append('svg')
    .attr({
        width: w,
        height: h
    })
    .append('g')
    .attr('transform','translate('+m.l+','+ -m.b+')');

// create dispatcher 
var globalDispatcher = d3.dispatch('changetimeextent','changedurationextent');

// load data
queue()
    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
    //.defer(d3.csv, 'data/hubway_stations.csv', parseStations)
    .await(dataLoaded);

function dataLoaded(err,trips){  
    
     // group by start time
    var cf = crossfilter(trips),
        tripsByStartTime = cf.dimension(function(d){return d.startTime});

    // putting the date range into DOM 
    globalDispatcher.on('changetimeextent',function(extent){
        d3.select('.ranges').select('.start-date').html
        (extent[0].getFullYear()+'/'+
            (extent[0].getMonth()+1)+'/'+extent[0].getDate()+'&nbsp;-&nbsp;');
        d3.select('.ranges').select('.end-date').html(extent[1].getFullYear()+'/'+(extent[1].getMonth()+1)+'/'+extent[1].getDate());

        // filter selected trips, return the amount of trips to DOM  
        tripsByStartTime.filterRange(extent);
        d3.select('.ranges').select('.count').html(tripsByStartTime.top(Infinity).length);
    }); //end global dispatcher
    
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
