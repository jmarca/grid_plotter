// load data into crossfilter and stuff
// uses queue and crossfilter and whatever from d3

var queue = require('queue')

var barChart = require('./barchart')
var xyChart = require('./xychart.js')
var cb = require('./checkbox.js')

var barcharts=[]

var crossfilter = require('crossfilter').crossfilter

var d3=require('d3')

d3.geo.tile=function(){function t(){var t=Math.max(Math.log(n)/Math.LN2-8,0),h=Math.round(t+e),o=Math.pow(2,t-h+8),u=[(r[0]-n/2)/o,(r[1]-n/2)/o],l=[],c=d3.range(Math.max(0,Math.floor(-u[0])),Math.max(0,Math.ceil(a[0]/o-u[0]))),M=d3.range(Math.max(0,Math.floor(-u[1])),Math.max(0,Math.ceil(a[1]/o-u[1])));return M.forEach(function(t){c.forEach(function(a){l.push([a,t,h])})}),l.translate=u,l.scale=o,l}var a=[960,500],n=256,r=[a[0]/2,a[1]/2],e=0;return t.size=function(n){return arguments.length?(a=n,t):a},t.scale=function(a){return arguments.length?(n=a,t):n},t.translate=function(a){return arguments.length?(r=a,t):r},t.zoomDelta=function(a){return arguments.length?(e=+a,t):e},t};


// for testing, just pick the areas

var tiles =[
    //'201_98',
    '202_98',
//    '203_98',
    // '201_99',
//    '202_99',
    '203_99'
    // '201_97',
    //'202_97',
    //'203_97'
    ]
//'233_49','234_49','233_48','234_48',
//'235_49'
//,'236_49'
//  ,'235_50'
//  ,'236_50'


// handy

var ts_regex=/(\d*-\d*-\d*)\s(\d*:\d*)/
function parseDate(d) {
    var match = ts_regex.exec(d)
    var canonical_date = [match[1],'T',match[2],':00-0800'].join('')
    return new Date(canonical_date)
}
// Various formatters.
var formatNumber = d3.format(",d"),
    formatChange = d3.format("+,d"),
    formatDate = d3.time.format("%B %d, %Y"),
    formatMonth = //d3.time.format("%B"),
function(d){
    return month_abbrev[d]
},

    formatDOW = //d3.time.format("%a"),
function(d){
    return dow[d]
},
    formatTime = d3.time.format("%I:%M %p");

var formatTOD = function(d){
    if (d===0) return '12:00 AM'
    if (d<12) return d+':00 AM'
    if (d===12) return '12:00 PM'
    return d-12 + ':00 PM'
}

// A nest operator, for grouping hourly data by day
var nestByDate = d3.nest()
                 .key(function(d) { return d3.time.day(d.date); });


function plot_cube(){
    // go get the data
    var q = queue()
    tiles.forEach(function(t){
        var ij = /(\d*)_(\d*)/.exec(t);
        var url = '/hpms/datahr/2008/'+ij[1]+'/'+ij[2]+'.json'
        q.defer(d3.json,url)
    })
    q.awaitAll(ready)
    d3.select(self.frameElement).style("height", height + "px");
}
module.exports=plot_cube()

var width = Math.max(960, window.innerWidth),
    height = 1000

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)


var h=0;

function ready(e,results){
    var cf={}
    tiles.forEach(function(tile,idx){
        var g = svg.append('g')
                .attr("transform","translate(0,"+h+")")
        h+=200



        var stuff = []
        var ij = /(\d*)_(\d*)/.exec(tile);
        var data = results[idx]
        // have the index and the data
        var tss = Object.keys(data)
        tss.forEach(function(ts){
            var time = parseDate(ts)
            var bigrow = data[ts]
            // bigrow has all the different roadway types.
            // split out
            var roadtypes = Object.keys(bigrow)
            roadtypes.forEach(function(roadway){
                // filter this out now
                if(roadway === 'totals') return null

                var row = bigrow[roadway]
                var rewrite = {'ts':time,
                               'road_class':roadway}
                if(roadway === 'detector_based'){
                    // hack to rejigger detector based
                    rewrite.vmt = row.n_mt
                    // plus others later
                }else{
                    rewrite.vmt = row.sum_vmt
                    // plus others later
                }
                stuff.push(rewrite)
                return null
            })
            return null
        })
        cf[tile] = crossfilter(stuff)
        genplot(g,cf[tile],tile)
        return null
    })



}


function genplot(plotsvg,cf,cellid){
    console.log('plotting')
    console.log(cellid)
    var all = cf.groupAll()
    var dimensions = {}

    var vars = ['ts','vmt','road_class']
    vars.forEach(function(k){
        dimensions[k] = cf.dimension(function(d){
                            return d[k]
                        })
        return null
    })
    // and another one too
    dimensions['ts2'] = cf.dimension(function(d){
                            return d['ts']
                        })
    var dates = dimensions.ts.group(d3.time.day)

    var group_road_class = dimensions.road_class.group()
    //var filter_roadclass = dimensions.road_class.filter(function(d){
    //                           // return d !== 'totals'
    //                            return d !== 'detector_based'
    //                       })
    var vmtsums = dimensions.vmt
                  .groupAll()
                  .reduceSum(function(d) { return d.vmt; });

    var tsvmt_group = dimensions.ts2
                      .group(function(d){ return d})
                      .reduce(
                          function (p, v) {
                              return p + +(v.vmt)
                          }
                        ,function (p, v) {
                             return p - +v.vmt
                         }
                        ,function (){ return 0 }
                      )

    var mycheck =
        cb.checkBox()
        .dimension(dimensions.road_class)
        .group(group_road_class)
        .renderAll(renderAll(all))

    // svg.selectAll(".limit")
    // .data([mycheck])
    // .enter()
    // .append('div').classed('limit',true)
    // .each(function(limit) {
    //     d3.select(this).call(limit)
    // });


    var mychart =
        xyChart()
        .xdimension(dimensions.ts2)
        .xdim('ts')
        .ydim('vmt')
        .ylabel('VMT grid '+cellid)
        .xlabel('timestamp (hour)')
        .group(tsvmt_group)
        .sumgroup(vmtsums)
        .x(d3.time.scale()
           .rangeRound([0, 10 * 85]));

    var timescale =
        barChart()
        .dimension(dimensions.ts)
        .group(dates)
        .round(d3.time.day.round)
        //.ylabel('Count')
        //.xlabel('timestamp (day)')
        .x(d3.time.scale()
           .rangeRound([0, 10 * 85]))
    barcharts.push(timescale)

    var g = plotsvg.selectAll("g.gridplot")
            .data([mychart,timescale])
    var ch = plotsvg.selectAll("g.gridplot")
            .data([mycheck])

    // if g is there??
    // g.remove() ??
    g.enter().append('g').attr("class", 'gridplot')
    .each(function(chart) {
        if(chart.on !== undefined ){
            chart.on("brush", renderAll(all)).on("brushend", renderAll);
        }
    })
    .each(render);
    ch.enter().append('g').attr("class", 'checkboxes')
    .each(render);
    return null
}

function renderAll(all){
    return function(){
        d3.selectAll('.gridplot')
        .each(render);
        //d3.select("#active").text(formatNumber(all.value()));
    }
}

//window.renderAll = renderAll

// I have no idea how these work, why these work

// okay 3 days on, getting a clue
function render(method){
    d3.select(this)
    .call(method)
}


window.reset = function(i) {
    barcharts[i].filter(null);
    renderAll();
  };
