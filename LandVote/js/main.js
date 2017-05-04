/****** GLOBAL VARIABLES *******/
var mapWidth = 750, mapHeight = 410;
var keyArray = ["1988",	"1989",	"1990",	"1991",	"1992",	"1993",	"1994",	"1995",	"1996",	"1997",	"1998",	"1999",	"2000",	"2001",	"2002",	"2003",	"2004",	"2005",	"2006",	"2007",	"2008",	"2009",	"2010",	"2011",	"2012",	"2013",	"2014",	"2015",	"2016"];
var Category = ["gradeData","totalSpending","jurisdictionType","financeType" ];
var expressed;
var yearExpressed;
var yearExpressedText;
var colorize;
var scale;
var currentColors = [];
var menuWidth = 250, menuHeight = 400;
var otherMenuWidth = 200, otherMenuHeight = 70;
var menuInfoWidth = 250, menuInfoHeight = 100;
var textArray = ["In <b>2016</b>, there were <b>84</b> successful measures across the country. <b>39</b> of those measures were facilitated and supported by The Trust for Public Land's conservation finance services.","Total conservation funding approved from <b>1988 to Present</b>.","Successful state measures passed from <b>1988 to Present</b>.","Finance mechanisms for State approved measures from <b>1988 to Present</b>."]
var linkArray = ["<a href = '#overview'> We provide an overview of these services here.</a>","<a href = '#spending'>  What kind of spending does LandVote track?</a>","<a href = '#jurisdiction'>  What kind of measures LandVote track?</a>","<a href = '#finance'>  What kinds of finance mechanisms exist for measures?</a>"];

var joinedJson; //Variable to store the USA json combined with all attribute data

// SET UP ARRAYS FOR CATEGORIES OF EACH VARIABLE
    //Variable array for 2016 Overview
    var arrayOverview = ["State",       
                        "County", 
                        "County and Municipal",
                        "County,Municipal & Special Dist.",
                        "Municipal and Special Dist.",
                        "Municipal",
                        "Special Dist.",
                        "none"];     

    //Variable array for Jurisdiction Type
    var arrayJurisdiction = [ "State Measure(s) Passed",     
                        "No State Measures Passed",
                            "No Data"];

    var arraySpending = [ "$2,980,773,000 to $5,962,012,000",
                        "$859,407,900 to $2,980,773,000",
                        "$335,777,800 to $859,407,900",
                        "0 to $335,777,800",     
                        "No Data"];
                            

    var arrayfinanceType = [ "Bond",
                        "Income tax",
                        "Property tax",
                        "Real estate transfer tax",     
                        "Sales tax",
                        "Other",
                        "none"];
                            

//SET UP COLOR ARRAYS FOR EACH VARIABLE
    //Color array for 2016 overview
    var colorArrayOverview = ["#005a32",      //State
                            "#238b45",      //County
                            "#41ab5d",      //County and Special Dist
                            "#74c476",      //County;Municipal;Special District
                            "#a1d99b",      //Municipal and Special District
                            "#c7e9c0",      //Municipal
                            "#e5f5e0",      //Special District
                            "#d9d9d9" ];     //none
                               

    // Color array for Jurisdiction type
    var colorArrayJurisdiction = ["#005a33",//State Measure(s) Passed
                                  "#f7f7f7", //No State Measures
                                "#d9d9d9"];  //none          


    // Color array for state spending
    var colorArraySpending = ["#2171b5",     //0 to $335,777,800
                            "#6baed6",      //$335,777,800 to $859,407,900
                            "#bdd7e7",      //$859,407,900 to $2,980,773,000
                            "#eff3ff",      //$2,980,773,000 to $5,962,012,00
                            "#d9d9d9"];

    var colorArrayFinance = ["#8dd3c7",      //Bond
                            "#ffffb3",      //Income tax
                            "#bebada",      //Property tax
                            "#fb8072",      //Real estate transfer tax
                            "#80b1d3",      //Sales tax
                            "#fdb462",      //Other
                            "#d9d9d9"];     //none
                                   

//SET UP VARIABLES FOR COLORSCALE & CHOROPLETH FUNCTIONS
var currentColors = [];
var currentArray = [];

