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

////// ALL TRIPS HISTOGRAM WITH BRUSH //////    
    // group by start time
    var cf = crossfilter(trips),
        tripsByStartTime = cf.dimension(function(d){return d.startTime}),
        tripsByDuration = cf.dimension(function(d){return d.duration});

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
            total = startStation.values.length;
            startStation.total = total;
        });

        //console.log(nestednewData)

        var nestedStations = nestednewData
            .sort(function(a,b){
                return d3.descending(a.total,b.total)
            });
        //console.log(nestedStations);

        var topStations = nestedStations.slice(0,10);

        console.log(topStations);
        var KeyArray = [null];

        var NewString = "";

        for(var i=0;i<topStations.length;i++)
        {
            NewString = NewString + topStations[i].key + " ";
            console.log(NewString);
            KeyArray.push(topStations[i].key);

        }

        KeyArray.shift();

        //console.log(KeyArray[1]);

        var cf =crossfilter(trips);
        tripsByStartStation = cf.dimension(function(d){return d.startStation});
        tripsByStartStation.filter("KeyArray[0]");
        var tripsByEndStation = cf.dimension(function(d){return d.endStation});

        //now group by end stations, on the dimension you just created
        var tripsGroupByEndStation = tripsByEndStation.group();

        console.log(tripsGroupByEndStation.top(5));

//    d3.select(".plot")
//    .data(KeyArrary)
//    .enter()
//    .append("class","text")
//    .text(function(d){return d;})






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

        //console.log(extent[0],extent[1]);
    }

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