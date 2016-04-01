var w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight;

var canvas = d3.select('#plot')
        .append('canvas')
        .attr('width',w)
        .attr('height',h)
        .node(),
    ctx = canvas.getContext('2d');

var stationLoc = d3.map();

//Geo
var projection = d3.geo.mercator()
    .translate([w/2,h/2])
    .scale(400000)
    .center([-71.071930,42.351052]);


var queue = d3_queue.queue()
    .defer(d3.csv, "../data/hubway_trips_reduced.csv",parse)
    .defer(d3.csv, "../data/hubway_stations.csv",parseStations)
    .await(function(err,trips,stations){

        stationLoc.entries().forEach(function(st){

            var xy = projection(st.value);
            ctx.strokeStyle='rgba(80,80,80,.1)';
            ctx.beginPath();
            ctx.arc(xy[0],xy[1],2,0,Math.PI*2);
            ctx.stroke();

        });

        //Animation
        var cf = crossfilter(trips),
            tripsByStartTime = cf.dimension(function(d){return d.startTime}),
            tripsByEndTime = cf.dimension(function(d){return d.endTime});


        var t = (new Date(2012,6,15)).getTime(),
            speed = 100000,
            scaleOpacity = d3.scale.linear().domain([0,86400000]).range([1,0]).clamp(true),
            scaleSize = d3.scale.sqrt().domain([0,600]).range([0,20]),
            linearGradient;

        draw();

        function draw(){
            ctx.clearRect(0,0,w,h);

            tripsByStartTime.filter([-Infinity,t]);
            tripsByEndTime.filter([t-86400000,Infinity]);


            //Draw stations
            stationLoc.entries().forEach(function(st){

                ctx.globalAlpha = .5;

                var xy = projection(st.value.lngLat);
                ctx.fillStyle='rgba(80,80,80,.5)';
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],2,0,Math.PI*2);
                ctx.fill();

                ctx.strokeStyle='red';
                ctx.beginPath();
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],scaleSize(st.value.origin),0,Math.PI*2);
                ctx.stroke();

                ctx.strokeStyle='blue';
                ctx.beginPath();
                ctx.beginPath();
                ctx.arc(xy[0],xy[1],scaleSize(st.value.dest),0,Math.PI*2);
                ctx.stroke();

            });


            //Draw trips
            tripsByStartTime.top(Infinity).forEach(function(_trip){
                if(!_trip.counted){
                    stationLoc.get(_trip.startStation).origin += 1;
                    stationLoc.get(_trip.endStation).dest += 1;
                }
                _trip.counted = true;

                var loc1 = projection( stationLoc.get(_trip.startStation).lngLat ),
                    loc2 = projection( stationLoc.get(_trip.endStation).lngLat ),
                    pct = (t - _trip.startTime)/(_trip.endTime - _trip.startTime)>1?1:(t - _trip.startTime)/(_trip.endTime - _trip.startTime);

                linearGradient = ctx.createLinearGradient(loc1[0],loc1[1],loc2[0],loc2[1]);
                linearGradient.addColorStop(0,'red');
                linearGradient.addColorStop(.5,'white');
                linearGradient.addColorStop(1,'blue');

                ctx.beginPath();
                ctx.strokeStyle = t>_trip.endTime?'rgba(80,80,80,.2)':linearGradient;
                ctx.globalAlpha = scaleOpacity(t - _trip.endTime);
                ctx.moveTo(loc1[0],loc1[1]);
                ctx.lineTo((loc2[0]-loc1[0])*pct+loc1[0], (loc2[1]-loc1[1])*pct+loc1[1]);
                ctx.stroke();
            });

            t += speed;

            window.requestAnimationFrame(draw);
        }


    })

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

    return (new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1])).getTime();
}

function parseStations(d){
    stationLoc.set(d.id, {
        origin:0,
        dest:0,
        lngLat: [+d.lng, +d.lat]
    });
}
