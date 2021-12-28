// Set SVG width, height, and margins
var svgWidth = 680;
var svgHeight = 560;

var margin = {
  top: 100,
  right: 100,
  bottom: 150,
  left: 100,
};

// Set width and height of graphic based on margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold chart,
// SVG within div class=scatter
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group and translate based on margins
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set initial parameters to be used for x and y axes
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Create function used for updating x-scale
function xScale(demographicData, chosenXAxis) {
  // Create x-scale
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(demographicData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(demographicData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}

// Create function used for updating y-scale
function yScale(demographicData, chosenYAxis) {
  // Create y-scale
  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(demographicData, (d) => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

// Function to re-render x-axis after selecting a new variable
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// Function to re-render y-axis after selecting a new variable
function renderYAxis(newYScale, yAxis) {

  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}

// Function to update circle positions based on new chosen x-axis
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  // Update location of circles
  circlesGroup
    .transition()
    .attr("cx", (d) => newXScale(d[chosenXAxis]))
    .duration(1000);

  d3.selectAll("#data-label").each(function () {
    d3.select(this)
      .transition()
      .attr("dx", function (d) {
        return newXScale(d[chosenXAxis]);
      })
      .duration(1000);
  });

  return circlesGroup;
}

// Function to update circle positions based on new chosen y-axis
function renderCirclesYAxis(circlesGroup, newYScale, chosenYAxis) {
  // Update location of circles
  circlesGroup
    .transition()
    .attr("cy", (d) => newYScale(d[chosenYAxis]))
    .selectAll("text")
    .attr("dy", (d) => newYScale(d[chosenYAxis]))
    .duration(1000);

  d3.selectAll("#data-label").each(function () {
    d3.select(this)
      .transition()
      .attr("dy", function (d) {
        return newYScale(d[chosenYAxis]);
      })
      .duration(1000);
  });

  return circlesGroup;
}

// Declare function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // Create tooltip
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .html(function (d) {

      var tooltip_html_string;
      var tooltip_x_label;
      var tooltip_y_label;

      if (chosenXAxis === "poverty") {
        tooltip_x_label = `<br>Poverty: ${d.poverty}%`;
      } else if (chosenXAxis === "age") {
        tooltip_x_label = `<br>Age: ${d.age}`;
      } else {
        tooltip_x_label = `<br>Household Income: ${d.income}`;
      }

      if (chosenYAxis === "healthcare") {
        tooltip_y_label = `<br>Lacks Healthcare: ${d.healthcare}%`;
      } else if (chosenYAxis === "obesity") {
        tooltip_y_label = `<br>Obese: ${d.obesity}%`;
      } else {
        tooltip_y_label = `<br>Smokes: ${d.smokes}%`;
      }

      // Full tooltip
      tooltip_html_string = `${d.state}${tooltip_x_label}${tooltip_y_label}`;
      return tooltip_html_string;
    });

  circlesGroup.call(toolTip);

  // Event listeners for hovering over datapoint
  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data, this);
    })
    // hide tooltip on event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Create function to read in data.csv file
d3.csv("./assets/data/data.csv")
  .then(function (demographicData, err) {
    if (err) throw err;

    demographicData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

    var xLinearScale = xScale(demographicData, chosenXAxis);
    var yLinearScale = yScale(demographicData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // x-axis
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
   
      // y-axis
    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    var circlesGroup = chartGroup
      .selectAll("circle")
      .data(demographicData)
      .enter();

    circlesGroup
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
      .attr("r", 10);

    circlesGroup
      .append("text")
      .attr("id", "data-label")
      .attr("dx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("dy", (d) => yLinearScale(d[chosenYAxis]) + 2)
      .text(function (d) {

        return d.abbr;
      })
      .style("font-size", "8px")
      .classed("stateText", true);

    var circlesGroup = chartGroup.selectAll("circle").data(demographicData);
    updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Axis labels
    var labelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var xAxisLabel = labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var xAxisLabel2 = labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    var xAxisLabel3 = labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");

    // append y-axis
    var yLabelsGroup = chartGroup.append("g");

    var yAxisLabel = yLabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("aText active y-axis-label", true)
      .text("Lacks Healthcare (%)");

    var yAxisLabel2 = yLabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("aText inactive y-axis-label", true)
      .text("Obese (%)");

    var yAxisLabel3 = yLabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("aText inactive y-axis-label", true)
      .text("Smokes (%)");

    // X-axis labels
    labelsGroup.selectAll("text").on("click", function () {

      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        chosenXAxis = value;


        xLinearScale = xScale(demographicData, chosenXAxis);

        xAxis = renderXAxis(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        if (chosenXAxis === "poverty") {

          xAxisLabel.classed("active", true).classed("inactive", false);
          xAxisLabel2.classed("active", false).classed("inactive", true);
          xAxisLabel3.classed("active", false).classed("inactive", true);
        } else if (chosenXAxis === "age") {
          xAxisLabel.classed("active", false).classed("inactive", true);
          xAxisLabel2.classed("active", true).classed("inactive", false);
          xAxisLabel3.classed("active", false).classed("inactive", true);
        } else {
          xAxisLabel.classed("active", false).classed("inactive", true);
          xAxisLabel2.classed("active", false).classed("inactive", true);
          xAxisLabel3.classed("active", true).classed("inactive", false);
        }
      }

      // Update tooltip 
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    });

    chartGroup.selectAll(".y-axis-label").on("click", function () {

      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        chosenYAxis = value;

        yLinearScale = yScale(demographicData, chosenYAxis);

        yAxis = renderYAxis(yLinearScale, yAxis);

        circlesGroup = renderCirclesYAxis(
          circlesGroup,
          yLinearScale,
          chosenYAxis
        );

        if (chosenYAxis === "healthcare") {
          yAxisLabel.classed("active", true).classed("inactive", false);
          yAxisLabel2.classed("active", false).classed("inactive", true);
          yAxisLabel3.classed("active", false).classed("inactive", true);
        } else if (chosenYAxis === "obesity") {
          yAxisLabel.classed("active", false).classed("inactive", true);
          yAxisLabel2.classed("active", true).classed("inactive", false);
          yAxisLabel3.classed("active", false).classed("inactive", true);
        } else {
          yAxisLabel.classed("active", false).classed("inactive", true);
          yAxisLabel2.classed("active", false).classed("inactive", true);
          yAxisLabel3.classed("active", true).classed("inactive", false);
        }
      }

      // Update tooltip based on both chosen X and Y axes
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    });
  })
  .catch(function (error) {
    console.log(error);
  });