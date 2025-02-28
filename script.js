// 1. IMPROVEMENT: Implement logarithmic time scaling for better distribution
// This will compress ancient history and expand recent centuries

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

  // IMPROVEMENT: Adjust the ring widths proportionally to the number of events in each category
  // Count events in each category
  const categoryCounts = {
    "Engineering Experiments & Demonstrations": data.filter(d => d.category === "Engineering Experiments & Demonstrations").length,
    "Conceptual & Scientific Breakthroughs": data.filter(d => d.category === "Conceptual & Scientific Breakthroughs").length,
    "Sociocultural Factors": data.filter(d => d.category === "Sociocultural Factors").length
  };
  
  // Total count for calculating proportions
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate proportional widths
  const eedProportion = categoryCounts["Engineering Experiments & Demonstrations"] / totalCount;
  const csbProportion = categoryCounts["Conceptual & Scientific Breakthroughs"] / totalCount;
  const sfProportion = categoryCounts["Sociocultural Factors"] / totalCount;
  
  // Adjust ring ranges based on proportions (min radius of 0.15 for any category)
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * Math.max(0.15, eedProportion * 0.9)],
    "Conceptual & Scientific Breakthroughs": [
      maxOuterRadius * Math.max(0.15, eedProportion * 0.9), 
      maxOuterRadius * Math.max(0.15, eedProportion * 0.9 + csbProportion * 0.9)
    ],
    "Sociocultural Factors": [
      maxOuterRadius * Math.max(0.15, eedProportion * 0.9 + csbProportion * 0.9), 
      maxOuterRadius
    ],
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
  
  // IMPROVEMENT: Implement non-uniform time slices with logarithmic scaling
  // This compresses time periods with fewer events and expands recent centuries
  
  // Create century breaks
  const centuries = [];
  const centuryCounts = {}; // Store count of events per century
  
  // Count events per century
  data.forEach(d => {
    if (!centuryCounts[d.century]) {
      centuryCounts[d.century] = 0;
    }
    centuryCounts[d.century]++;
  });
  
  // Add all centuries in the range, including empty ones
  for (let year = adjustedMinYear; year <= adjustedMaxYear; year += 100) {
    centuries.push({
      year: year,
      count: centuryCounts[year] || 0,
      isEmpty: !centuryCounts[year]
    });
  }
  
  // Calculate logarithmic weight for each century based on event count
  // Empty centuries get minimum weight
  const minWeight = 0.5; // Minimum weight for empty centuries
  const maxWeight = 5;  // Maximum weight for most populated centuries
  
  // Find the maximum event count in any century
  const maxCount = Math.max(...Object.values(centuryCounts));
  
  // Assign weights to centuries
  centuries.forEach(c => {
    if (c.isEmpty) {
      c.weight = minWeight;
    } else {
      // Log scale for non-empty centuries: more events = more weight/angle
      c.weight = minWeight + (maxWeight - minWeight) * Math.log(1 + c.count) / Math.log(1 + maxCount);
    }
  });
  
  // Calculate total weight for angle normalization
  const totalWeight = centuries.reduce((sum, c) => sum + c.weight, 0);
  
  // Calculate the start and end angle for each century
  let currentAngle = 0;
  centuries.forEach(c => {
    // The angle range for this century is proportional to its weight
    const angleSpan = (c.weight / totalWeight) * (2 * Math.PI);
    c.startAngle = currentAngle;
    c.endAngle = currentAngle + angleSpan;
    c.midAngle = currentAngle + (angleSpan / 2);
    currentAngle += angleSpan;
  });

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
      innerRadius: ringRanges["Sociocultural Factors"][0],
      color: "#c62828"
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      outerRadius: ringRanges["Conceptual & Scientific Breakthroughs"][1],
      innerRadius: ringRanges["Conceptual & Scientific Breakthroughs"][0],
      color: "#1565c0"
    },
    {
      name: "Engineering Experiments & Demonstrations",
      outerRadius: ringRanges["Engineering Experiments & Demonstrations"][1],
      innerRadius: ringRanges["Engineering Experiments & Demonstrations"][0],
      color: "#2e7d32"
    },
  ];

  // Create ring groups
  const ringGroups = container.selectAll("g.ring-group")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "ring-group");

  // Create the arc generator for time slices with variable angles
  const arcGenerator = d3.arc()
    .startAngle(d => d.startAngle)
    .endAngle(d => d.endAngle)
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
    const timeSliceData = centuries.map(century => {
      return {
        century: century.year,
        startAngle: century.startAngle,
        endAngle: century.endAngle,
        ringData: categoryData,
        isEmpty: century.isEmpty,
        // Count items in this category and century
        count: data.filter(d => d.category === categoryData.name && d.century === century.year).length
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
      .attr("y", center - (categoryData.innerRadius + categoryData.outerRadius) / 2 + 15)
      .attr("text-anchor", "middle")
      .text(categoryData.name)
      .style("fill", categoryData.color)
      .style("opacity", 0.3)
      .style("font-size", "24px");
    
    // Add some century labels (every few centuries)
    // IMPROVEMENT: Add more century labels in densely populated areas
    // Show at least one label per populated century
    timeSliceData.forEach((d, i) => {
      // Show labels for populated centuries and for key milestones
      const shouldShowLabel = d.count > 0 || // Show for populated centuries
                             d.century % 500 === 0 || // Show for major milestones (every 500 years)
                             d.century === 0; // Show for year 0
      
      if (shouldShowLabel) {
        // Calculate position on the middle of the arc
        const angle = (d.startAngle + d.endAngle) / 2;
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
          .style("font-size", d.count > 0 ? "16px" : "14px") // Make populated centuries more prominent
          .style("font-weight", d.count > 0 ? "bold" : "normal")
          .style("opacity", d.count > 0 ? 0.8 : 0.6);
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

  // IMPROVEMENT: Position nodes on their century arc using variable angles
  data.forEach(d => {
    // Find the century object with the matching year
    const centuryObj = centuries.find(c => c.year === d.century);
    
    if (!centuryObj) {
      console.error(`Century not found for ${d.title} (${d.century})`);
      return;
    }
    
    // Use the middle angle of the century arc
    const angle = centuryObj.midAngle;
    
    // Find the min/max radius for this category
    const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
    
    // IMPROVEMENT: Vary the radius within the category band to reduce node overlap
    // More populated centuries spread nodes across the entire band width
    const centuryEventCount = data.filter(item => item.century === d.century).length;
    const categoryEventCount = data.filter(item => item.century === d.century && item.category === d.category).length;
    
    // If we have multiple nodes in the same category and century, spread them out radially
    let radiusOffset = 0;
    if (categoryEventCount > 1) {
      // Find this node's index within its category and century
      const categoryItems = data.filter(item => item.century === d.century && item.category === d.category);
      const itemIndex = categoryItems.findIndex(item => item.title === d.title);
      
      // Spread events evenly within the band
      radiusOffset = (itemIndex / (categoryEventCount - 1 || 1)) * (rMax - rMin);
    } else {
      // If only one event in this category/century, place it in the middle
      radiusOffset = (rMax - rMin) / 2;
    }
    
    const radius = rMin + radiusOffset;
    
    // Position at the calculated point
    d.x = center + Math.cos(angle) * radius;
    d.y = center + Math.sin(angle) * radius;
    
    // Flag to determine if the node is being dragged
    d.isDragging = false;
  });

  // IMPROVEMENT: Stronger force simulation to better distribute nodes in crowded areas
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.2) // Slightly higher to stabilize faster
    .force("charge", d3.forceManyBody().strength(-30)) // Increased repulsion
    .force("collide", d3.forceCollide(65).strength(0.8)) // Stronger collision avoidance
    .force("center", d3.forceCenter(center, center).strength(0.05)) // Weak centering force
    .force("radial", d3.forceRadial(d => {
      // Get the middle radius for this category
      const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
      return (rMin + rMax) / 2;
    }, center, center).strength(0.3)) // Keep nodes in their category rings
    .on("tick", ticked);

  // Draw links with variable opacity based on time difference
  const linkSelection = container.selectAll("line.link")
    .data(linksData)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", d => {
      const source = data[d.source];
      const target = data[d.target];
      // Use gradient color between the two categories
      return d3.interpolate(
        colorScale(source.category),
        colorScale(target.category)
      )(0.5);
    })
    .style("stroke-width", 1)
    .style("opacity", d => {
      const source = data[d.source];
      const target = data[d.target];
      const timeDiff = Math.abs(source.parsedYear - target.parsedYear);
      // Stronger connections for events close in time
      return Math.max(0.1, 0.7 - (timeDiff / 1000) * 0.3);
    });

  // Create drag behavior
  const drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  // IMPROVEMENT: Draw node groups with size proportional to connections
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

  // Calculate node size based on connections
  data.forEach(d => {
    // Count both incoming and outgoing connections
    let connectionCount = 0;
    if (d.connections) connectionCount += d.connections.length;
    
    // Count incoming connections from other nodes
    data.forEach(other => {
      if (other.connections && other.connections.includes(d.title)) {
        connectionCount++;
      }
    });
    
    // Base radius with scaling for connections
    d.radius = 40 + Math.min(20, connectionCount * 3);
  });

  nodeGroup.append("circle")
    .attr("r", d => d.radius)
    .attr("fill", d => {
      // Check if it's a special cross-category node
      if (d.group && d.group.includes("-")) {
        // Create gradient for multi-category node
        const gradientId = `grad-${d.title.replace(/[^\w]/g, "-")}`;
        
        // Create a gradient
        const gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", gradientId)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "100%");
        
        // Extract categories from group
        const categories = d.group.split("-").map(g => {
          switch (g) {
            case "CSB": return "Conceptual & Scientific Breakthroughs";
            case "EED": return "Engineering Experiments & Demonstrations";
            case "SF": return "Sociocultural Factors";
            default: return d.category;
          }
        });
        
        // Add gradient stops
        categories.forEach((cat, i) => {
          gradient.append("stop")
            .attr("offset", `${i * 100 / (categories.length - 1)}%`)
            .attr("stop-color", colorScale(cat));
        });
        
        return `url(#${gradientId})`;
      }
      
      return colorScale(d.category);
    })
    .style("stroke", "#333")
    .style("stroke-width", 1)
    .style("cursor", "move"); // Change cursor to indicate draggable

  // IMPROVEMENT: Enhance node text for better readability
  nodeGroup.append("foreignObject")
    .attr("x", d => -d.radius * 0.8)
    .attr("y", d => -d.radius * 0.8)
    .attr("width", d => d.radius * 1.6)
    .attr("height", d => d.radius * 1.6)
    .append("xhtml:div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("text-align", "center")
    .style("font-size", d => Math.max(8, Math.min(14, d.radius * 0.25)) + "px") // Scale font with node size
    .style("width", d => d.radius * 1.6 + "px")
    .style("height", d => d.radius * 1.6 + "px")
    .style("overflow", "hidden")
    .style("pointer-events", "none") // Make text non-interactable so it doesn't interfere with dragging
    .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.8)") // Add text shadow for better visibility
    .style("color", "white")
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

  // -------------------------
  // 6) ZOOM AND CONTROLS
  // -------------------------

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

  // IMPROVEMENT: Add legend and time period labels for better context
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(50, 50)`);
  
  // Add category legend
  categories.forEach((cat, i) => {
    if (cat.name === "Human's Dream of Flying") return; // Skip outer ring
    
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * 30})`);
    
    legendItem.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", cat.color);
    
    legendItem.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .text(cat.name)
      .style("fill", "white")
      .style("font-size", "14px");
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
