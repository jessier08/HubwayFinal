
// margins and div selection for timeSeries histogram
var m = {t:50,r:0,b:50,l:0},
    w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight,
    plot = d3.select('#plot').append('svg')
        .attr({width: w, height: h})
        .append('g')
        .attr('transform','translate('+m.l+','+ -m.b+')');

// margins and div selection for map
var mapW = d3.select('#map').node().clientWidth,
    mapH = d3.select('#map').node().clientHeight,
    map = d3.select('#map')
        .append('svg')
        .attr('width', mapW)
        .attr('height', mapH);

// margins and div selection for map
var linesW = d3.select('#lineBox').node().clientWidth,
    linesH = d3.select('#lineBox').node().clientHeight,
    stationLines = d3.select('#lineBox')
        .append('svg')
        .attr('class','visibleLine')
        .attr('width', linesW)
        .attr('height', linesH);

// create dispatcher 
var globalDispatcher = d3.dispatch('changetimeextent');

// create map for station names
var stationsName = d3.map(),
    stationsSpot = d3.map();

////// LOAD DATA //////
queue()
    .defer(d3.csv,'../data/hubway_trips_reduced.csv',parse)
    .defer(d3.csv,'../data/hubway_stations_namesEdit.csv',parseStations)
    .await(dataLoaded);

