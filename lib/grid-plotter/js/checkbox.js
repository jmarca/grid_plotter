var d3 = require('d3')
var debounce = require('debounce')

function svg_checkbox(){
    var yoffset=0
    var xoffset=0
    var label
    function check(g){
        g.each(function(){
            var g = d3.select(this)
                    .attr("transform", "translate(0,"+yoffset+")")

            g.append('svg:rect')
            .attr('class','rcheckbox checked')
            .attr("width", "10")
            .attr("height", "10")
            .attr("stroke", "#000000")
            .attr("fill", "#000")
            .property('checked',true)
            .on("click", function (d,i) {
                var e = d3.select(this)
                e.property('checked', !e.property('checked'))
                if (e.property('checked')){
                    e.attr("fill", "#000")
                    e.attr('class','rcheckbox checked')
                }else{
                    e.attr("fill", "transparent")
                    e.attr('class','rcheckbox')
                }
                return null
            })

            g.append('g')
            .attr('class', 'checkboxlabel')
            .attr('transform', 'translate('+(12)+',' + (9) + ')')
                    .append('svg:text')
                    .style('stroke','none')
                    .attr('text-anchor', 'start')
                    .text(label);

            return null
        });
        return null
    }
    check.label = function(_){
        if (!arguments.length) return label
        label = _
        return check
    }
    check.yoffset = function(_) {
        if (!arguments.length) return yoffset;
        yoffset = _;
        return check;
    }

    check.xoffset = function(_) {
        if (!arguments.length) return xoffset;
        xoffset = _;
        return check;
    }

    return check
}




function checkBox() {

    if (!checkBox.id) checkBox.id = 0;
    var margin = {top: 10, right: 10, bottom: 20, left: 10}
    var left = 1050
    var top = 0
    var dimension,filter,group
    var id = checkBox.id++
    // dummy null formatter
    var format = function(d){
        return d
    }


    function check(div) {


        var labels = group.all().map(function(d){return format(d.key)})
        var breaks = d3.scale.ordinal().domain(labels).rangePoints([0, 100], 0)



        var categories = group.all()
        var checks = []
        categories.forEach(function(c,i){

            var boxgen = svg_checkbox()
                         .label(format(c.key))
                         .yoffset(breaks(c.key))
            checks.push(boxgen)
            })


        div.each(function(){
            var div = d3.select(this)
            var g = div.select("label")
            if(g.empty()){
                // create selection area
                var label_chars = 2
                var box = div.append('g')
                          .classed('checkbox-inline listing',true)
                          .attr('transform',function(d,i){
                              return "translate("+left+","+top+")"
                          })

                var cbs = box.selectAll(".checkbox")
                .data(checks)
                .enter()
                .append('g').classed('checkouter',true)
                .each(render);

                var cbsforhandler = cbs.selectAll('.rcheckbox')
                cbsforhandler.on('click.handler',debounce(handleClick, 1000))
            }
            return null

        });
        function handleClick(){
            // console.log('click')
            var ons = []
            div.selectAll('.checked')
            .each(function(d){
                // console.log(d)
                ons.push(d.label())
            });
            // console.log('ons is '+ons.length)
            dimension.filterFunction(function(d) {
                return ons.indexOf(d) !== -1
            })
            renderAll()
            return false
        }
    }

    check.dimension = function(_) {
                          if (!arguments.length) return dimension;
                          dimension = _;
                          return check;
                      };

    // need to make this work properly
    // on change, get all the selected, and filter out not selected
    check.filter = function(_) {
      if (_) {
        dimension.filterRange(_);
      } else {
        dimension.filterAll();
      }
      return check;
    };

    check.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return check;
    };
    check.format = function(_){
        if (!arguments.length) return format;
        format = _;
        return check;
    };
    var renderAll
    check.renderAll = function(_){
        if (!arguments.length) return renderAll
        renderAll = _;
        return check;
    };
    return check
}

module.exports.checkBox=checkBox


function render(method){
    // console.log('render')
    d3.select(this)
    .call(method)
}
