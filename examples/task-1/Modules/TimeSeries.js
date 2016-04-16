//3a. Make a wrapper [includes global vars, drawing function, getter/setter, return]
d3.TimeSeries = function(){
    //global variables
    //[why did we write these w and h variables? Do they later get sized based on css?]
    //[because we are creating an individual div for each mulitple]
    var w = 300,
        h = 300,
        m = {t:25,r:25,b:25,l:25},
        chartW = w - m.l - m.r,
        chartH = h - m.t - m.b,
        valueAcc = function(d){return(d)},
        timeRange = [new Date(), new Date()],//default timeRange, setting start/end date
        binSize ,//specify amount of time, or value
        scaleX = d3.time.scale().range([0,chartW]).domain(timeRange),
        scaleY = d3.scale.linear().range([chartH,0]).domain([0,100]);
 
    //function TimeSeries eventually returns
    function exports(selection){
        //define scales again
        scaleX.range([0,chartW]).domain(timeRange);
        scaleY.range([chartH,0]).domain([0,100]);
        
        var layout = d3.layout.histogram()
            .value(valueAcc)
            .range(timeRange)
            .bins(binSize.range(timeRange[0],timeRange[1]));
        
        selection.each(draw);
        
        function draw(d){
            var data = layout(d);
            //console.log(data);
            
            var lineGen = d3.svg.line()
                .x(function(d){ return scaleX(d.x.getTime() + d.dx/2)})  //.getTime() + d.dx/2)
                .y(function(d){ return scaleY(d.y)})
                .interpolate('basis');
            
            var svg = d3.select(this).append('svg')
                .attr('width',w).attr('height',h);
            
            var group = svg.append('g')
                .attr('transform','translate('+ m.l+','+ m.t+')');
            
            group.append('path').attr('class','line')
                .datum(data)
                .attr('d',lineGen);
           
            
        }
    }
    
    //getter & setter
    //any variables that are globally defined and can be changed
    //we are not using this part of the module in this instance, but this is best practice when setting 
    //up a module that will allow different specifications of our global vars
    exports.width = function(_w){
        if(!arguments.length) return width;
        width = _w;
        return this;
    }
    exports.valueAcc = function(_vA){
        if(!arguments.length) return valueAcc;
        valueAcc = _vA;
        return this;
    }
    exports.timeRange = function(_tR){
        if(!arguments.length) return timeRange;
        timeRange = _tR;
        return this;
    }
    exports.binSize = function(_bS){
        if(!arguments.length) return binSize;
        binSize = _bS;
        return this;
    }
    
    
    //return inside function
    return exports;
}