//SET UP VARIABLES FOR TIMELINE
var timelineFeatureArray = [];
var colorizeChart; // colorScale generator for the chart
var chartHeight = 200;
var chartWidth = 882;
var squareWidth = 15;
var squareHeight = 15;
var chartRect;
var margin = {top: 80, right: 20, bottom: 30, left:10};
var rectColor;
var axisHeight = 30;

/*---*******---END OF GLOBAL VARIABLES---*******---*/
//--------------------------------------------------/

//loads everythang
window.onload = initialize();

//changes active state of navbar
$(function(){
    $('.nav li a').on('click', function(e){
        var $thisLi = $(this).parent('li');
        var $ul = $thisLi.parent('ul');

        if (!$thisLi.hasClass('active')){
            $ul.find('li.active').removeClass('active');
                $thisLi.addClass('active');
        }
    })
});//end active navbar function

//start function for website
function initialize(){
    expressed = Category[0];
    yearExpressed = keyArray[keyArray.length-1];
    animateMap(yearExpressed, colorize, yearExpressedText);
    setMap();
    createMenu(arrayOverview, colorArrayOverview, "Measures Type Passed:", textArray[0], linkArray[0]);
    //createInset();
    $(".Overview").css({'background-color': '#009fda','color': 'white'});
    //disables buttons on load
    $('.stepBackward').hide('disabled', false);
    $('.play').hide('disabled', false);
    $('.pause').hide('disabled', false);
    $('.stepForward').hide('disabled', false);
    
}; //End initialize

//creates map
function setMap(){
    var map = d3.select(".map")
        .append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight)
        .attr("class", "us-map");
    
    //Create a Albers equal area conic projection
    var projection = d3.geo.albersUsa()
        .scale(900)
        .translate([mapWidth / 2, mapHeight / 2]);
    
    //create svg path generator using the projection
    var path = d3.geo.path()
        .projection(projection);
    
    queue()
        .defer(d3.csv, "data/grades.csv")
        .defer(d3.csv, "data/totalSpending.csv")
        .defer(d3.csv, "data/jurisdictionType.csv")
        .defer(d3.csv, "data/financeType.csv")
        .defer(d3.json, "data/usa.topojson")
        .await(callback);
    
    //creates menu [overview starts on load]
    drawMenu();
        
    //retrieve and process json file and data
    function callback(error, grade, totalSpending, jurisdictionType, financeType, usa){

        //Variable to store the USA json with all attribute data
        joinedJson = topojson.feature(usa, usa.objects.states).features;
        colorize = colorScale(joinedJson);

        //Create an Array with CSV's loaded
        var csvArray = [grade, totalSpending, jurisdictionType, financeType]; 
        //Names for the overall Label we'd like to assign them
        var attributeNames = ["gradeData","totalSpending","jurisdictionType","financeType"];
        //For each CSV in the array, run the LinkData function
        for (csv in csvArray){
            LinkData(usa, csvArray[csv], attributeNames[csv]);
        };

        function LinkData(topojson, csvData, attribute){
             var jsonStates = usa.objects.states.geometries;

            //loop through the csv and tie it to the json's via the State Abbreviation
             for(var i=0; i<csvData.length; i++){
                var csvState = csvData[i];
                var csvLink = csvState.adm;

                //loop through states and assign the data to the rigth state
                for(var a=0; a<jsonStates.length; a++){

                    //If postal code = link, we good
                    if (jsonStates[a].properties.postal == csvLink){
                        attrObj = {};

                        //one more loop to assign key/value pairs to json object
                        for(var key in keyArray){
                            var attr = keyArray[key];
                            var val = (csvState[attr]);
                            attrObj[attr] = val;
                        };

                    jsonStates[a].properties[attribute] = attrObj;
                    break;
                    };
                };
             }; 
        }; //END linkData

        //Style the states to be styled according to the data
        var states = map.selectAll(".states")
            .data(joinedJson)
            .enter()
            .append("path")
            .attr("class", function(d){ 
                return "states " + d.properties.postal;
            })
            .style("fill", function(d){
                return choropleth(d, colorize);
            })
            .attr("d", function(d) {
                return path(d);
            })
            .on("mouseover", highlight)
            .on("mouseout", dehighlight);

        var statesColor = states.append("desc")
            .text(function(d) {
                return choropleth(d, colorize);
            })

    }; //END callback
}; //END setmap