function dataLoaded(err,trips,stations){
    
    //console.log(trips);
    
    // tells map to look for start and end station
    trips.forEach(function(d){
        d.startStationName = stationsName.get(d.startStation);
        d.endStationName = stationsName.get(d.endStation);
    })
    
    trips.forEach(function(d){
        d.stationLng = stationsSpot.get(d.startStation);
        d.stationLat = stationsSpot.get(d.endStation);
    })
    
////// DATA FILTERING / SORTING //////
    // crossfilter by start time
    var cf = crossfilter(trips),
        tripsByStartTime = cf.dimension(function(d){return d.startTime});

    // START GLOBAL DISPATCH //
    // putting the date range into DOM 
    globalDispatcher.on('changetimeextent',function(extent){
        d3.select('.ranges').select('.start-date')     
            .html(extent[0].getMonth()+1+'/'+extent[0].getDate()+'/'+extent[0].getFullYear()+' - ');
        d3.select('.ranges').select('.end-date')
            .html(extent[1].getMonth()+1+'/'+extent[1].getDate()+'/'+extent[1].getFullYear());
         
        // filter selected trips, return the amount of trips to DOM  
        tripsByStartTime.filterRange(extent);
        // putting trip count into DOM 
        d3.select('.ranges').select('.count').html(tripsByStartTime.top(Infinity).length);

        // new data is filtered by user's brush extent
        var newData = tripsByStartTime.top(Infinity);
        
        // nest brushed data filtered by start stations
        var nestednewData = d3.nest()
            .key(function(d){return d.startStation})
            .entries(newData);

        var total = 0;

        // calculate most frequently used start stations
        nestednewData.forEach(function(startStation){
            startStation.name = startStation.values[0].startStationName
            total = startStation.values.length;
            startStation.total = total;
        })

        // sort most frequent used start stations in descending order
        var nestedStations = nestednewData
            .sort(function(a,b){
                return d3.descending(a.total,b.total)
            })

        // get most freq start stations
        var topStations = nestedStations.slice(0,5);
        //console.log(topStations);
        
        // placeholders for start station names
        var topStationsArray = [],
            topStationsString = "";
        
        //console.log(topStations);
        
        // put the top station names in an array that will be used to print to DOM
        for(var i=0;i<topStations.length;i++){
            topStationsString = topStationsString + topStations[i].name + " ";
            topStationsArray.push(topStations[i].name);
        }
        
       // make crossfilter to find most freq end stations from top station list
        var cf = crossfilter(trips)
            tripsByStartStation = cf
                .dimension(function(d){return d.startStationName}),
            tripsByStartStation.filter(topStationsArray);
        
        // start filtering data by end station
        var tripsByEndStation = cf.dimension(function(d){return d.endStationName});

        // now group by end stations, return most frequent stations 
        var tripsGroupByEndStation = tripsByEndStation.group(),
            topEndStations = tripsGroupByEndStation.top(15);
        
        // placeholders for end station names
        var topEndStationsArray = [],
            topEndStationsString = "";

        // fill top end stations array
        for(var i=0;i<topEndStations.length;i++){
            topEndStationsString = topEndStationsString + topEndStations[i].key + " ";
            //console.log(topEndStationsString);
            topEndStationsArray.push(topEndStations[i].key);
        }
 
        
////// PLOTTING POPULAR STATION TEXT //////
        if (nestednewData.length==0){
            if (d3.select('.startText')) {
            d3.select('.startText').remove();
            d3.select('.endText').remove(); 
            }
            return;
        }
        // start stations   
        var startText = d3.select('#startBox')
            .selectAll('.startText')
            .data(topStations);
        
        startText.enter()
            .append('div')
        
        startText
            .text(function(d){return d.name;})
            .attr('class','stationText startText')
            .attr('id',function(d){
                return [d3.select(this).node().getBoundingClientRect().right, d3.select(this).node().getBoundingClientRect().top];
            })
            .on('mouseover', function(d){
                d3.select(this).attr('class','green');
                d3.select('#stationDot'+d.key).attr('r',6).attr('class','greenCircle');
            
                var newCross = crossfilter(trips);
            
                var tripsByThisStation = newCross.dimension(function(d){return d.startStationName});
                tripsByThisStation.filter(d.name);

                var tripsByEndStationforThis = newCross.dimension(function(d){return d.endStationName});

                //now group end stations, creates value on the key
                var tripsGroupByEndStationForThis = tripsByEndStationforThis.group();

                console.log(tripsGroupByEndStationForThis.top(3));
            
                var topEndingforThisArray = [],
                    topEndingforThisString = "";

                for(var i=0;i<tripsGroupByEndStationForThis.top(3).length;i++){
                    topEndingforThisString = topEndingforThisString + tripsGroupByEndStationForThis.top(3)[i].key + " ";
                    topEndingforThisArray.push(tripsGroupByEndStationForThis.top(3)[i].key);
                }

                //console.log(topEndingforThisArray);
            })
            .on('mouseout', function(d){
                d3.select(this).attr('class','startText stationText');
                d3.select('#stationDot'+d.key).attr('r',3).attr('class','circle');
            });
        
        // end stations 
        var endText = d3.select('#endBox')
            .selectAll('.endText')
            .data(topEndStationsArray)
        
        endText.enter()
            .append('div')
        
        endText
            .text(function(d){return d;})
            .attr('class','stationText endText');

        
////// PLOTTING STATION DOTS ON MAP //////
        if(d3.select('.circle')){d3.select('.circle').remove();};
          
        var stationDots = map.append('g').attr('class','circle');
        
        stationDots.selectAll('.circle')
            .data(stations)
            .enter()
            .append('circle')
            .attr('id',function(d){ return 'stationDot'+d.id;})
            .attr('r',3)
             .attr('cx', function(d){
                var xy = albersProjection(d.lngLat);
                return xy[0]})
            .attr('cy', function(d){
                var xy = albersProjection(d.lngLat);
                return xy[1]});  
        
    }); // end global dispatch 

    
////// ALL TRIPS HISTOGRAM WITH BRUSH //////
    // create inputs for start-date histogram
    var timeExtent = [new Date(2011,5,20),new Date(2013,12,30)],
        binSize = d3.time.day,
        bins = d3.time.day.range(timeExtent[0],timeExtent[1]);

    // scales and axis
    var scaleX = d3.time.scale().domain(timeExtent).range([0,w]),
        scaleY = d3.scale.linear().range([h,60]),
        axisX = d3.svg.axis()
            .scale(scaleX)
            .orient('bottom')
            .tickFormat(function(tick){
                if(tick.getMonth()===0) 
                return (tick.getMonth()+1) + ' / ' + tick.getFullYear()  ;   
                return tick.getMonth()+1;
            })
    
    // create histogram layout
    var layout = d3.layout.histogram()
        .value(function(d){return d.startTime})
        .range(timeExtent)
        .bins(bins);

    // bind data to histogram layout
    var data = layout(trips),
        maxY = d3.max(data,function(d){return d.y});

    scaleY.domain([0,maxY]);

    // draw histogram elements
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
    
    d3.selectAll('.tick > text').attr('class','axisFont');
    
    // implement brush
    var brush = d3.svg.brush()
        .x(scaleX)
        .on('brush',brushmove);

    plot.append('g').attr('class','brush')
        .call(brush)
        .selectAll('rect')
        .attr('height', h);

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
    };
    

////// APPENDING MAP //////        
    // creating projection for boston 
    var albersProjection = d3.geo.albers()
        .scale( 400000 )
        .rotate( [71.057,0] )
        .center( [-0.030, 42.347] )
        .translate( [mapW/2,mapH/2] );

    var geoPath = d3.geo.path()
        .projection(albersProjection);

    // drawing boston neighborhoods
    var neighborhoods = map.append('g').attr('id', 'neighborhoods');

    neighborhoods.selectAll('path')
        .data(neighborhoods_json.features)
        .enter()
        .append('path')
        .attr('d', geoPath);
    
    // load page with data rendering from full brush extent
    var init_timeExtent = [new Date(2011,7,20),new Date(2013,7,20)]
    
    $(document).ready(function() {
        globalDispatcher.changetimeextent(init_timeExtent)
    }); 
    
}; // end dataLoaded


// PARSING FUNCTIONS
function parse(d){
    
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn
    };
}
function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

function parseStations(d){
    //setting values for earlier defined map 
    stationsName.set(d.id,d.station);
    stationsSpot.set(d.id,+d.lng,+d.lat);
    
    return {
        lngLat: [+d.lng,+d.lat],
        //lat: +d.lat,
        stationName: d.station,
        id: d.id
    }; 
}