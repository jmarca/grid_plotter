var d3 = require('d3')
var debounce = require('debounce')

function SVGCheckbox(x, y) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("width", "10");
    el.setAttribute("height", "10");
    el.setAttribute("stroke", "#000000");
    el.setAttribute("fill", "transparent");
    el.checked = false;
    el.addEventListener("click", function () {
        el.checked = !el.checked;
        if (el.checked) el.setAttribute("fill", "#000");
        else el.setAttribute("fill", "transparent");
    });
    return el;
}

function d3checkbox(e,x,y){
    return e.append('svg:rect')
           .attr("x", x)
           .attr("y", y)
           .attr("width", "10")
           .attr("height", "10")
           .attr("stroke", "#000000")
           .attr("fill", "transparent")
           .property('checked',false)
           .on("click", function (d,i) {
               var e = d3.select(this)
               e.property('checked', !e.property('checked'))
               if (e.property('checked')){
                   e.attr("fill", "#000")
               }else{
                   e.attr("fill", "transparent")
               }
           })

}


module.exports.SVGCheckbox =SVGCheckbox
module.exports.checkBox=checkBox


function checkBox() {

    // var svg = d3.select('svg')
    // d3checkbox(svg,200,0).on('click.foo',function(){
    //     alert('helov')
    // })
    //     var svg_checkbox = cb.SVGCheckbox(200, 0);
    // svg.node().appendChild(svg_checkbox);
    // svg_checkbox.addEventListener("click",function(){
    //                           alert('clecked me')
    // })
    // that works.

    if (!checkBox.id) checkBox.id = 0;
    var margin = {top: 10, right: 10, bottom: 20, left: 10}
    var left = 950
    var top = 0
    var dimension,filter,group
    var id = checkBox.id++
    // dummy null formatter
    var format = function(d){
        return d
    }


    function check(div) {


        var labels = group.all().map(function(d){return d.key})
        var breaks = d3.scale.ordinal().domain(labels).rangePoints([0, 100], 0).range()


        div.each(function(){
            var div = d3.select(this)
            var g = div.select("label")
            if(g.empty()){
                // create selection area
                var label_chars = 2
                var box = div.append('g')
                          .classed('checkbox-inline listing',true)
                          .attr('transform',"translate("+left+","+top+")")
                box.selectAll(".label")
                .data(group.all())
                .enter()
                .append('svg:text')
                .attr('class','label')
                .text(function(d) {
                                 var label =  format(d.key)
                                 label_chars = label_chars > label.length ?
                                     label_chars : label.length
                                 return label
                             })
                             .append("input")
                             .classed('check-'+id,true)
                             .attr("checked", true)
                             .attr("type", "checkbox")
                             .attr("id", function(d,j) { return id+'-a-'+j; })
                // stupid hack, but whatever
                if(label_chars > 10){
                    label_chars =26
                }
                div.selectAll(".checkbox-inline.listing")
                .classed('width-'+label_chars,true)
                div.selectAll('input').on('change',debounce(handleClick, 2000))
            }
            return null

        })
    }

    function handleClick(){
        //console.log('click' + id)
        var ons = []
        d3.selectAll('.check-'+id+':checked')
        .each(function(d){
            ons.push(d.key)
        });
        dimension.filterFunction(function(d) {
            return ons.indexOf(d) !== -1
        })
        window.renderAll()
        return false
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

    return check
}