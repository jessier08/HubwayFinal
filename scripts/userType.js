//var userM = {t:0,r:0,b:0,l:0},
//    userW = d3.select('#userType').node().clientWidth,
//    userH = d3.select('#userType').node().clientHeight;
//
//var userScaleX = d3.scale.ordinal(),
//    userScaleY = d3.scale.linear().range([userH/1.5,0]);
//
//// load data
//queue()
//    .defer(d3.csv,'data/hubway_trips_reduced.csv', parse)
//    .await(dataLoaded4);
//
//function dataLoaded4(err, trips){
//    
//    var userTypePlot = d3.select('#userType').append('svg')
//    .attr({
//        width: userW,
//        height: userH
//    });
//    
//    var crossF = crossfilter(newData),
//        byUserType = crossF.dimension(function(d){return d.userType}),
//        casualUser = byUserType.filter('Casual').top(Infinity),
//        numCasualUser = casualUser.length;
//    
//    byUserType.filter(null);
//    
//    var regUser = byUserType.filter('Registered').top(Infinity),
//        numRegUser = regUser.length;
//   
//    var userTypes = [numCasualUser,numRegUser];
//    
//    //console.log(userTypes[0],userTypes[1]);
//    
//    userScaleY.domain([0,115000]);
//    
//    var casual = userTypePlot.append('g').attr('class','casual');
//    casual.append('rect')
//        .attr('class','bars')
//        .attr('x', userW/4)
//        .attr('y', userScaleY(userTypes[0]))
//        .attr('width', 10)
//        .attr('height', userH - userScaleY(userTypes[0]))
//        .attr('transform','translate(-5,0)');
//    
//    var reg = userTypePlot.append('g').attr('class','reg');
//    reg.append('rect')
//        .attr('class','bars')
//        .attr('x', userW-userW/4)
//        .attr('y', userScaleY(userTypes[1]))
//        .attr('width', 10)
//        .attr('height', userH - userScaleY(userTypes[1]))
//        .attr('transform','translate(-5,0)')
//
//}
//
//function parse(d){
//    if(+d.duration<0) return;
//
//    return {
//        startTime: parseDate(d.start_date),
//        endTime: parseDate(d.end_date),
//        startStation: d.strt_statn,
//        endStation: d.end_statn,
//        userType: d.subsc_type
//    }
//}
//function parseDate(date){
//    var day = date.split(' ')[0].split('/'),
//        time = date.split(' ')[1].split(':');
//
//    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
//}
