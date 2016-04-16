d3.UserTypes = function userType(){

    var scaleX = d3.scale.ordinal(),
        scaleY = d3.scale.linear().range([userH/1.5,0]);
    
    scaleY.domain([0,115000]);
    //need to write max function to find max of range of data 
    //that will change based on filter
    
    var casual = userTypePlot.append('g').attr('class','casual');
    
    casual.append('rect')
        .attr('class','bars')
        .attr('x', userW/4)
        .attr('y', scaleY(userTypes[0]))
        .attr('width', 10)
        .attr('height', userH - scaleY(userTypes[0]))
        .attr('transform','translate(-5,0)');
    
    var reg = userTypePlot.append('g').attr('class','reg');
    
    reg.append('rect')
        .attr('class','bars')
        .attr('x', userW-userW/4)
        .attr('y', scaleY(userTypes[1]))
        .attr('width', 10)
        .attr('height', userH - scaleY(userTypes[1]))
        .attr('transform','translate(-5,0)')

}
