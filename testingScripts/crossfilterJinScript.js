//console.log('Homework 2-A...')
var trips;
var timeExtent = [new Date(2012,12,01),new Date(2013,12,01)];

/*var margin={t:50,r:50,b:50,l:50};
var width=$('.plot').width()-margin.r-margin.l;
    height=$('.plot').height()-margin.t-margin.b;

var plot = d3.select('.plot')
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height+margin.t+margin.b)
    .append('g')
    .attr('class','plot')
    .attr('transform','translate('+margin.l+','+margin.t+')');*/


d3.csv('../data/hubway_trips_reduced.csv',parse,dataLoaded);


function dataLoaded(err,rows){
    
    //console.log(rows);
    
    //grouping data by start Station
    var nest = d3.nest()
        .key(function(d){return d.startStation})
        .entries(rows);
    
    //creating counter to find most used startStations
    var total = 0;

    nest.forEach(function(startStation){
        total = startStation.values.length;
        startStation.total = total;
    })

    var nestedStations = nest
        .sort(function(a,b){
            return d3.descending(a.total,b.total)
        })
    
    // taking only the top 10 stations in nested array 
    var topStations = nestedStations.slice(0,10);
    
    //console.log(topStations);
    
    var nestedEndStations;
    
    topStations.forEach(function(e){
        
        //console.log(e);
        
        var values = e.values;
        
        //console.log(values);
        
        values.forEach(function(f){
            var endNest = d3.nest()
                .key(function(d){return d.endStation})
                .entries(f);
            
            var endTotal = 0;

            endNest.forEach(function(startStation){
                endTotal = startStation.values.length;
                startStation.total = endTotal;
            })

            nestedEndStations = endNest
                .sort(function(a,b){
                    return d3.descending(a.total,b.total)
                })
        })
        
        console.log(nestedEndStations);

    })
    
    
//    
//    endNest.forEach(function(endStation){
//        endTotal = endStation.values.length;
//        endStation.total = endTotal;
//    })
//    
//    var endNestStations = endNest
//        .sort(function(a,b){
//            return d3.descending(a.total,b.total)
//        })
// 
//    console.log(endNestStations);
    
}




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

