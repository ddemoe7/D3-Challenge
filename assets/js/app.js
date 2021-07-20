// D3.js challenge
var svgWidth = 680;
var svgHeight = 560;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function (risksData) {

    // Parse data
    risksData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Create scale functions
    var xLinearScale = d3.scaleLinear()
        .domain([8, d3.max(risksData, d => d.poverty + 2)])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([4, d3.max(risksData, d => d.healthcare + 2)])
        .range([height, 0]);

    // Create functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(risksData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "blue")
        .attr("opacity", ".5")
        .attr("stroke", "white");

    var text = chartGroup.append("g").selectAll("text")
        .data(risksData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("dy", ".35em")
        .text(d => d.abbr)
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("fill", "white")
        .attr("font-weight", "700")
        .attr("stroke-width", "500");

    // Create labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Without Healthcare (%)")
        .attr("text-anchor", "middle")
        .attr("font-weight", "700");

    chartGroup.append("text")
        .attr("transform", "translate(270, 500)")
        .attr("class", "axisText")
        .text("In Poverty (%)")
        .attr("text-anchor", "middle")
        .attr("font-weight", "700");


}).catch(function (error) {
    console.log(error);
});