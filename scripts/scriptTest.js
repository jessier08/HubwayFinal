// margins and div selection for timeSeries histogram
var m = {t:50,r:0,b:50,l:0},
    w = d3.select('#plot').node().clientWidth,
    h = d3.select('#plot').node().clientHeight;

var plot = d3.select('#plot').append('svg')
    .attr({width: w, height: h})
    .append('g')
    .attr('transform','translate('+m.l+','+ -m.b+')');

// margins and div selection for map
var mapW = d3.select('#map').node().clientWidth,
    mapH = d3.select('#map').node().clientHeight;
    
var map = d3.select('#map')
    .append('svg')
    .attr('width', mapW)
    .attr('height', mapH);

// margins and div selection for map
var linesW = d3.select('#lineBox').node().clientWidth,
    linesH = d3.select('#lineBox').node().clientHeight;
    
var stationLines = d3.select('#lineBox')
    .append('svg')
    .attr('width', linesW)
    .attr('height', linesH);

// margins and div selection for gender type graph
//var genderM = {t:0,r:0,b:0,l:0},
//    genderW = d3.select('#genderType').node().clientWidth,
//    genderH = d3.select('#genderType').node().clientHeight;
//
//var genderTypePlot = d3.select('#genderType').append('svg')
//    .attr({width: userW, height: userH});
//
//var genderScaleY = d3.scale.linear().range([genderH,0]);

// margins and div selection for user type graph
//var userM = {t:0,r:0,b:0,l:0},
//    userW = d3.select('#userType').node().clientWidth,
//    userH = d3.select('#userType').node().clientHeight;
//
//var userTypePlot = d3.select('#userType').append('svg')
//    .attr({width: userW, height: userH});
//
//var userScaleY = d3.scale.linear().range([userH/1.5,20]);

// create dispatcher 
var globalDispatcher = d3.dispatch('changetimeextent');

// create map for station names
var stationsName = d3.map(),
    stationsSpot = d3.map();

//console.log(stationsName);
//console.log(stationsSpot);

