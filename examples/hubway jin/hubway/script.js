var m = {t:50,r:0,b:50,l:0},
    w = d3.select('.plot').node().clientWidth - m.l - m.r,
    h = d3.select('.plot').node().clientHeight - m.t - m.b;


var plot = d3.select('.plot').append('svg')
    .attr({
        width: w + m.l + m.r,
        height: h + m.t + m.b
    })
    .append('g')
    .attr('transform','translate('+ m.l+','+ m.t+')');

var canvas = d3.select('.plot')
        .append('canvas')
        .attr('width',w)
        .attr('height',h+800)
        .node(),
    ctx = canvas.getContext('2d');

var stationLoc = d3.map();

//Geo
var projection = d3.geo.mercator()
    .translate([w-100,h+120])
    .scale(340000)
    .center([-71.071930,42.351052]);


var globalDispatcher = d3.dispatch('changetimeextent');


d3_queue.queue()
    .defer(d3.csv,'../data/hubway_trips_reduced.csv',parse)
    .defer(d3.csv,'../data/hubway_stations.csv',parseStations)
    .await(dataLoaded);

function dataLoaded(err,rows,stations){
    /*var nestedData = d3.nest()
        .key(function(d){return d.startStation})
        .entries(rows);
    var total = 0;
    
    nestedData.forEach(function(startStation){
        total = startStation.values.length;
        startStation.total = total;
    })
    
    console.log(nestedData)
    var nestedStations = nestedData
        .sort(function(a,b){
            return d3.descending(a.total,b.total)
        })
    console.log(nestedStations);*/
    
    
    stationLoc.entries().forEach(function(st){

            var xy = projection(st.value);
            ctx.strokeStyle='rgba(0,0,0,.6)';
            ctx.beginPath();
            ctx.arc(xy[0],xy[1],2,0,Math.PI*2);
            ctx.stroke();

        });
    
   var scaleSize = d3.scale.sqrt().domain([0,600]).range([0,20])
   stationLoc.entries().forEach(function(st){
         
                ctx.globalAlpha = .8;

                var xy = projection(st.value.lngLat);
                ctx.fillStyle='rgba(0,0,0,.8)';
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],2,0,Math.PI*2);
                ctx.fill();

                /*ctx.strokeStyle='red';
                ctx.beginPath();
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],scaleSize(st.value.origin),0,Math.PI*2);
                ctx.stroke();

                ctx.strokeStyle='blue';
                ctx.beginPath();
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],scaleSize(st.value.dest),0,Math.PI*2);
                ctx.stroke();*/

            }); 
    
    
    
    
    var cf = crossfilter(rows),
        tripsByStartTime = cf.dimension(function(d){return d.startTime});
    //console.log(cf)
    globalDispatcher.on('changetimeextent',function(extent){
        console.log(extent[0]);
        //console.log(extent[1]);
        d3.select('.controls').select('.start-date').html(extent[0].getFullYear()+'/'+(extent[0].getMonth()+1)+'/'+extent[0].getDate());
        d3.select('.controls').select('.end-date').html(extent[1].getFullYear()+'/'+(extent[1].getMonth()+1)+'/'+extent[1].getDate());

        tripsByStartTime.filterRange(extent);
        d3.select('.controls').select('.count').html(tripsByStartTime.top(Infinity).length);
        //console.log(tripsByStartTime.top(Infinity))
    
    var newData = tripsByStartTime.top(Infinity)
      
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
    
    console.log(topStations);
    var KeyArrary = [null];

    var NewString = "";    
        
    for(var i=0;i<topStations.length;i++)
        {
            NewString = NewString + topStations[i].key + " ";
            KeyArrary.push(topStations[i].key);
        }
        
    KeyArrary.shift();
    
    console.log(KeyArrary);
        
//    d3.select(".plot")
//    .data(KeyArrary)
//    .enter()
//    .append("class","text")
//    .text(function(d){return d;})
        
    d3.selectAll(".text")
    .text('');
    
        
    var svgText = d3.select(".canvas")
    .append('svg')
    .attr("width",w+40)  
    .attr("height",h+100); 
        
        
        
    var Firsttext = d3.select(".svg")
    .data(KeyArrary)
    .enter()
    .append("text")   
    .attr("x",0)  
    .attr("y",0)      
    .attr("class","text")
    .text(function(d)
    {
        return d;
    })
    
    //.attr("font-size",30)  
    //.attr("font-family","simsun") ;
        
    /*var StringData = NewString.split(",");
        
        StringData.pop();
        console.log(StringData);
        
        Firsttext.selectAll("tspan")
        .data(StringData)
        .enter()
        .append('tspan')
        .attr('class','tspan')
        .attr('x',0)
        .attr('y',0)
        .attr('dy','1em')
        .text(function(d){
            return d;
        })*/
          
        
//        tsapn
   
    
    
    /*var et = crossfilter(rows),
        tripsByEndTime = et.dimension(function(d){d.endStation});
        tripsByEndTime.filter(topStations.startStation);
        console.log(tripsByEndTime.top(3))*/
        
    
        
        
    //begin to draw the stations
    });

   
    //Draw startTime histogram
    var timeExtent = [new Date(2011,6,15),new Date(2012,6,15)],
        binSize = d3.time.day,
        bins = d3.time.day.range(timeExtent[0],timeExtent[1]);
    bins.push(timeExtent[1]);

    //Scales and axis
    var scaleX = d3.time.scale().domain(timeExtent).range([0,w]),
        scaleY = d3.scale.linear().range([h,0]);

    var axisX = d3.svg.axis()
        .scale(scaleX)
        .orient('bottom')
        .tickFormat(function(tick){
            if(tick.getMonth()===0) return tick.getFullYear() + ' / ' + (tick.getMonth()+1);
            return tick.getMonth()+1;
        })

    //Draw a time series
    var layout = d3.layout.histogram()
        .value(function(d){return d.startTime})
        .range(timeExtent)
        .bins(bins);
    var data = layout(rows),
        maxY = d3.max(data,function(d){return d.y});

    scaleY.domain([0,maxY]);

    //Draw
    var bars = plot.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect').attr('class','bar')
        .attr('x',function(d){return scaleX(d.x)})
        .attr('y',function(d){return scaleY(d.y)})
        .attr('width',1)
        .attr('height',function(d){return h-scaleY(d.y)});

    plot.append('g').attr('class','axis axis-x')
        .attr('transform','translate(1,'+h+')')
        .call(axisX);

    //Brush
    var brush = d3.svg.brush()
        .x(scaleX)
        .on('brush',brushmove);

    plot.append('g').attr('class','brush')
        .call(brush)
        .selectAll('rect')
        .attr('height',h);

    function brushmove(){
        var extent = brush.extent();

        bars
            .attr('class','bar')
            .attr('width',1)
            .filter(function(d){
                return d.x > extent[0] && d.x < extent[1]
            })
            .attr('class','bar highlight')
            .attr('width',2)

        globalDispatcher.changetimeextent(extent);
    }
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

function parseStations(s){
    d3.select('.start')
        .append('option')
        .html(s.station)
        .attr('value', s.id);
    d3.select('.end')
        .append('option')
        .html(s.station)
        .attr('value', s.id);
   }
function parseStations(d){
    stationLoc.set(d.id, {
        origin:0,
        dest:0,
        lngLat: [+d.lng, +d.lat]
    });
}
