document.addEventListener("DOMContentLoaded", function() {
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  const data = window.timelineItems;

  // We'll still use a 2000x2000 viewBox:
  const viewBoxSize = 2000;
  const center = viewBoxSize / 2; // 1000

  // Increase the largest ring radius so it's huge compared to the 2000×2000 space
  // For instance, 80% of half the viewBox => 800
  const maxOuterRadius = center * 0.9; // 800

  // Now define annular ranges for each category:
  //   EED: 0 to 1/3 of 800 => [0, ~266]
  //   CSB: 1/3 to 2/3 => [~266, ~533]
  //   SF:  2/3 to 3/3 => [~533, 800]
  //   Human's Dream: not used for node placement, just visual
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * (1/3)],
    "Conceptual & Scientific Breakthroughs": [maxOuterRadius * (1/3), maxOuterRadius * (2/3)],
    "Sociocultural Factors": [maxOuterRadius * (2/3), maxOuterRadius],
    "Human's Dream of Flying": [maxOuterRadius, maxOuterRadius * 1.1] // Not used for node placement
  };

  // Colors for each category
  const colorScale = d3.scaleOrdinal()
    .domain(["Human's Dream of Flying", "Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#9c27b0", "#c62828", "#1565c0", "#2e7d32"]);

  // Create the SVG + container for zoom/pan
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const container = svg.append("g")
    .attr("class", "zoom-container");

  // -------------------------
  // 2) PARSE DATES AND CREATE TIME ARCS
  // -------------------------
  
  // Function to parse dates from the timeline data
  function parseTimelineDate(dateStr) {
    dateStr = dateStr.trim();
    
    // Handle BCE dates
    if (dateStr.includes('BCE')) {
      const year = parseInt(dateStr.replace(/[^0-9]/g, ''));
      return -year; // Negative values for BCE
    }
    
    // Handle century formats like "100s", "1600s"
    if (dateStr.match(/^\d+s$/)) {
      return parseInt(dateStr);
    }
    
    // Handle date ranges like "1760–1840" or "1865-1904"
    if (dateStr.includes('–') || dateStr.includes('-')) {
      const parts = dateStr.split(/[–-]/);
      const startYear = parseInt(parts[0]);
      return startYear; // Just use the start year for positioning
    }
    
    // Handle century descriptions like "17th–19th Centuries"
    if (dateStr.includes('Centuries') || dateStr.includes('Century')) {
      // Extract the first century mentioned
      const match = dateStr.match(/(\d+)(?:st|nd|rd|th)/);
      if (match) {
        return (parseInt(match[1]) - 1) * 100; // 17th century starts at 1600
      }
    }
    
    // Handle simple years
    if (dateStr.match(/^\d+$/)) {
      return parseInt(dateStr);
    }
    
    // Default fallback
    return 0;
  }

  // Parse all dates
  data.forEach(d => {
    d.parsedYear = parseTimelineDate(d.date);
    // Assign the century group
    d.century = Math.floor(d.parsedYear / 100) * 100;
  });

  // Find date range for time slices
  const years = data.map(d => d.parsedYear);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  // Round to nearest millenia for BCE and nearest century for CE
  const adjustedMinYear = Math.floor(minYear / 1000) * 1000;
  const adjustedMaxYear = Math.ceil(maxYear / 100) * 100;
  
  // Create century breaks
  const centuries = [];
  for (let year = adjustedMinYear; year <= adjustedMaxYear; year += 100) {
    centuries.push(year);
  }
  
  // Calculate the angle each century should span
  const totalAngle = 2 * Math.PI; // Full circle
  const anglePerCentury = totalAngle / centuries.length;

  // -------------------------
  // 3) DRAW CATEGORY RINGS WITH TIME SLICES
  // -------------------------
  
  // Draw big circles for visual reference with time slices
  const categories = [
    {
      name: "Human's Dream of Flying",
      outerRadius: maxOuterRadius * 1.1, // Make it larger than the other rings
      innerRadius: maxOuterRadius,
      color: "#9c27b0"
    },
    {
      name: "Sociocultural Factors",
      outerRadius: maxOuterRadius,
      innerRadius: maxOuterRadius * (2/3),
      color: "#c62828"
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      outerRadius: maxOuterRadius * (2/3),
      innerRadius: maxOuterRadius * (1/3),
      color: "#1565c0"
    },
    {
      name: "Engineering Experiments & Demonstrations",
      outerRadius: maxOuterRadius * (1/3),
      innerRadius: 0,
      color: "#2e7d32"
    },
  ];

  // Create ring groups
  const ringGroups = container.selectAll("g.ring-group")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "ring-group");

  // Create the arc generator for time slices
  const arcGenerator = d3.arc()
    .startAngle((d, i) => i * anglePerCentury)
    .endAngle((d, i) => (i + 1) * anglePerCentury)
    .innerRadius(d => d.ringData.innerRadius)
    .outerRadius(d => d.ringData.outerRadius)
    .padAngle(0.01);

  // For each category, create century slices
  ringGroups.each(function(categoryData) {
    const group = d3.select(this);
    
    // Skip time slices for the outer "Human's Dream of Flying" ring
    if (categoryData.name === "Human's Dream of Flying") {
      group.append("circle")
        .attr("cx", center)
        .attr("cy", center)
        .attr("r", categoryData.outerRadius)
        .style("fill", categoryData.color)
        .style("fill-opacity", 0.05)
        .style("stroke", categoryData.color)
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5");
      
      // Add the label
      group.append("text")
        .attr("x", center)
        .attr("y", center - categoryData.outerRadius + 30)
        .attr("text-anchor", "middle")
        .text(categoryData.name)
        .style("fill", categoryData.color)
        .style("opacity", 0.5)
        .style("font-size", "30px");
        
      return;
    }
    
    // Create data for each time slice
    const timeSliceData = centuries.map((century, i) => {
      return {
        century: century,
        index: i,
        ringData: categoryData,
        // Count items in this category and century
        count: data.filter(d => d.category === categoryData.name && d.century === century).length
      };
    });

    // Draw arcs for each time slice
    group.selectAll("path.time-slice")
      .data(timeSliceData)
      .enter()
      .append("path")
      .attr("class", "time-slice")
      .attr("d", arcGenerator)
      .attr("transform", `translate(${center}, ${center})`)
      .style("fill", d => {
        const baseColor = categoryData.color;
        // Vary the opacity based on whether there are events in this slice
        return d.count > 0 ? baseColor : d3.color(baseColor).copy({opacity: 0.05});
      })
      .style("stroke", categoryData.color)
      .style("stroke-width", 0.5)
      .style("opacity", d => d.count > 0 ? Math.min(0.9, 0.7 + (d.count * 0.05)) : 0.1)
      .append("title") // Add tooltip with century and count info
      .text(d => `${d.century < 0 ? Math.abs(d.century) + 's BCE' : d.century + 's'}: ${d.count} events`);

    // Add the category label
    group.append("text")
      .attr("x", center)
      .attr("y", center - categoryData.outerRadius + 30)
      .attr("text-anchor", "middle")
      .text(categoryData.name)
      .style("fill", categoryData.color)
      .style("opacity", 0.3)
      .style("font-size", "24px");
    
    // Add some century labels (every few centuries)
    const labelInterval = Math.max(1, Math.floor(centuries.length / 12)); // Don't show too many labels
    
    timeSliceData.forEach((d, i) => {
      if (i % labelInterval === 0) {
        // Calculate position on the middle of the arc
        const angle = (i + 0.5) * anglePerCentury - Math.PI / 2; // Start at the top
        const radius = (categoryData.innerRadius + categoryData.outerRadius) / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        
        // Add century label
        group.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("transform", `rotate(${angle * 180 / Math.PI + 90}, ${x}, ${y})`) // Rotate text to follow arc
          .text(d.century < 0 ? `${Math.abs(d.century)}s BCE` : `${d.century}s`)
          .style("fill", "#fff")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("opacity", 0.6);
      }
    });
  });

  // -------------------------
  // 4) INITIALIZE NODE POSITIONS AND LINKS
  // -------------------------

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

  // Position nodes on their century arc
  data.forEach(d => {
    // Find the century index
    const centuryIndex = centuries.findIndex(c => c === d.century);
    
    // Calculate the angle for this century
    const angle = (centuryIndex + 0.5) * anglePerCentury;
    
    // Find the min/max radius for this category
    const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
    const avgRadius = (rMin + rMax) / 2;
    
    // Position at the center of the arc
    d.x = center + Math.cos(angle) * avgRadius;
    d.y = center + Math.sin(angle) * avgRadius;
    
    // Flag to determine if the node is being dragged
    d.isDragging = false;
  });

  // Force simulation with "floating" inside ring constraints
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.15)
    .force("charge", d3.forceManyBody().strength(10))
    .force("collide", d3.forceCollide(60))
    .on("tick", ticked);

  // Draw links
  const linkSelection = container.selectAll("line.link")
    .data(linksData)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "#999")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  // Create drag behavior
  const drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  // Draw node groups with drag capability
  const circleRadius = 50;
  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .on("click", (event, d) => {
      // Only show modal if we're not dragging
      if (!d.wasDragged) {
        showModal(d);
      }
      // Reset the flag
      d.wasDragged = false;
    })
    .call(drag); // Add drag behavior

  nodeGroup.append("circle")
    .attr("r", circleRadius)
    .attr("fill", d => colorScale(d.category))
    .style("stroke", "#333")
    .style("stroke-width", 1)
    .style("cursor", "move"); // Change cursor to indicate draggable

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
    .style("pointer-events", "none") // Make text non-interactable so it doesn't interfere with dragging
    .html(d => `<strong>${d.title}</strong><br/><em>${d.date}</em>`);

  // -------------------------
  // 5) DRAG FUNCTIONS
  // -------------------------
  
  // Drag functions
  function dragstarted(event, d) {
    // Stop simulation during drag
    simulation.alphaTarget(0).stop();
    d.isDragging = true;
    d.wasDragged = false; // Reset this flag when we start dragging
  }

  function dragged(event, d) {
    d.wasDragged = true; // Set this flag to indicate drag happened
    
    // Update node positions
    d.x = event.x;
    d.y = event.y;
    
    // Apply constraints to keep nodes in their category rings
    applyRingConstraints(d);
    
    // Update node group position
    d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
    
    // Update link positions connected to this node
    updateLinks();
  }

  function dragended(event, d) {
    d.isDragging = false;
    // Restart simulation with a gentle alpha
    simulation.alphaTarget(0.05).restart();
    setTimeout(() => simulation.alphaTarget(0), 300); // Gradually stop
  }

  // Apply ring constraints to a specific node
  function applyRingConstraints(d) {
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
  }
  // Update link positions based on node positions
  function updateLinks() {
    linkSelection
      .attr("x1", d => data[d.source].x)
      .attr("y1", d => data[d.source].y)
      .attr("x2", d => data[d.target].x)
      .attr("y2", d => data[d.target].y);
  }

  // Each tick, update positions
  function ticked() {
    // Apply ring constraints to all nodes not being dragged
    data.forEach(d => {
      if (!d.isDragging) {
        applyRingConstraints(d);
      }
    });

    // Update link endpoints
    updateLinks();

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
