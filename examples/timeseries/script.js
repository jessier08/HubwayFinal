//Task 2: use histograms to study the distributions in the hubway dataset

var m = {t:30,r:100,b:30,l:100},
    w = d3.select('.plot').node().clientWidth- m.l- m.r,
    h = d3.select('.plot').node().clientHeight - m.t - m.b;

var plot1 = d3.select('#plot-1').append('svg')
    .attr('width',w+ m.l+ m.r)
    .attr('height',h+ m.t+ m.b)
    .append('g').attr('class','histogram')
    .attr('transform','translate('+ m.l+','+ m.t+')');
var plot2 = d3.select('#plot-2').append('svg')
    .attr('width',w+ m.l+ m.r)
    .attr('height',h+ m.t+ m.b)
    .append('g').attr('class','time-series')
    .attr('transform','translate('+ m.l+','+ m.t+')');

d3.csv("../data/hubway_trips.csv", parse, dataLoaded);

function dataLoaded(err,rows){
    var bins = d3.range(0,5401,60),
        ticks = bins.filter(function(v,i){
            return i%4==0;
        });
    var histogram = d3.layout.histogram()
        .value(function(d){ return d.duration })
        .range([0,5400])
        .bins(bins);

    var data = histogram(rows);

    var scaleX = d3.scale.linear().domain([0,5400]).range([0,w]),
        scaleY = d3.scale.linear().domain([0,d3.max(data,function(d){return d.y})]).range([h,0]);

    var axisX = d3.svg.axis()
        .orient('bottom')
        .scale(scaleX)
        .tickValues(ticks)
        .tickFormat(function(t){return t/60;})

    plot1.selectAll('.bin')
        .data(data)
        .enter()
        .append('rect')
        .attr('class','bin')
        .attr('x',function(d){return scaleX(d.x)+1})
        .attr('width',function(d){return scaleX(d.dx)-2})
        .attr('y',function(d){return scaleY(d.y)})
        .attr('height',function(d){return h-scaleY(d.y)})
        .on('click',function(d){console.log(d.x)})
        .style('fill','rgb(230,230,230)')

    plot1.append('g').attr('class','axis axis-x')
        .attr('transform','translate(0,'+h+')')
        .call(axisX);

    //Draw the time series
    var timeSeries = (d3.layout.histogram()
        .range([new Date(2011,6,28), new Date(2013,6,28)])
        .value(function(d){ return d.startTime})
        .bins(d3.range(new Date(2011,6,28), new Date(2013,6,28), 1000*3600*24)))(rows);

    console.log(timeSeries);

    var x2 = d3.scale.linear().domain([new Date(2011,6,28), new Date(2013,6,28)]).range([0,w]),
        y2 = d3.scale.linear().domain([0,d3.max(timeSeries,function(d){return d.y})]).range([h,0]);

    var line = d3.svg.line().x(function(d){return x2(d.x+ d.dx/2)}).y(function(d){return y2(d.y)}).interpolate('basis');
        area = d3.svg.area().x(function(d){return x2(d.x+ d.dx/2)}).y1(function(d){return y2(d.y)}).y0(h).interpolate('basis');

    plot2.append('path').datum(timeSeries).attr('class','area').attr('d',area).style('fill','rgba(120,120,120,.1)')
    plot2.append('path').datum(timeSeries).attr('class','line').attr('d',line).style('fill','none').style('stroke','rgb(120,120,120').style('stroke-width','1px');



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