// LOAD DATA
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
    // group by start time
    var cf = crossfilter(trips),
        tripsByStartTime = cf.dimension(function(d){return d.startTime});
        //tripsByDuration = cf.dimension(function(d){return d.duration});

    // START GLOBAL DISPATCH //
    // putting the date range into DOM 
    globalDispatcher.on('changetimeextent',function(extent){
        d3.select('.ranges').select('.start-date').html(extent[0].getMonth()+1+'/'+extent[0].getDate()+'/'+extent[0].getFullYear()+' - ');
        d3.select('.ranges').select('.end-date').html(extent[1].getMonth()+1+'/'+extent[1].getDate()+'/'+extent[1].getFullYear());
         
        // filter selected trips, return the amount of trips to DOM  
        tripsByStartTime.filterRange(extent);
        
        d3.select('.ranges').select('.count').html(tripsByStartTime.top(Infinity).length);

        var newData = tripsByStartTime.top(Infinity);
        
        //console.log(newData);
        
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

        // get top 10 most freq start stations
        var topStations = nestedStations.slice(0,10);
        //console.log(topStations);
        
        // placeholders for start station names
        var topStationsArray = [],
            topStationsString = "";
        
        // put the top station names in an array that will be used to print to DOM
        for(var i=0;i<topStations.length;i++){
            topStationsString = topStationsString + topStations[i].name + " ";
            //console.log(topStationsString);
            topStationsArray.push(topStations[i].name);
        }
        
       // make crossfilter to find most freq end stations from top station list
        var cf = crossfilter(trips)
            tripsByStartStation = cf.dimension(function(d){return d.startStationName}),
            tripsByStartStation.filter(topStationsArray);
        //console.log(tripsByStartStation.top(10));
        
        // start filtering data by end station
        var tripsByEndStation = cf.dimension(function(d){return d.endStationName});

        // now group by end stations, return most frequent stations 
        var tripsGroupByEndStation = tripsByEndStation.group(),
            topEndStations = tripsGroupByEndStation.top(10);
        
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
        // THE OLD WAY WITH TSPAN
//        if(d3.select('#start')){
//            d3.select('#start').remove();  
//            d3.select('#end').remove();
//        }

        // append svg to print start stations to DOM
//        var startSvg = d3.select('#startBox')
//            .append('svg')
//            .attr('id','start')
//            .attr('height',350);
//
//        var startText = startSvg.append('text');
//            
//        startText.selectAll('tspan')
//            .data(topStationsArray)
//            .enter()
//            .append('tspan')
//            .on('click', function(){
//                var textLocation = d3.select(this).node().getBoundingClientRect().right;                         console.log(textLocation);
//            })
//            .attr('id',function(d,i){return i;})
//            .attr('x',d3.select('#startBox').node().clientWidth)
//            .attr('dy','2.75em')
//            .text(function(d){return d;})
//            .attr('class','stationText')
//            .attr('text-anchor','end')
//            .on('mouseover', function(){
//                d3.select(this).attr('class','green');
//                //console.log(this.id);
//            })
//            .on('mouseout', function(){
//                d3.select(this).attr('class','stationText');
//                //console.log(this.id);
//            });
//        
//         if(d3.select('#startBox')){
//            d3.select('#startBox').exit().remove();  
//            d3.select('#endBox').exit().remove();
//        }
////// PLOTTING POPULAR STATION TEXT //////
        // A NEW WAY WITH DIV TEXT
        if(d3.select('.startText')){
            d3.select('.startText').remove();    
        }
        if(d3.select('.endText')){
            d3.select('.endText').remove();    
        }
        
        
        var startText = d3.select('#startBox')
            .selectAll('.startText')
            .data(topStationsArray);
                    
        var x,y;
        
        startText.enter()
            .append('div')
            .text(function(d){return d;})
            .attr('class','stationText startText')
            .on('mouseover', function(){
                d3.select(this).attr('class','green');
            })
            .on('mouseout', function(){
                d3.select(this).attr('class','startText stationText');
            })
            .on('click', function(){
                var xy = [d3.select(this).node().getBoundingClientRect().right, d3.select(this).node().getBoundingClientRect().top];
               
                console.log(xy);
            
                stationLines
                    .append('line')
                    .attr('x1',0)
                    .attr('y1',xy[1]-107.5)
                    .attr('x2',xy[0]+100)
                    .attr('y2',xy[1]+100)
                    .attr('stroke','black')
                    .attr('stroke-width',2);     
            });
        

        var endText = d3.select('#endBox')
            .selectAll('.endText')
            .data(topEndStationsArray)
        
        endText.enter()
            .append('div')
            .text(function(d){return d;})
            .attr('class','stationText endText');
        


//    ////// USER TYPE GRAPH //////
//        var crossF = crossfilter(topStations),
//            tripsByUserType = cf.dimension(function(d){return d.userType});
//        
//        var casualUser = tripsByUserType.filter('Casual').top(Infinity),
//            numCasualUser = casualUser.length;
//    
//        tripsByUserType.filter(null);
//    
//        var regUser = tripsByUserType.filter('Registered').top(Infinity),
//            numRegUser = regUser.length;
//   
//        var userTypes = [numCasualUser,numRegUser];
//        
//        //console.log(userTypes);
//        //console.log(userTypes[0],userTypes[1]);
//    
//        userScaleY.domain([0,115000]);
//   
//        var casual = userTypePlot.selectAll('.casual')
//            .data(userTypes)
//        
//        casual.enter().append('rect')
//            .attr('class','casual bars')
//            .attr('transform','translate(15,0)');
//        
//        casual
//            .transition()
//            .attr('x', userW/4)
//            .attr('y', userScaleY(userTypes[0]))
//            .attr('width', 10)
//            .attr('height', userH - userScaleY(userTypes[0]));
//        
//        var reg = userTypePlot.selectAll('.reg')
//            .data(userTypes);
//        
//        reg.enter().append('rect')
//            .attr('class','reg bars')
//            .attr('transform','translate(10,0)');
//        
//        reg
//            .transition()
//            .attr('x', userW-userW/4)
//            .attr('y', userScaleY(userTypes[1]))
//            .attr('width', 10)
//            .attr('height', userH - userScaleY(userTypes[1]));
//        
        
        
        if(d3.select('.circle')){
            d3.select('.circle').remove();  
        }
          
        //console.log(topStations);           
        var stationDots = map.append('g').attr('class','circle');
        //console.log(topStations);
        
        stationDots.selectAll('.circle')
            .data(stations)
            .enter()
            .append('circle')
            //.filter(function(d){if stationName is in topStations, return d.startStationName})
            .attr('r',3)
             .attr('cx', function(d){
                var xy = albersProjection(d.lngLat);
                return xy[0]})
            .attr('cy', function(d){
                var xy = albersProjection(d.lngLat);
                return xy[1]});  

        // attempt at gender freq graph
//        var newFilter = crossfilter(topStations),
//            tripsByGender = newFilter.dimension(function(d){return d.gender});
//        
//        var maleUser = tripsByGender.filter('Male').top(Infinity),
//            numMaleUser = maleUser.length;
//    
//        tripsByGender.filter(null);
//    
//        var femaleUser = tripsByGender.filter('Female').top(Infinity),
//            numFemaleUser = femaleUser.length;
//   
//        var userGender = [numMaleUser,numFemaleUser];
//        
//        console.log(userGender);
//        
//        genderScaleY.domain([0,60000]);
//   
//        var male = genderTypePlot.selectAll('.male')
//            .data(userGender)
//        
//        male.enter().append('rect')
//            .attr('class','male bars');
//        
//        male
//            .transition()
//            .attr('x', genderW/4)
//            .attr('y', genderScaleY(userGender[0]))
//            .attr('width', 10)
//            .attr('height', genderScaleY(userGender[0]))
//            .attr('transform','translate(-5,0)');
//        
//        var female = genderTypePlot.selectAll('.female')
//            .data(userGender);
//        
//        female.enter().append('rect')
//            .attr('class','female bars');
//        
//        female
//            .transition()
//            .attr('x', genderW-genderW/4)
//            .attr('y', genderScaleY(userGender[1]))
//            .attr('width', 10)
//            .attr('height', genderH - genderScaleY(userGender[1]))
//            .attr('transform','translate(-5,0)');
        
  
    });
    // end global dispatch 

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

    // draw histogram
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
        // bar highlight
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
    
    // LOAD VISUALIZATION FOR ALL TRIPS WITH PAGE LOAD
    var init_timeExtent = [new Date(2011,7,20),new Date(2013,7,20)]

    $(document).ready(function() {
        globalDispatcher.changetimeextent(init_timeExtent)
    });
        
           

    


    var init_timeExtent = [new Date(2011,7,20),new Date(2013,7,20)]

    $( document ).ready(function() {
    console.log( "this gets triggered when everything is loaded on the page... you get the idea!" );
    globalDispatcher.changetimeextent(init_timeExtent)
    });



};
// end dataLoaded

// PARSING FUNCTIONS
function parse(d){
    
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn,
        userType: d.subsc_type,
        gender: d.gender,
        //startHour: parseTime(d.start_date)
        //birthDate:+d.birth_date,
        //data:d3.map
    };
}
function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}
function parseTime(){
    //return d3.time.day(d.startTime);
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