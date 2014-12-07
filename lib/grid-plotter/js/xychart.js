var d3 = require('d3')

module.exports=xychart
function xychart() {
    if (!xychart.id) xychart.id = 0;

    var margin = {top: 10, right: 10, bottom: 70, left: 160},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = xychart.id++,
        xaxis = d3.svg.axis().orient("bottom"),
        yaxis = d3.svg.axis().orient("left"),
        xdimension,
        ydimension,
        xdim,ydim,
        sumgroup,
        group,
        round,
        xlabel,
        ylabel,
        formatNumber = d3.format(",d");


    function chart(div) {
        var width = x.range()[1],
            height = y.range()[0];

        // An area generator, for the light fill.
        var area = d3.svg.area()
                   .interpolate("linear")

        // A line generator, for the dark stroke.
        var line = d3.svg.line()
                   .interpolate("linear")


        area.x(function(d) { return x(d.key); })
        .y1(function(d) { return y(d.value); });

        line.x(function(d) { return x(d.key); })
        .y(function(d) { return y(d.value); });

        var reducy = group.top(1)[0].value
        y.domain([0,reducy]);

        if(xdimension.bottom(1) !== undefined &&
           xdimension.bottom(1)[0] !== undefined){
            x.domain([xdimension.bottom(1)[0][xdim], xdimension.top(1)[0][xdim]]);
            xaxis.scale(x);
        }

        yaxis.scale(y);

        div.each(function() {
            var div = d3.select(this),
                g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                // console.log('creating the previously empty chart')
                // div.append('svg:text')
                // .style('stroke','none')
                // .attr('text-anchor', 'middle')
                // .text('VMT traveled per hour')
                // .append("a")
                // .attr("href", "javascript:reset(" + id + ")")
                // .attr("class", "reset")
                // .text("reset")
                // .style("display", "none");

                if(sumgroup){

                    // fix this, need to sum over all of the itmems

                    div.select(".total").append("span")
                    .attr("class","value")
                    .text(formatNumber(Math.floor(sumgroup.value())))

                }
                g = div.append("g")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                // Add the clip path.
                g.append("clipPath")
                .attr("id", "clip-xy-" + id)
                .append("rect")
                .attr("width", width)
                .attr("height", height);

                g.selectAll(".xy")
                .data([//"background",
                       "foreground"])
                .enter().append("path")
                .attr("class", function(d) { return d + " xy"; })
                .datum(group.all())

                g.selectAll(".foreground.xy")
                .attr("clip-path", "url(#clip-xy-" + id + ")");

                // Add the x-axis.
                g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xaxis);
                // Add the y-axis.
                g.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(0,0)")
                .call(yaxis);

                if(xlabel){
                    g.append('g')
                    .attr('class', 'x axis label')
                    .attr('transform', 'translate('+(width/2)+',' + (height+margin.top+margin.bottom) + ')')
                    .append('svg:text')
                    .style('stroke','none')
                    .attr('text-anchor', 'middle')
                    .text(xlabel);

                }
                if(ylabel){
                    g.append('g')
                    .attr('class', 'y axis label')
                    .attr('transform', 'translate('+(-margin.left/2)+',' + (height/2) + ') rotate(-90)')
                    .append('svg:text')
                    .style('stroke','none')
                    .attr('text-anchor', 'middle')
                    .text(ylabel);

                }

            }else{
                // console.log('redrawing the previously created chart')
                // redraw the xaxis
                g.select("g.x.axis")
                .call(xaxis);
                g.select("g.y.axis")
                .call(yaxis);

                g.selectAll(".foreground.xy")



                if(sumgroup){

                    div.select(".total>.value")
                    .text(formatNumber(Math.floor(sumgroup.value())))

                }

            }
            g.selectAll(".foreground.xy")
            .datum(group.all())
            .attr("d", line)
        });


    }

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        xaxis.scale(x);
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        yaxis.scale(y);
       return chart;
    };

    chart.xdimension = function(_) {
        if (!arguments.length) return xdimension;
        xdimension = _;
        return chart;
    };


    chart.ydimension = function(_) {
        if (!arguments.length) return ydimension;
        ydimension = _;
        return chart;
    };

    chart.xdim = function(_) {
        if (!arguments.length) return xdim;
        xdim = _;
        return chart;
    };


    chart.ydim = function(_) {
        if (!arguments.length) return ydim;
        ydim = _;
        return chart;
    };

    chart.sumgroup = function(_) {
      if (!arguments.length) return sumgroup;
      sumgroup = _;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.xlabel = function(_) {
        if (!arguments.length) return xlabel;
        xlabel = _;
        return chart;
    };


    chart.ylabel = function(_) {
        if (!arguments.length) return ylabel;
        ylabel = _;
        return chart;
    };

    return chart
}
