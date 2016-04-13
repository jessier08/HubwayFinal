var userM = {t:0,r:0,b:0,l:0},
    userW = d3.select('#userType').node().clientWidth,
    userH = d3.select('#userType').node().clientHeight;

var scaleX = d3.scale.ordinal(),
    scaleY = d3.scale.linear().range([(height/1.2),0]);

// load data
queue()
    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
    .await(dataLoaded4);

function dataLoaded4(err, trips){
    
    var userTypePlot = d3.select('#userType').append('svg')
    .attr({
        width: userW,
        height: userH
    })
    .append('g');
    
    var crossF = crossfilter(trips),
        byUserType = crossF.dimension(function(d){return d.userType}),
        casualUser = byUserType.filter('Casual').top(Infinity),
        numCasualUser = casualUser.length;
    
    byUserType.filter(null);
    
    var regUser = byUserType.filter('Registered').top(Infinity),
        numRegUser = regUser.length;
   
    var userTypes = [numCasualUser,numRegUser];
    
    console.log(userTypes);
    
    scaleY.domain([0,115000]);
    
    userTypePlot.selectAll('.bars')
        .data(userTypes)
        .enter()
        .append('rect')
        .attr('class','bars')
        .attr('x', function(d) {return} )
        .attr('width', 10)
        .attr('y', scaleY(userTypes[1]))
}

function parse(d){
    if(+d.duration<0) return;

    return {
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn,
        userType: d.subsc_type
    }
}
function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}