//menu items function
function drawMenu(){
    //click changes on Overview
    $(".Overview").click(function(){ 
        expressed = Category[0];
        yearExpressed = keyArray[keyArray.length-1];
        d3.selectAll(".yearExpressedText").remove();
        drawMenuInfo(colorize, yearExpressed);
        $('.stepBackward').hide('disabled', false);
        $('.play').hide('disabled', false);
        $('.pause').hide('disabled', false);
        $('.stepForward').hide('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#e1e1e1','color': '#969696'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayOverview, colorArrayOverview, "Measure Type Passed:", textArray[0], linkArray[0]);
        $(".Overview").css({'background-color': '#009fda','color': 'white'});
        //removes chart
        var oldChart = d3.selectAll(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
    });
    
    //click changes for totalSpending
    $(".Spending").click(function(){  
        expressed = Category[1];
        $('.stepBackward').hide('disabled', false);
        $('.play').hide('disabled', false);
        $('.pause').hide('disabled', false);
        $('.stepForward').hide('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#e1e1e1','color': '#969696'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arraySpending, colorArraySpending, "Spending: ", textArray[1], linkArray[1]);
        $(".Spending").css({'background-color': '#009fda','color': 'white'});
        //removes chart
        var oldChart = d3.selectAll(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
        });
    
    //click changes for JurisdictionType
     $(".Jurisdiction").click(function(){ 
        expressed = Category[2];
        $('.stepBackward').show('disabled', false).prop('disabled', false);
        $('.play').show('disabled', false).prop('disabled', false);
        $('.pause').show('disabled', false).prop('disabled', false);
        $('.stepForward').show('disabled', false).prop('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#e1e1e1','color': '#969696'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayJurisdiction, colorArrayJurisdiction, "Type of Measure: ", textArray[2], linkArray[2]);
        $(".Jurisdiction").css({'background-color': '#009fda','color': 'white'});
        //removes and creates correct chart
        var oldChart = d3.select(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
        setChart(yearExpressed);
     });
    
     //click changes for totalSpending
    $(".Finance").click(function(){  
        expressed = Category[3];
        $('.stepBackward').show('disabled', false).prop('disabled', false);
        $('.play').show('disabled', false).prop('disabled', false);
        $('.pause').show('disabled', false).prop('disabled', false);
        $('.stepForward').show('disabled', false).prop('disabled', false);
        d3.selectAll(".menu-options div").style({'background-color': '#e1e1e1','color': '#969696'});
        d3.selectAll(".states").style("fill", function(d){
                return choropleth(d, colorize);
            })
            .select("desc")
                .text(function(d) {
                    return choropleth(d, colorize);
            });
        createMenu(arrayfinanceType, colorArrayFinance, "Finance Mechanism: ", textArray[3], linkArray[3]);
        $(".Finance").css({'background-color': '#009fda','color': 'white'});
        //removes and creates correct chart
        var oldChart = d3.select(".chart").remove();
        var oldRects = d3.selectAll(".chartRect").remove();
        setChart(yearExpressed);
        });
    
   
}; //END drawMenu

//creates dropdown menu
function drawMenuInfo(colorize, yearExpressed){
    //creates year for map menu
    yearExpressedText = d3.select(".menu-info")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "yearExpressedText menu-info")
        .text(yearExpressed)
        .style({'font-size':'36px', 'font-weight': 'strong'}); 
}; //End DrawMenuInfo

//vcr controls click events
function animateMap(yearExpressed, colorize, yearExpressedText){
    //step backward functionality
    $(".stepBackward").click(function(){
        if (yearExpressed <= keyArray[keyArray.length-1] && yearExpressed > keyArray[0]){
            yearExpressed--;
            changeAttribute(yearExpressed, colorize);
        } else {
            yearExpressed = keyArray[keyArray.length-1];
            changeAttribute(yearExpressed, colorize);
        }; 
    });
    //play functionality
    $(".play").click(function(){
        timer.play();
        $('.play').prop('disabled', true);
    });
    //pause functionality
    $(".pause").click(function(){
        timer.pause();
        $('.play').prop('disabled', false);
        changeAttribute(yearExpressed, colorize);
    });
    //step forward functionality
    $(".stepForward").click(function(){
        if (yearExpressed < keyArray[keyArray.length-1]){
            yearExpressed++;
            changeAttribute(yearExpressed, colorize);
        } else {
            yearExpressed = keyArray[0];
            changeAttribute(yearExpressed, colorize);
        }; 
    });
}; //end AnimateMAP

//for play functionality
function timeMapSequence(yearsExpressed) {
    changeAttribute(yearExpressed, colorize);
    if (yearsExpressed < keyArray[keyArray.length-1]){
        yearExpressed++; 
    };
}; //end timeMapSequence

//changes year displayed on map
function changeAttribute(year, colorize){
    var removeOldYear = d3.selectAll(".yearExpressedText").remove();
    
    for (x = 0; x < keyArray.length; x++){
        if (year == keyArray[x]) {
             yearExpressed = keyArray[x];
        }
    }
    //colorizes state
    d3.selectAll(".states")
        .style("fill", function(year){
            return choropleth(year, colorize);
        })
        .select("desc")
            .text(function(d) {
                return choropleth(d, colorize);
        });
     //alters timeline year text    
    var timelineYear = d3.select(".timeline")
        .selectAll('g')
        .attr("font-weight", function(d){
            if (year == d.getFullYear()){
                return "bold";
            } else {
                return "normal";
            }
        }).attr("font-size", function(d){
            if (year == d.getFullYear()){
                return "18px";
            } else {
                return "12px";
            }
        }).attr("stroke", function(d){
            if (year == d.getFullYear()){
                return "#986cb3";
            } else {
                return "gray";
            }
         });
    drawMenuInfo(colorize, year);
}; //END changeAttribute


//creates the menu items 
function createMenu(arrayX, arrayY, title, infotext, infolink){
    var yArray = [40, 85, 130, 175, 220, 265, 310, 355];
    var oldItems = d3.selectAll(".menuBox").remove();
    var oldItems2 = d3.selectAll(".menuInfoBox").remove();
    
    //creates menuBoxes
    menuBox = d3.select(".menu-inset")
            .append("svg")
            .attr("width", menuWidth)
            .attr("height", menuHeight)
            .attr("class", "menuBox");
    
    //creates Menu Title
    var menuTitle = menuBox.append("text")
        .attr("x", 10)
        .attr("y", 30)
        .attr("class","title")
        .text(title)
        .style("font-size", '14px');
    
    //draws and shades boxes for menu
    for (b = 0; b < arrayX.length; b++){  
       var menuItems = menuBox.selectAll(".items")
            .data(arrayX)
            .enter()
            .append("rect")
            .attr("class", "items")
            .attr("width", 30)
            .attr("height", 30)
            .attr("x", 10);
        
        menuItems.data(yArray)
            .attr("y", function(d, i){
                return d;
            });
        
        menuItems.data(arrayY)
            .attr("fill", function(d, i){ 
                return arrayY[i];
            });
    };
    //creates menulabels
    var menuLabels = menuBox.selectAll(".menuLabels")
        .data(arrayX)
        .enter()
        .append("text")
        .attr("class", "menuLabels")
        .attr("x", 60)
        .text(function(d, i){
            for (var c = 0; c < arrayX.length; c++){
                return arrayX[i]
            }
        })
        .style({'font-size': '12px', 'font-family': 'Open Sans, sans-serif'});
    
        menuLabels.data(yArray)
            .attr("y", function(d, i){
                return d + 20;
            });
    
     //creates menuBoxes
    menuInfoBox = d3.select(".menu-info")
        .append("div")
        .attr("width", menuInfoWidth)
        .attr("height", menuInfoHeight)
        .attr("class", "menuInfoBox textBox")
        .html(infotext + infolink);
}; //end createMenu


//---------------------------------------------//
/* GENERATORS */
//---------------------------------------------//
//SET UP COLOR ARRAYS FOR MAP
function colorScale(data){
// this if/else statement determines which variable is currently being expressed and assigns the appropriate color scheme to currentColors
    if (expressed === "gradeData") {   
        currentColors = colorArrayOverview;
        currentArray = arrayOverview;
    } else if (expressed === "jurisdictionType") {
        currentColors = colorArrayJurisdiction;
        currentArray = arrayJurisdiction;
    } else if (expressed === "totalSpending") {
        currentColors = colorArraySpending;
        currentArray = arraySpending;
    } else if (expressed === "financeType") {
        currentColors = colorArrayFinance;
        currentArray = arrayfinanceType;
    }; 

    scale = d3.scale.ordinal()
                .range(currentColors)
                .domain(currentArray); //sets the range of colors and domain of values based on the currently selected 
    return scale(data[yearExpressed]);
};
//Sets up color scale for chart
function colorScaleChart(data) {
    if (expressed === "gradeData") {   
        currentColors = colorArrayOverview;
        currentArray = arrayOverview;
    } else if (expressed === "jurisdictionType") {
        currentColors = colorArrayJurisdiction;
        currentArray = arrayJurisdiction;
    } else if (expressed === "totalSpending") {
        currentColors = colorArraySpending;
        currentArray = arraySpending;
    }; 

    scale = d3.scale.ordinal()
                .range(currentColors)
                .domain(currentArray); 

    return scale(data);
}; //end Colorscale

function choropleth(d, colorize){
    var data = d.properties ? d.properties[expressed] : d;
    //console.log(d.properties[expressed]);
    return colorScale(data);
};

function choroplethChart(d, colorize) {
    var data = d.properties ? d.properties[expressed] : d;
    return colorScaleChart(d);
};

//---------------------------------------------//
/*              START CHART FUNCTIONS          */
//---------------------------------------------//

// setChart function sets up the timeline chart and calls the updateChart function
function setChart(yearExpressed) {
    // reset the timelineFeatureArray each time setChart is called
    timelineFeatureArray = []; //this will hold the new feature objects that will include a value for which year a law changed
    // colorize is different for the chart since some states have more than one law
    colorizeChart = colorScaleChart(timelineFeatureArray);

    //initial setup of chart
    var chart = d3.select(".graph")
        .append("svg")
        .attr("width", chartWidth+"px")
        .attr("height", chartHeight+"px")
        .attr("class", "chart");
        
    //put all rects in a g element
    var squareContainer = chart.append("g")
        .attr("transform", "translate(" + margin.left + ', ' + margin.top + ')');

    //for-loop creates an array of feature objects that stores three values
    for (var feature in joinedJson) {
        var featureObject = joinedJson[feature];
        for (var thisYear = 1; thisYear<=keyArray.length-1; thisYear++){
            var lastYear = thisYear - 1;
            if (featureObject.properties[expressed][keyArray[thisYear]] != featureObject.properties[expressed][keyArray[lastYear]]) { //have to account for the value not being undefined since the grade data is part of the linked data, and that's not relevant for the timeline
                timelineFeatureArray.push({yearChanged: Number(keyArray[thisYear]), newLaw: featureObject.properties[expressed][keyArray[thisYear]], feature: featureObject}); //each time a law is passed in a given year, a new feature object is pushed to the timelineFeatureArray
            };
        };
    };
    var yearObjectArray = []; //will hold a count for how many features should be drawn for each year, the following for-loop does that

    //for-loop determines how many rects will be drawn for each year
    for (key in keyArray) {
        var yearCount = 1;
        for (i = 0; i < timelineFeatureArray.length; i++) {
            //loop through here to see which year it matches and up
            if (timelineFeatureArray[i].yearChanged == keyArray[key]) {
                //countYears++;
                yearObjectArray.push({"year": Number(keyArray[key]), "count":yearCount});
                yearCount = yearCount++;
            };
        };   
    };

    //attach data to the rects and start drawing them
    chartRect = squareContainer.selectAll(".chartRect")
        .data(timelineFeatureArray) //use data from the timelineFeatureArray, which holds all of the states that had some change in law 
        .enter()
        .append("rect") //create a rectangle for each state
        .attr("class", function(d) {
            return "chartRect " + d.feature.properties.postal;
        })
        .attr("width", squareWidth+"px")
        .attr("height", squareHeight+"px");
    
    //determine the x-scale for the rects, determing where along the x-axis they will be drawn according to which year the law changed
    var x = d3.scale.linear()
        .domain([keyArray[0], keyArray[keyArray.length-1]]) //domain is an array of 2 values: the first and last years in the keyArray (1973 and 2014)
        .rangeRound([0, chartWidth - margin.left - margin.right]); //range determines the x value of the square; it is an array of 2 values: the furthest left x value and the furthest right x value (on the screen)

    //set a time scale for drawing the axis; use a separate time scale rather than a linear scale for formatting purposes.
    var timeScale = d3.time.scale()
        .domain([new Date(keyArray[1]), d3.time.year.offset(new Date(keyArray[keyArray.length-1]), 1)]) //domain is an array of 2 values: the first and last years in the keyArray (1973 and 2014)
        .rangeRound([0, chartWidth - margin.left - margin.right]); //range determines the x value of the square; it is an array of 2 values: the furthest left x value and the furthest right x value (on the screen)

    //place the rects on the chart
    var rectStyle = chartRect.attr("transform", function(d) {
            return "translate(" + x(d.yearChanged) + ")"; //this moves the rect along the x axis according to the scale, depending on the corresponding year that the law changed
        })
        //y-value determined by how many rects are being drawn for each year
        .attr("y", function(d,i) {
            var yValue = 0;
            for (i = 0; i < yearObjectArray.length; i++) {
                if (yearObjectArray[i].year == d.yearChanged) {
                    yValue = yearObjectArray[i].count*(squareHeight+1);
                    yearObjectArray[i].count-=1;
                };
            };
            return yValue;
        })
        .style("fill", function(d) {
            return choroplethChart(d.newLaw, colorize); //apply the color according to what the new law is in that year
        })
        .on("mouseover", highlightChart)
        .on("mouseout", dehighlight);

    //save text description of the color applied to each rect to be able to use this for dehighlight
    rectColor = rectStyle.append("desc")
            .text(function(d) {
                return choroplethChart(d.newLaw, colorize);
            })
            .attr("class", "rectColor");

    //Creates the axis function
    var axis = d3.svg.axis()
        .scale(timeScale)
        .orient("bottom")
        .ticks(d3.time.years, 1)
        .tickFormat(d3.time.format('%y'))
        .tickPadding(5) //distance between axis line and labels
        .innerTickSize(50);

    //sets the thickness of the line between the ticks and the corresponding squares in the chart
    var timelineLine = axis.tickSize(1);

    //sets the margins for the timeline transform
    var timelineMargin = {top: 50, right: 20, bottom: 30, left:40};

    //draw the timeline as a g element on the chart
    var timeline = chart.append("g")
        .attr("height", chartHeight)
        .attr("width", chartWidth)
        .attr('transform', 'translate(' + timelineMargin.left + ',' + (chartHeight - timelineMargin.top - timelineMargin.bottom) + ')') //set the starting x,y coordinates for where the axis will be drawn
        .attr("class", "timeline")
        .call(axis); //calls the axis function on the timeline
    
    //adds mouse events
    timeline.selectAll('g') 
        .each(function(d){
            d3.select(this)
             .on("mouseover", function(){
                 d3.select(this)
                    .attr("font-weight", "bold")
                    .attr("cursor", "pointer")
                    .attr("font-size", "18px")
                    .attr("stroke", "#986cb3");
            })
            .on("mouseout", function(){
                    d3.select(this)
                        .attr("font-weight", "normal")
                        .attr("font-size", "12px")
                        .attr("stroke", "gray")
                        .attr("cursor", "pointer");
            })
            .on("click", function(){
                 d3.select(this)
                    .attr("font-weight", "bold")
                    .attr("cursor", "pointer")
                    .attr("font-size", "18px")
                    .attr("stroke", "#986cb3");
                var year = d.getFullYear();
                changeAttribute(year, colorize);
                animateMap(year, colorize, yearExpressedText);
            });
        });
};

/* ------------END CHART FUNCTIONS------------ */


//---------------------------------------------//
/*       START HIGHLIGHT & LABEL FUNCTIONS     */
//---------------------------------------------//
// Robin's section
//Highlighting for the map
function highlight(data) {
    //holds the currently highlighted feature
    var feature = data.properties ? data.properties : data.feature.properties;
    d3.selectAll("."+feature.postal)
        .style("fill", "#8856A7");

    //set the state name as the label title
    var labelName = feature.name;
    var labelAttribute;

    //set up the text for the dynamic labels for the map
    //labels should match the yearExpressed and the state of the law during that year
    if (expressed == "gradeData") {
        labelAttribute = "Type of Measure(s): "+feature[expressed][Number(yearExpressed)];
    } else if (expressed == "jurisdictionType") {
        labelAttribute = yearExpressed+"<br>"+feature[expressed][Number(yearExpressed)];
    } else  if (expressed == "totalSpending") {
        labelAttribute = "Spending: "+feature[expressed][Number(yearExpressed)];
    } else if (expressed == "financeType") {
        labelAttribute = "Finance Mechanism: "+feature[expressed][Number(yearExpressed)];
    }

    var infoLabel = d3.select(".map")
        .append("div")
        .attr("class", "infoLabel")
        .attr("id",feature.postal+"label")
        .attr("padding-left", 500+"px");

    var labelTitle = d3.select(".infoLabel")
        .html(labelName)
        .attr("class", "labelTitle");

    var labelAttribute = d3.select(".labelTitle")
        .append("div")
        .html(labelAttribute)
        .attr("class", "labelAttribute")
};

//Function for highlighting the chart
function highlightChart(data) {
    //holds the currently highlighted feature
    var feature = data.properties ? data.properties : data.feature.properties;
    d3.selectAll("."+feature.postal)
        .style("fill", "#8856A7");

    //set the state name as the label title
    var labelName = feature.name;
    var labelAttribute;

    //set up the text for the dynamic labels
    //when highlighting the chart, the labels reflect the year the law changed and the law that was changed that year, regardless of which year is being shown on the map
    if (expressed == "jurisdictionType") {
        if (data.newLaw == "No State Measures Passed") {
        labelAttribute = data.yearChanged+"<br>No Measure Passed";
        } else {
        labelAttribute = data.yearChanged+"<br>Jurisdiction Type: "+data.newLaw;
        }
    } else if (expressed == "financeType") {
        if (data.newLaw == "none") {
        labelAttribute = data.yearChanged+"<br>No Measure Passed";
        } else {
            labelAttribute = data.yearChanged+"<br>Finance Mechanism: "+data.newLaw;
        }
    } 

    var infoLabel = d3.select(".map")
        .append("div")
        .attr("class", "infoLabel")
        .attr("id",feature.postal+"label")
        .attr("padding-left", 500+"px");

    var labelTitle = d3.select(".infoLabel")
        .html(labelName)
        .attr("class", "labelTitle");

    var labelAttribute = d3.select(".labelTitle")
        .append("div")
        .html(labelAttribute)
        .attr("class", "labelAttribute")
};

//Dehlighting for the map & chart
function dehighlight(data) {
    var feature = data.properties ? data.properties : data.feature.properties;

    var deselect = d3.selectAll("#"+feature.postal+"label").remove();

    //dehighlighting the states
    var selection = d3.selectAll("."+feature.postal)
        .filter(".states");    
    var fillColor = selection.select("desc").text();
    selection.style("fill", fillColor);

    //dehighlighting the chart
    var chartSelection = d3.selectAll("."+feature.postal)
        .filter(".chartRect");
    var chartFillColor = chartSelection.select("desc").text();
    chartSelection.style("fill", chartFillColor);

};

// jQuery timer for play/pause
var timer = $.timer(function() {
        if (yearExpressed == keyArray[keyArray.length-1]){
            yearExpressed = keyArray[0];
        };
        animateMap(yearExpressed, colorize, yearExpressedText);
        timeMapSequence(yearExpressed);  
	});
timer.set({ time : 800, autostart : false });