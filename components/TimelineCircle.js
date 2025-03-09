import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const TimelineCircle = ({ events, onEventClick }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 800;
    const radius = 350;

    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove(); // Clear previous render

    const group = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const angleScale = d3
      .scaleLinear()
      .domain([0, events.length])
      .range([0, 2 * Math.PI]);

    const colorScale = d3
      .scaleOrdinal()
      .domain([...new Set(events.map((d) => d.category))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    group
      .selectAll("circle")
      .data(events)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => Math.cos(angleScale(i)) * radius)
      .attr("cy", (d, i) => Math.sin(angleScale(i)) * radius)
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d.category))
      .style("cursor", "pointer")
      .on("click", onEventClick)
      .append("title")
      .text((d) => d.title);

  }, [events, onEventClick]);

  return <svg ref={svgRef} />;
};

export default TimelineCircle;
