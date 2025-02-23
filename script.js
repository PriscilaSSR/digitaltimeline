document.addEventListener("DOMContentLoaded", function() {
  // 1) Load data from timelineData.js
  const data = window.timelineItems;

  // 2) Get the browser window size
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // We use a "viewBox" approach for responsiveness.
  // We'll create an SVG coordinate system bigger than the window so there's room to pan around.
  // For instance, let's make a 2000 x 2000 coordinate system,
  // centered around (1000,1000).
  // We'll still show it in the <svg> that is 100% of the window, but the user can drag or zoom around.

  const viewBoxSize = 2000;    // total coordinate system dimension
  const centerCoord = viewBoxSize / 2; // 1000 if viewBoxSize=2000

  // 3) We define the maximum outer ring radius as ~40% of half the viewBox
  // so it fits comfortably with some margin. You can adjust this as you like.
  const maxOuterRadius = centerCoord * 0.4;  // 0.4 of 1000 => 400

  // The ring definitions: 
  //   Engineering: 0   to 1/3 of max
  //   Conceptual:  1/3 to 2/3 of max
  //   Socio:       2/3 to 3/3 of max
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * (1/3)],
    "Conceptual & Scientific Breakthroughs": [maxOuterRadius * (1/3), maxOuterRadius * (2/3)],
    "Sociocultural Factors": [maxOuterRadius * (2/3), maxOuterRadius]
  };

  // For coloring and labeling each ring
  const categories = [
    {
      name: "Sociocultural Factors",
      outerRadius: maxOuterRadius,
      color: "#c62828" // red
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      outerRadius: maxOuterRadius * (2/3),
      color: "#1565c0" // blue
    },
    {
      name: "Engineering Experiments & Demonstrations",
      outerRadius: maxOuterRadius * (1/3),
      color: "#2e7d32" // green
    }
  ];

  // 4) Create the SVG with a large viewBox
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // We'll use a container <g> for rings, links, nodes (so we can zoom/pan them)
  const container = svg.append("g")
    .attr("class", "zoom-container");

  // 5) Draw the colored rings & their labels
  const ringGroups = container.selectAll("g.ring-group")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "ring-group");

  ringGroups.append("circle")
    .attr("cx", centerCoord)
    .attr("cy", centerCoord)
    .attr("r", d => d.outerRadius)
    .style("fill", d => d.color)
    .style("fill-opacity", 0.1)
    .style("stroke", d => d.color)
    .style("stroke-dasharray", "3,3");

  ringGroups.append("text")
    .attr("x", centerCoord)
    .attr("y", d => centerCoord - d.outerRadius + 30)
    .text(d => d.name)
    .attr("text-anchor", "middle")
    .style("fill", d => d.color)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("opacity", 0.3);

  // 6) Color scale for nodes
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#c62828", "#1565c0", "#2e7d32"]);

  // 7) Randomly position each node in its ring
  data.forEach(d => {
    const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius / 3];
    const r = rMin + (rMax - rMin) * Math.random(); // random radius
    const angle = Math.random() * 2 * Math.PI;
    d.x = centerCoord + r * Math.cos(angle);
    d.y = centerCoord + r * Math.sin(angle);
  });

  // 8) Build link array from "connections"
  const titleToIndex = new Map();
  data.forEach((d, i) => {
    titleToIndex.set(d.title, i);
  });
  const links = [];
  data.forEach((d, i) => {
    if (!d.connections) return;
    d.connections.forEach(connTitle => {
      const targetIndex = titleToIndex.get(connTitle);
      if (targetIndex !== undefined && targetIndex > i) {
        links.push({ source: i, target: targetIndex });
      }
    });
  });

  // 9) Draw the links
  container.selectAll("line.link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", d => data[d.source].x)
    .attr("y1", d => data[d.source].y)
    .attr("x2", d => data[d.target].x)
    .attr("y2", d => data[d.target].y)
    .style("stroke", "#999")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  // 10) Draw bigger nodes with text inside
  const circleRadius = 50; // bigger so we can read the text
  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .on("click", (event, d) => showModal(d));

  nodeGroup.append("circle")
    .attr("r", circleRadius)
    .attr("fill", d => colorScale(d.category))
    .style("stroke", "#333")
    .style("stroke-width", 1);

  // text inside the circle with <foreignObject> for wrapping
  nodeGroup.append("foreignObject")
    .attr("x", -circleRadius * 0.8)
    .attr("y", -circleRadius * 0.8)
    .attr("width", circleRadius * 1.6)
    .attr("height", circleRadius * 1.6)
    .append("xhtml:div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("text-align", "center")
    .style("font-size", "12px")
    .style("width", circleRadius * 1.6 + "px")
    .style("height", circleRadius * 1.6 + "px")
    .style("overflow", "hidden")
    .html(d => `<strong>${d.title}</strong><br/><em>${d.date}</em>`);

  // 11) Modal logic for clicking a node
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("close");

  function showModal(d) {
    modal.style.display = "block";
    document.getElementById("modal-title").innerText = d.title;
    document.getElementById("modal-date").innerText = "Date: " + d.date;
    document.getElementById("modal-description").innerText = d.description;
    document.getElementById("modal-location").innerText = d.location;
    document.getElementById("modal-people").innerText = (d.people || []).join(", ");
    document.getElementById("modal-image").src = d.img;
    document.getElementById("modal-image").alt = d.title;
  }
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = event => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // 12) D3 Zoom & Pan
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5]) // allow more extreme zoom out/in
    .on("zoom", event => {
      container.attr("transform", event.transform);
    });

  svg.call(zoom);

  // 13) Plus/Minus Buttons
  const zoomInButton = document.getElementById("zoom-in");
  const zoomOutButton = document.getElementById("zoom-out");

  zoomInButton.addEventListener("click", () => {
    svg.transition().call(zoom.scaleBy, 1.2);
  });
  zoomOutButton.addEventListener("click", () => {
    svg.transition().call(zoom.scaleBy, 1/1.2);
  });

  // OPTIONAL: If you want the visualization to adjust if the user resizes the window,
  // you can add an event listener that re-measures window.innerWidth/innerHeight,
  // redefines the 'viewBox', and re-renders. For many cases, just using the
  // viewBox + preserveAspectRatio is enough for normal resizing.
});
