//1.first steps, creating canvas, calling data, parsing function
var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

//when making a module, you must reference where the module is [d3]
//here we are referencing the 
var timeseries = d3.TimeSeries()
    .valueAcc(function(d){return d.startTime;})
    .timeRange([new Date(2011,6,16), new Date(2013,11,15)])
    .binSize(d3.time.day);

d3.csv('../data/hubway_trips_reduced.csv',parse,dataLoaded);

//2.nest data in dataLoaded
function dataLoaded(err,rows){
    //want to make small multiples of histogram line graph based on start station

    //nest data to group by start station
    var nested_data = d3.nest()
        //key tells you what data to sort by 
        .key(function(d){return d.startStation;})
        //entries tells you what data to sort
        .entries(rows);
    
    //console.log(nested_data);
    
    //3.write module in TimeSeries.js 
    
    //
    var plot = d3.select('.container').selectAll('.plot')
        //will find discrepancy between data and dom elements
        .data(nested_data);
    
   //enter.append creates dom elements that house data
    plot.enter()
        .append('div').attr('class','plot');
    
    //".each" will run through each object in the array
    plot.each(function(d){
        //select (this) is selecting plot element in original var
        //we now need to bind the whole array of data from a single key to these empty dom elements
        d3.select(this)
            .datum(d.values)
            //telling our function to run this module for each instance of the datum
            .call(timeseries)
            .append('h2')
            .text(d.key);
         
        
    })
    
    
}

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

