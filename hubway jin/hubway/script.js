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

/*var plot1 = d3.select('#time').append('svg')
    .attr('width',w+ m.l+ m.r)
    .attr('height',h+ m.t+ m.b)
    .append('g').attr('class','histogram')
    .attr('transform','translate('+ m.l+','+ m.t+')');*/

// create dispatcher 
var globalDispatcher = d3.dispatch('changetimeextent');



stationsName = d3.map();
// load data
var queue = d3_queue.queue()
    .defer(d3.csv,'../data/hubway_trips_reduced.csv',parse)
    .defer(d3.csv,'../data/hubway_stations.csv',parseStations)
    .await(dataLoaded);

function dataLoaded(err,trips,stations){
    
    
    trips.forEach(function(d){
        d.startStationName = stationsName.get(d.startStation);
        d.endStationName = stationsName.get(d.endStation);
    })
    //console.log("trips",trips)
    
////// ALL TRIPS HISTOGRAM WITH BRUSH //////    
    // group by start time
    var cf = crossfilter(trips),
        tripsByStartTime = cf.dimension(function(d){return d.startTime});
        //tripsByDuration = cf.dimension(function(d){return d.duration});

    // putting the date range into DOM 
    globalDispatcher.on('changetimeextent',function(extent){
        d3.select('.ranges').select('.start-date').html
        (extent[0].getFullYear()+'/'+
        (extent[0].getMonth()+1)+'/'+extent[0].getDate()+'&nbsp;-&nbsp;');
        d3.select('.ranges').select('.end-date').html(extent[1].getFullYear()+'/'+(extent[1].getMonth()+1)+'/'+extent[1].getDate());

        // filter selected trips, return the amount of trips to DOM  
        tripsByStartTime.filterRange(extent);
        d3.select('.ranges').select('.count').html(tripsByStartTime.top(Infinity).length);

        var newData = tripsByStartTime.top(Infinity)

        var nestednewData =d3.nest()
            .key(function(d){return d.startStation})
            .entries(newData);

        var total = 0;

        nestednewData.forEach(function(startStation){
//            console.log("startStation", startStation)
            startStation.name = startStation.values[0].startStationName
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

        console.log("topStations",topStations);
        
        
        //keyarrary1
        var KeyArray1 = [null];

        var NewString1 = "";

        for(var i=0;i<topStations.length;i++)
        {
            NewString1 = NewString1 + topStations[i].name + " ";
            //console.log(NewString1);
            KeyArray1.push(topStations[i].name);
        }

        KeyArray1.shift();

        console.log(KeyArray1);
        console.log(KeyArray1[0]);
        



       //most used endstation
        var cf =crossfilter(trips)
        tripsByStartStation = cf.dimension(function(d){return d.startStationName});
        tripsByStartStation.filter(KeyArray1);
        //console.log(topStations.key)
        console.log(tripsByStartStation.top(10));
        var tripsByEndStation = cf.dimension(function(d){return d.endStationName});

        //now group by end stations, on the dimension you just created
        var tripsGroupByEndStation = tripsByEndStation.group();

        console.log(tripsGroupByEndStation.top(10));

        var KeyArray2 = [null];

        var NewString2 = "";

        for(var i=0;i<tripsGroupByEndStation.top(10).length;i++)
        {
            NewString2 = NewString2 + tripsGroupByEndStation.top(10)[i].key + " ";
            //console.log(NewString2);
            KeyArray2.push(tripsGroupByEndStation.top(10)[i].key);
        }

        KeyArray2.shift();

        console.log(KeyArray2);
        console.log(KeyArray2[0]);
        
        
        //single keyarray
        tripsByStartStation1 = cf.dimension(function(d){return d.startStationName});
        tripsByStartStation1.filter(KeyArray1[0]);
        //console.log(topStations.key)
        //console.log(tripsByStartStation1.top(5));
        var tripsByEndStation1 = cf.dimension(function(d){return d.endStationName});

        //now group by end stations, on the dimension you just created
        var tripsGroupByEndStation1 = tripsByEndStation1.group();

        var KeyArray11 = [null];

        var NewString11 = "";

        for(var i=0;i<tripsGroupByEndStation.top(5).length;i++)
        {
            NewString11 = NewString11 + tripsGroupByEndStation1.top(5)[i].key + " ";
            //console.log(NewString2);
            KeyArray11.push(tripsGroupByEndStation1.top(5)[i].key);
        }

        KeyArray11.shift();

        console.log(KeyArray11);
        console.log(KeyArray11[0]);
        
        
        



        //write startstations text
        if(d3.select('#starttext'))
        {
            d3.select('#starttext')
                .remove();

            d3.select('#endstart')
                .remove();
        }

        if(d3.select('#start'))
        {
            d3.select('#start')
                .remove();

            d3.select('#end')
                .remove();
        }


        var svg = d3.select("#stations")
            .append('svg')
            .attr('id','start')
            .attr("width",425)
            .attr("height",400);

        var FirstText =svg.append("text")
            .attr("id","starttext")
            .attr("width",40)
            .attr("height",200)
            .on("click",function()
            {
                svg.append("line")
                   .attr("x1",function(d,i){return d.id})
                   .attr("y1",function(d,i){})
                   .attr("x2",function(d,i){return d.id})
                   .attr("y2",function(d,i){return d.id})
            });

        FirstText.selectAll("tspan")
            .data(KeyArray1)
            .enter()
            .append("tspan")
            .attr("x",FirstText.attr("width"))
            .attr("dy","3.5em")
            .attr("id",function(d,i)
            {
                return i;
            })
            .text(function(d){
                return d;
            })
            .attr("font-size",10)
            .attr("font-family","Helvetica");


        //write endstations text
        var svg = d3.select("#stations")
            .append('svg')
            .attr('id','end')
            .attr("width",425)
            .attr("height",400)
            .style("margin-left",-180)
            .style("margin-top",0)
            .style("position","absolute");

        var SecondText =svg.append("text")
            .attr("id","endtext")
            .attr("width",40)
            .attr("height",200);

        SecondText.selectAll("tspan")
            .data(KeyArray2)
            .enter()
            .append("tspan")
            .attr("id",function(d,i)
            {
                  return i;
            })
            .attr("x",SecondText.attr("width"))
            .attr("dy","3.5em")
            .text(function(d){
                return d;
            })
            .attr("font-size",10)
            .attr("font-family","Helvetica");


    });

    // create inputs for start-date histogram

    var timeExtent = [new Date(2011,7,20),new Date(2013,7,20)],
        binSize = d3.time.day,
        bins = d3.time.day.range(timeExtent[0],timeExtent[1]);

    // scales and axis
    var scaleX = d3.time.scale().domain(timeExtent).range([0,w]),
        scaleY = d3.scale.linear().range([h,0]);

    var axisX = d3.svg.axis()
        .scale(scaleX)
        .orient('bottom')
        .tickFormat(function(tick){
            if(tick.getMonth()===0) return tick.getFullYear() + ' / ' + (tick.getMonth()+1);
            return tick.getMonth()+1;
        })

    // create histogram function
    var layout = d3.layout.histogram()
        .value(function(d){return d.startTime})
        .range(timeExtent)
        .bins(bins);

    // bind data to histogram layout
    var data = layout(trips),
        maxY = d3.max(data,function(d){return d.y});

    scaleY.domain([0,maxY]);

    // draw
    var bars = plot.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect').attr('class','bar')
        .attr('x',function(d){return scaleX(d.x)})
        .attr('y',function(d){return scaleY(d.y)})
        .attr('width',1)
        .attr('height',function(d){return h-scaleY(d.y)});

    plot.append('g').attr('class','axis axis-x')
        .attr('transform','translate(0,'+h+')')
        .call(axisX);

    // brush
    var brush = d3.svg.brush()
        .x(scaleX)
        .on('brush',brushmove);

    plot.append('g').attr('class','brush')
        .call(brush)
        .selectAll('rect')
        .attr('height',h);

    function brushmove() {
        var extent = brush.extent();

        bars
            .attr('class', 'bar')
            .attr('width', 1)
            .filter(function (d) {
                return d.x > extent[0] && d.x < extent[1]
            })
            .attr('class', 'bar highlight')
            .attr('width', 2)

        globalDispatcher.changetimeextent(extent);


    }



        /*var layout = d3.layout.histogram()
            .value(function(d){return d.startTime})
            .range([new Date(2011,6,28),new Date(2013,11,31)])
            .bins(d3.range(new Date(2011,6,28), new Date(2013,11,31), 1000*3600*24));

        var timeSeries = layout(trips);

        //Scale and axis
        var scaleX = d3.time.scale().domain([new Date(2011,6,28),new Date(2013,11,31)]).range([0,w]),
            scaleY = d3.scale.linear().domain([0,d3.max(timeSeries,function(d){return d.y})]).range([h,0]);
        var axisX = d3.svg.axis()
            .orient('bottom')
            .scale(scaleX)
            .ticks(d3.time.hours)
            .tickFormat(function(v){
                return v.getFullYear() + '-' + (v.getMonth()+1)
            });

        //Generator
        var line = d3.svg.line()
            .x(function(d){return scaleX(d.x + d.dx/2)})
            .y(function(d){return scaleY(d.y)})
            .interpolate('basis');
        var area = d3.svg.area()
            .x(function(d){return scaleX(d.x + d.dx/2)})
            .y1(function(d){return scaleY(d.y)})
            .y0(h)
            .interpolate('basis');

        //append DOM
        plot1.append('path').attr('class','area').datum(timeSeries).attr('d',area);
        plot1.append('path').attr('class','line').datum(timeSeries).attr('d',line);

        plot1.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisX);

        var target = plot1.append('g').attr('class','target');
        target.append('circle').attr('r',2);
        target.append('text').attr('text-anchor','middle').attr('dy',-15);

        //Interaction
        var bisector = d3.bisector(function(d){return d.x}).left;

        plot1.append('rect').attr('width',w).attr('height',h).style('fill-opacity',0)
            .on('mousemove',function(){
                var date = scaleX.invert(d3.mouse(plot1.node())[0]);

                var i = bisector(timeSeries, date);

                var x = scaleX(timeSeries[i].x + timeSeries[i].dx/2),
                    y = scaleY(timeSeries[i].y);

                target.attr('transform','translate('+x+','+y+')')
                    .select('text').text((new Date(timeSeries[i].x)).toString() + ' : ' + timeSeries[i].y);
            })


         
        //console.log(extent[0],extent[1]);*/

    
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
        birthDate:+d.birth_date,
        data:d3.map
    };
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

function parseStations(d){
    //console.log("d",d)
    stationsName.set(d.id,d.station); 
   return {
       id: d.id,
       stationName:d.station
   };
  
}

//function parseStations(s){
//    d3.select('.station-list')
//        .append('option')
//        .html(s.station)
//        .attr('value', s.id);
//}