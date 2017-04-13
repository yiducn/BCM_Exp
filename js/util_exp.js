

/**
 * 创建实验地图
 */
function createExpMap() {

    /**
     * y 取1.05,1.1,1.2,1.4,1.8
     * x 1- 95,90,83,71,55
     */
    var dataChangeIndex = 3;//控制数据波动的参数,0-4 5类
    var yList = [1.05,1.1,1.2,1.4,1.8];
    var xList = [95, 90, 83, 71, 55];
    var y2 = yList[dataChangeIndex];//
    function x() {
        return Math.random() * xList[dataChangeIndex];
    }

    var densityIndex = 1;
    var densityList = [2, 4, 8, 12, 16, 24];
    var density = densityList[densityIndex];//2,4,8,12,16,24
    var indexOfProv = parseInt(Math.random()*32);//全局最大所在的省份



    var width = 960,
        height = 700;
    //var colors = ["#FF0000", "#FFFF00"];
    var colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];
    var colorScale = d3.scale.linear()
        .domain([0,12,24,36,48,60,72,84,100]).range(colors);

    var projection = d3.geo.mercator()
        .center([107, 31])
        .scale(600)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    //加载中国地图,china_provinces_remove2删除了香港与澳门
    d3.json("data/china_provinces_remove2.json",
        function (data) {
            var provinces = data.features;
            var sel = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);

            //添加filter
            //https://developer.mozilla.org/en-US/docs/Web/CSS/filter
            sel.append('filter')
                .attr('id', 'desaturate')
                .append('feColorMatrix')
                .attr('type', 'matrix')
                .attr('values', "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0  0      0      0      1 0");


            /**
             <pattern id="fagl" patternUnits="objectBoundingBox" width="2" height="1" x="-50%">
             <path style="stroke:#FF0; stroke-opacity:1;stroke-width:20;fill-opacity:0;" d="M150 0 L75 200 L225 200 Z">
             </pattern>
             */
            var upd = sel.selectAll('path').data(provinces);
            var pattern = upd.enter()
                .append("pattern")
                .attr("id", function (d) {
                    console.log(d.id);
                    return "pat" + d.id;
                })
                .attr("patternUnits", "objectBoundingBox")
                .attr("width", "1")
                .attr("height", "1")
                .attr("x", 0)
                .attr("y", 0);
            pattern.append("path")
                .attr("stroke-width", 0.2)//绘制省份的边界
                .attr("fill", "none")
                .attr("stroke", function (d) {
                    return "#000000";
                })
                .attr("d", path)
                .attr("transform", function (d) {
                    var bbox = Snap.path.getBBox(path(d));
                    //需要偏移一段距离
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/3/
                    return "translate(" + -bbox.x +
                        "," + -bbox.y + ")";
                });

            /**
             * <clipPath id="clipPath">
             <path id="triangle1" d="M150 0 L75 200 L225 200 Z">
             </clipPath>
             */
            var clippath = upd.enter()
                .append("clipPath")
                .attr("id", function (d) {
                    return "clippath" + d.id;
                })
                .append("path")
                .attr("id", function (d) {
                    return "clippathPath" + d.id;
                })
                .attr("d", path)
                .attr("transform", function (d) {
                    var bbox = Snap.path.getBBox(path(d));
                    //需要偏移一段距离
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/
                    //https://jsfiddle.net/sunsnowad/0b1vyk6q/3/
                    return "translate(" + -bbox.x +
                        "," + -bbox.y + ")";
                });

            var indexMax = parseInt(Math.random() * density);//最大数值所在的位置[0,density)
            /**
             * <circle cx="145" cy="40" r="20"
             style="fill: #0000ff; clip-path: url(#clipPath); " />
             */
            //绘制矩形框,并填充颜色
            //记录最大的正常值
            var maxNormalValue = 0;
            for (var i = 0; i < provinces.length; i++) {
                var d = provinces[i];

                var bbox = Snap.path.getBBox(path(provinces[i]));
                var tempBarG = sel.append("g")
                    .attr("id", "tempBar" + provinces[i].id)
                    //.attr("x", bbox.x)
                    //.attr("y", bbox.y)
                    .attr("width", bbox.width)
                    .attr("height", bbox.height)
                    .attr("transform", "translate(" + bbox.x + "," + bbox.y + ")");

                for (var j = 0; j < density; j++) {
                    var value = x();
                    if(maxNormalValue < value)
                        maxNormalValue = value;//

                    if(indexOfProv == i && j == indexMax){//最大值绘制
                        //
                    }else{
                        tempBarG.append("rect")
                            .attr("id", "tempbarRectId" + j)
                            .attr("x", (j * bbox.width ) / density)//TODO sort
                            .attr("width", bbox.width / density)
                            .attr("y", 0)
                            .attr("height", bbox.height)
                            .attr("fill", colorScale(value))//填充颜色
                            .attr("clip-path", "url(#clippath" + provinces[i].id + ")");
                    }
                }

                sel.append('path')
                    .attr('d', path(provinces[i]))
                    .attr("fill", "url(#" + "pat" + d.id + ")")
                    .attr('fill-opacity', '1.0');
            }

            {//处理并生成并绘制最大值
                var temp = maxNormalValue * y2;//+ y;
                var bbox = Snap.path.getBBox(path(provinces[indexOfProv]));
                var tempBarG = d3.selectAll("#tempBar" + provinces[indexOfProv].id);
                tempBarG.append("rect")
                    .attr("id", "tempbarRectId" + indexMax)
                    .attr("x", (indexMax * bbox.width ) / density)//TODO sort
                    .attr("width", bbox.width / density)
                    .attr("y", 0)
                    .attr("height", bbox.height)
                    .attr("fill", colorScale(temp))//填充颜色
                    .attr("clip-path", "url(#clippath" + provinces[indexOfProv].id + ")");
                console.log("测试数据位置:"+indexOfProv+":"+indexMax+":"+temp);
                sel.append('path')
                    .attr('d', path(provinces[indexOfProv]))
                    .attr("fill", "url(#" + "pat" + provinces[indexOfProv].id + ")")
                    .attr('fill-opacity', '1.0');
            }

            for (var i = 0; i < provinces.length; i++) {
                var d = provinces[i];
                var bbox = Snap.path.getBBox(path(provinces[i]));
                //添加一个影子rect,用来支持交互;这样鼠标移入矩形框,光标会发生变化
                var tempBarGShadow = sel.append("g")
                    .attr("id", "tempBarShadow" + provinces[i].id)
                    .attr("width", bbox.width)
                    .attr("height", bbox.height)
                    .attr("cursor", "pointer")
                    .attr("transform", "translate(" + bbox.x + "," + bbox.y + ")");

                for (var j = 0; j < density; j++) {
                    tempBarGShadow.append("rect")
                        .attr("id", "tempbarshadowRectId" + j)
                        .attr("x", (j * bbox.width ) / density)//TODO sort
                        .attr("width", bbox.width / density)
                        .attr("y", 0)
                        .attr("height", bbox.height)
                        .attr("fill", "rgba(1,0,0,0)")
                        .attr("filter", "grayscale(100%)")
                        .attr("clip-path", "url(#clippath" + provinces[i].id + ")")

                        .on("mouseout", function () {
                            //var filterId = function(ids){
                            //    return ids.substr(19);
                            //};
                            //var id = "tempbarRectId"+filterId(this.id);
                            //d3.selectAll("rect").attr("filter", function(){
                            //    return "";
                            //});
                        })
                        .on("mousedown", function () {
                            console.log("mouse down");
                            var filterId = function(ids){
                                return ids.substr(19);
                            };
                            //var id = "tempbarRectId"+filterId(this.id);
                            //d3.selectAll("rect").attr("filter", function(){
                            //    if(this.id.startsWith("tempbarRectId") && this.id != id)
                            //        return "url(#desaturate)";
                            //    else if(this.id.startsWith("tempbarRectId"))
                            //        return "";
                            //});

                            var clip = this.getAttribute("clip-path");
                            var selectedProv = clip.substring(13,clip.length-1);
                            //在这里记录了实验者点击的省份和index
                            console.log("selected province:"+ selectedProv+":"+filterId(this.id));

                        })
                        .on("mouseover", function () {
                            //console.log("I can see you!");
                        });
                }

            }
        });
}
