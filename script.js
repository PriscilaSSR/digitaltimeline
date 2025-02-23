document.addEventListener("DOMContentLoaded", function() {
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  const data = window.timelineItems;

  // We’ll still use an SVG coordinate system of 2000x2000,
  // but you can adjust if you like
  const viewBoxSize = 2000;
  const center = viewBoxSize / 2; // The logical center is (1000,1000)

  // We'll define a maximum outer radius for the largest ring
  const maxOuterRadius = 400; // You can tweak for style

  // Annular ranges for each category (Engineering, Conceptual, Sociocultural)
  // [rMin, rMax]
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * (1/3)],
    "Conceptual & Scientific Breakthroughs": [maxOuterRadius * (1/3), maxOuterRadius * (2/3)],
    "Sociocultural Factors": [maxOuterRadius * (2/3), maxOuterRadius]
  };

  // Colors for each category
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#c62828", "#1565c0", "#2e7d32"]);

  // Make the <svg> fill the parent and set up a big viewBox
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Container <g> for zoom/pan
  const container = svg.append("g")
    .attr("class", "zoom-container");

  // Create ring shapes & labels behind everything
  // (just for visual reference)
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

  // 2) BUILD CONNECTIONS (same as before)
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

  // 3) MAKE D3 SIMULATION
  // Instead of specifying x,y, we let the simulation handle it.
  // We'll give each node a ring constraint in the 'tick' so it stays in [rMin, rMax].
  const simulation = d3.forceSimulation(data)
    // Keep them from drifting infinitely
    .velocityDecay(0.15)
    // Small repulsive force so nodes don’t all cluster
    .force("charge", d3.forceManyBody().strength(10))
    // Optionally ensure nodes don't overlap (circle radius ~ 50 => collision radius ~ 50)
    .force("collide", d3.forceCollide(60))
    // We won't define x,y forces, because we'll do a custom "ring constraint" instead
    .on("tick", ticked);

  // Random initial positions near center, so they don't all start at (0,0)
  data.forEach(d => {
    d.x = center + (Math.random() - 0.5) * 50; // random small offset
    d.y = center + (Math.random() - 0.5) * 50;
  });

  // 4) DRAW LINKS & NODES
  const linkSelection = container.selectAll("line.link")
    .data(linksData)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "#999")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .on("click", (event, d) => showModal(d));

  const circleRadius = 50;
  nodeGroup.append("circle")
    .attr("r", circleRadius)
    .attr("fill", d => colorScale(d.category))
    .style("stroke", "#333")
    .style("stroke-width", 1);

  // Title & Date inside the circle
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

  // 5) CUSTOM "RING" CONSTRAINT each tick
  // We'll keep each node inside the ring range for its category
  function ticked() {
    // clamp positions to each node's ring range
    data.forEach(d => {
      const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
      // distance from center
      const dx = d.x - center;
      const dy = d.y - center;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist > 0) {
        // if below rMin, push outward
        if (dist < rMin) {
          const ratio = rMin / dist;
          d.x = center + dx * ratio;
          d.y = center + dy * ratio;
        }
        // if above rMax, pull inward
        else if (dist > rMax) {
          const ratio = rMax / dist;
          d.x = center + dx * ratio;
          d.y = center + dy * ratio;
        }
      } else {
        // if dist=0 (exactly center), just place at rMin or midpoint
        d.x = center + rMin;
        d.y = center;
      }
    });

    // update link positions
    linkSelection
      .attr("x1", d => data[d.source].x)
      .attr("y1", d => data[d.source].y)
      .attr("x2", d => data[d.target].x)
      .attr("y2", d => data[d.target].y);

    // update node <g> transforms
    nodeGroup
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
  }

  // 6) ZOOM & PAN
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", event => {
      container.attr("transform", event.transform);
    });
  svg.call(zoom);

  // 7) PLUS/MINUS Buttons
  d3.select("#zoom-in").on("click", () => {
    svg.transition().call(zoom.scaleBy, 1.2);
  });
  d3.select("#zoom-out").on("click", () => {
    svg.transition().call(zoom.scaleBy, 1/1.2);
  });

  // 8) MODAL LOGIC
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
