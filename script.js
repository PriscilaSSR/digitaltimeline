document.addEventListener("DOMContentLoaded", function() {
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  const data = window.timelineItems;

  // We'll still use a 2000x2000 viewBox:
  const viewBoxSize = 2000;
  const center = viewBoxSize / 2; // 1000

  // Increase the largest ring radius so it’s huge compared to the 2000×2000 space
  // For instance, 80% of half the viewBox => 800
  const maxOuterRadius = center * 0.9; // 800

  // Now define annular ranges for each category:
  //   EED: 0 to 1/3 of 800 => [0, ~266]
  //   CSB: 1/3 to 2/3 => [~266, ~533]
  //   SF:  2/3 to 3/3 => [~533, 800]
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * (1/3)],
    "Conceptual & Scientific Breakthroughs": [maxOuterRadius * (1/3), maxOuterRadius * (2/3)],
    "Sociocultural Factors": [maxOuterRadius * (2/3), maxOuterRadius]
  };

  // Colors for each category
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#c62828", "#1565c0", "#2e7d32"]);

  // Create the SVG + container for zoom/pan
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const container = svg.append("g")
    .attr("class", "zoom-container");

  // Draw big circles for visual reference
  const categories = [
    {
      name: "Sociocultural Factors",
      outerRadius: maxOuterRadius,
      color: "#c62828"
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      outerRadius: maxOuterRadius * (2/3),
      color: "#1565c0"
    },
    {
      name: "Engineering Experiments & Demonstrations",
      outerRadius: maxOuterRadius * (1/3),
      color: "#2e7d32"
    },
  ];

  const ringGroups = container.selectAll("g.ring-group")
    .data(categories)
    .enter()
    .append("g");

  ringGroups.append("circle")
    .attr("cx", center)
    .attr("cy", center)
    .attr("r", d => d.outerRadius)
    .style("fill", d => d.color)
    .style("fill-opacity", 0.1)
    .style("stroke", d => d.color)
    .style("stroke-dasharray", "3,3");

  ringGroups.append("text")
    .attr("x", center)
    .attr("y", d => center - d.outerRadius + 30)
    .attr("text-anchor", "middle")
    .text(d => d.name)
    .style("fill", d => d.color)
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("opacity", 0.3);

  // Build link data
  const titleToIndex = new Map();
  data.forEach((d, i) => {
    titleToIndex.set(d.title, i);
  });
  const linksData = [];
  data.forEach((d, i) => {
    if (!d.connections) return;
    d.connections.forEach(conn => {
      const j = titleToIndex.get(conn);
      if (j !== undefined && j > i) {
        linksData.push({ source: i, target: j });
      }
    });
  });

  // Force simulation with "floating" inside ring constraints
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.15)
    .force("charge", d3.forceManyBody().strength(10))
    .force("collide", d3.forceCollide(60))
    .on("tick", ticked);

  // Random initial positions near the center
  data.forEach(d => {
    d.x = center + (Math.random() - 0.5) * 50;
    d.y = center + (Math.random() - 0.5) * 50;
  });

  // Draw links
  const linkSelection = container.selectAll("line.link")
    .data(linksData)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "#999")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  // Draw node groups
  const circleRadius = 50;
  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .on("click", (event, d) => showModal(d));

  nodeGroup.append("circle")
    .attr("r", circleRadius)
    .attr("fill", d => colorScale(d.category))
    .style("stroke", "#333")
    .style("stroke-width", 1);

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

  // Each tick, clamp node positions to ring
  function ticked() {
    data.forEach(d => {
      const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
      const dx = d.x - center;
      const dy = d.y - center;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist > 0) {
        // If too close, push outward
        if (dist < rMin) {
          const ratio = rMin / dist;
          d.x = center + dx * ratio;
          d.y = center + dy * ratio;
        }
        // If too far, pull inward
        else if (dist > rMax) {
          const ratio = rMax / dist;
          d.x = center + dx * ratio;
          d.y = center + dy * ratio;
        }
      } else {
        // If exactly at center, nudge outward
        d.x = center + rMin;
        d.y = center;
      }
    });

    // Update link endpoints
    linkSelection
      .attr("x1", d => data[d.source].x)
      .attr("y1", d => data[d.source].y)
      .attr("x2", d => data[d.target].x)
      .attr("y2", d => data[d.target].y);

    // Update node positions
    nodeGroup
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
  }

  // Zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", event => {
      container.attr("transform", event.transform);
    });
  svg.call(zoom);

  // Hook up plus/minus buttons
  d3.select("#zoom-in").on("click", () => {
    svg.transition().call(zoom.scaleBy, 1.2);
  });
  d3.select("#zoom-out").on("click", () => {
    svg.transition().call(zoom.scaleBy, 1/1.2);
  });

  // Modal logic
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
  window.onclick = e => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
});
