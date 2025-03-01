// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing visualization");
  
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  const data = window.timelineItems;
  console.log("Data loaded, items:", data.length);

  // We'll use a 2000x2000 viewBox
  const viewBoxSize = 2000;
  const center = viewBoxSize / 2; // 1000
  const maxOuterRadius = center * 0.9; // 800
  
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
  // 2) PARSE DATES AND PREPARE DATA
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

  // Normalize centuries to exactly 9 for Engineering
  function normalizeEngCentury(year) {
    // Special case: BCE dates go into their own buckets
    if (year < 0) {
      if (year <= -500 && year > -600) return -500; // 500s BCE
      if (year <= -400 && year > -500) return -400; // 400s BCE
      return year; // Other BCE dates
    }
    
    // 100-700 CE gets grouped as "early CE"
    if (year >= 0 && year < 800) return 100;
    
    // 800-999 CE
    if (year >= 800 && year < 1000) return 800;
    
    // 1000-1299 CE
    if (year >= 1000 && year < 1200) return 1000;
    
    // 1200-1499 CE
    if (year >= 1200 && year < 1400) return 1200;

    // 1500-1599 CE
    if (year >= 1500 && year < 1600) return 1500;

    // 1600-1699 CE
    if (year >= 1600 && year < 1700) return 1600;
    
    // 1700-1799 CE
    if (year >= 1700 && year < 1800) return 1700;
    
    // 1800-1899 CE (gets its own century)
    if (year >= 1800 && year < 1900) return 1800;
    
    // 1900+ CE (gets its own century)
    if (year >= 1900) return 1900;
    
    // Fallback
    return Math.floor(year / 100) * 100;
  }
  
  // Normalize centuries for other categories (can be different)
  function normalizeOtherCentury(year) {
    // For other categories, use regular century rounding
    return Math.floor(year / 100) * 100;
  }

  // Parse all dates and assign to centuries
  data.forEach(d => {
    d.parsedYear = parseTimelineDate(d.date);
    
    // Apply different century normalization based on category
    if (d.category === "Engineering Experiments & Demonstrations") {
      d.century = normalizeEngCentury(d.parsedYear);
    } else {
      d.century = normalizeOtherCentury(d.parsedYear);
    }
  });
  
  // Define fixed ring ranges - MODIFIED TO MAKE ENGINEERING SECTION LARGER
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * (1/2)], // Changed from 1/3 to 1/2
    "Theoretical Breakthroughs": [maxOuterRadius * (1/2), maxOuterRadius * (3/4)], // Changed from 1/3-2/3 to 1/2-3/4
    "Sociocultural & Economic Factors": [maxOuterRadius * (3/4), maxOuterRadius], // Changed from 2/3-1 to 3/4-1
    "Humanity's Dream of Flying": [maxOuterRadius, maxOuterRadius * 1.1] // Not used for node placement
  };
  
  // Colors for each category
  const colorScale = d3.scaleOrdinal()
    .domain(["Humanity's Dream of Flying", "Sociocultural & Economic Factors", "Theoretical Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#9c27b0", "#c62828", "#1565c0", "#2e7d32"]);

  // Calculate slice angles for Engineering category
  // Get all Engineering events
  const engEvents = data.filter(d => d.category === "Engineering Experiments & Demonstrations");
  console.log("Engineering events:", engEvents.length);
  
  // Get unique normalized centuries for Engineering
  const engCenturies = [...new Set(engEvents.map(d => d.century))].sort((a, b) => a - b);
  console.log("Engineering centuries:", engCenturies);
  
  // Count events per century for Engineering
  const engCenturyCounts = {};
  engCenturies.forEach(century => {
    engCenturyCounts[century] = engEvents.filter(d => d.century === century).length;
  });
  console.log("Engineering counts:", engCenturyCounts);
  
  // Calculate angle spans for Engineering centuries
  const engAngleData = {};
  const totalEngEvents = engEvents.length;
  const totalAngle = 2 * Math.PI; // Full circle
  
  // MODIFIED: Make slice size proportional to event count with a minimum size
  // Calculate weighted angles - directly proportional to the number of events
  let startAngle = 0;
  // Calculate total weight = sum of all events + minimum slice per century
  const minSliceWeight = 1; // Minimum weight for a century with few events
  const totalWeight = Object.values(engCenturyCounts).reduce((sum, count) => sum + Math.max(count, minSliceWeight), 0);
  
  engCenturies.forEach(century => {
    const count = engCenturyCounts[century];
    // Use count as weight, but ensure minimum size for visibility
    const weight = Math.max(count, minSliceWeight);
    const angleSize = (weight / totalWeight) * totalAngle;
    
    engAngleData[century] = {
      startAngle: startAngle,
      endAngle: startAngle + angleSize,
      count: count
    };
    
    startAngle += angleSize;
  });
  
  // Normalize to full circle (in case of rounding errors)
  const correction = totalAngle / startAngle;
  engCenturies.forEach(century => {
    engAngleData[century].startAngle *= correction;
    engAngleData[century].endAngle *= correction;
  });
  
  // Also calculate similar data for other categories
  const categoryAngles = {
    "Engineering Experiments & Demonstrations": engAngleData
  };
  
  ["Theoretical Breakthroughs", "Sociocultural & Economic Factors"].forEach(category => {
    const catEvents = data.filter(d => d.category === category);
    console.log(`${category} events:`, catEvents.length);
    
    const centuries = [...new Set(catEvents.map(d => d.century))].sort((a, b) => a - b);
    const centuryCounts = {};
    
    centuries.forEach(century => {
      centuryCounts[century] = catEvents.filter(d => d.century === century).length;
    });
    
    const angleData = {};
    let startAngle = 0;
    
    // MODIFIED: Similar proportional approach for other categories
    // Calculate total weight for this category with minimum slice size
    const catTotalWeight = Object.values(centuryCounts).reduce((sum, count) => sum + Math.max(count, minSliceWeight), 0);
    
    // Calculate angles - proportional to event count with minimum
    centuries.forEach(century => {
      const count = centuryCounts[century];
      const weight = Math.max(count, minSliceWeight);
      const angleSize = (weight / catTotalWeight) * totalAngle;
      
      angleData[century] = {
        startAngle: startAngle,
        endAngle: startAngle + angleSize,
        count: count
      };
      
      startAngle += angleSize;
    });
    
    // Normalize to full circle
    if (startAngle > 0) {
      const catCorrection = totalAngle / startAngle;
      centuries.forEach(century => {
        angleData[century].startAngle *= catCorrection;
        angleData[century].endAngle *= catCorrection;
      });
    }
    
    categoryAngles[category] = angleData;
  });


  // -------------------------
  // 3) DRAW CATEGORY RINGS WITH TIME SLICES
  // -------------------------
  
  // Define ring categories for visualization - MODIFIED TO MATCH NEW ringRanges
  const ringCategories = [
    {
      name: "Humanity's Dream of Flying",
      outerRadius: maxOuterRadius * 1.1, // Make it larger than the other rings
      innerRadius: maxOuterRadius,
      color: "#9c27b0"
    },
    {
      name: "Sociocultural & Economic Factors",
      outerRadius: maxOuterRadius,
      innerRadius: maxOuterRadius * (3/4), // Changed from 2/3 to 3/4
      color: "#c62828"
    },
    {
      name: "Theoretical Breakthroughs",
      outerRadius: maxOuterRadius * (3/4), // Changed from 2/3 to 3/4
      innerRadius: maxOuterRadius * (1/2), // Changed from 1/3 to 1/2
      color: "#1565c0"
    },
    {
      name: "Engineering Experiments & Demonstrations",
      outerRadius: maxOuterRadius * (1/2), // Changed from 1/3 to 1/2
      innerRadius: 0,
      color: "#2e7d32"
    },
  ];

  // Create ring groups
  const ringGroups = container.selectAll("g.ring-group")
    .data(ringCategories)
    .enter()
    .append("g")
    .attr("class", "ring-group");

  // Create the arc generator for time slices
  const arcGenerator = d3.arc()
    .startAngle(d => d.startAngle)
    .endAngle(d => d.endAngle)
    .innerRadius(d => d.ringData.innerRadius)
    .outerRadius(d => d.ringData.outerRadius)
    .padAngle(0.01);

  // For each category, create century slices
  ringGroups.each(function(categoryData) {
    const group = d3.select(this);
    
    // Skip time slices for the outer "Humanity's Dream of Flying" ring
    if (categoryData.name === "Humanity's Dream of Flying") {
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
    
    // Get angle data for this category
    const angles = categoryAngles[categoryData.name];
    if (!angles) {
      console.error("No angle data for category:", categoryData.name);
      return;
    }
    
    // Create slice data
    const slices = [];
    for (const century in angles) {
      if (angles.hasOwnProperty(century)) {
        slices.push({
          century: parseInt(century),
          startAngle: angles[century].startAngle,
          endAngle: angles[century].endAngle,
          count: angles[century].count,
          ringData: categoryData
        });
      }
    }

    // Draw arcs for each time slice
    group.selectAll("path.time-slice")
      .data(slices)
      .enter()
      .append("path")
      .attr("class", "time-slice")
      .attr("d", arcGenerator)
      .attr("transform", `translate(${center}, ${center})`)
      .style("fill", categoryData.color)
      .style("stroke", "#fff")
      .style("stroke-width", 1.5)
      .style("opacity", d => Math.min(0.95, 0.7 + (d.count * 0.01)))
      .append("title") // Add tooltip
      .text(d => {
        if (d.century < 0) {
          return `${Math.abs(d.century)}s BCE: ${d.count} events`;
        } else if (d.century === 100 && categoryData.name === "Engineering Experiments & Demonstrations") {
          return `100-799 CE: ${d.count} events`;
        } else if (d.century === 800 && categoryData.name === "Engineering Experiments & Demonstrations") {
          return `800-1199 CE: ${d.count} events`;
        } else if (d.century === 1200 && categoryData.name === "Engineering Experiments & Demonstrations") {
          return `1200-1499 CE: ${d.count} events`;
        } else if (d.century === 1500 && categoryData.name === "Engineering Experiments & Demonstrations") {
          return `1500-1699 CE: ${d.count} events`;
        } else if (d.century === 1700 && categoryData.name === "Engineering Experiments & Demonstrations") {
          return `1700-1799 CE: ${d.count} events`;
       } else if (d.century === 1800 && categoryData.name === "Engineering Experiments & Demonstrations") {
          return `1800-1899 CE: ${d.count} events`;
        } else {
          return `${d.century}s: ${d.count} events`;
        }
      });

    // Add the category label
    group.append("text")
      .attr("x", center)
      .attr("y", center - (categoryData.innerRadius + categoryData.outerRadius) / 2 + 15)
      .attr("text-anchor", "middle")
      .text(categoryData.name)
      .style("fill", "#fff")
      .style("opacity", 0.8)
      .style("font-size", "22px")
      .style("font-weight", "bold");
    
    // Add century labels
    slices.forEach(d => {
      // Skip very small slices
      if (d.endAngle - d.startAngle < 0.1) return;
      
      // Calculate position in the middle of the arc
      const angle = (d.startAngle + d.endAngle) / 2;
      const radius = (categoryData.innerRadius + categoryData.outerRadius) / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      
      // Format label text
      let labelText;
      if (d.century < 0) {
        labelText = `${Math.abs(d.century)}s BCE`;
      } else if (d.century === 100 && categoryData.name === "Engineering Experiments & Demonstrations") {
        labelText = "100-799 CE";
      } else if (d.century === 800 && categoryData.name === "Engineering Experiments & Demonstrations") {
        labelText = "800-1199 CE";
      } else if (d.century === 1200 && categoryData.name === "Engineering Experiments & Demonstrations") {
        labelText = "1200-1499 CE";
      } else if (d.century === 1500 && categoryData.name === "Engineering Experiments & Demonstrations") {
        labelText = "1500-1699 CE";
      } else if (d.century === 1700 && categoryData.name === "Engineering Experiments & Demonstrations") {
        labelText = "1700-1799 CE";
      } else if (d.century === 1800 && categoryData.name === "Engineering Experiments & Demonstrations") {
        labelText = "1800-1899 CE";
      } else {
        labelText = `${d.century}s`;
      }
      
      // Add text
      group.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", `rotate(${angle * 180 / Math.PI + 90}, ${x}, ${y})`) // Rotate text to follow arc
        .text(labelText)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("opacity", 0.9);
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
    // Get the angle data for this node's category and century
    const categoryAngleData = categoryAngles[d.category];
    if (!categoryAngleData || !categoryAngleData[d.century]) {
      console.error("No angle data for", d.category, d.century);
      // Default fallback
      d.x = center;
      d.y = center;
      return;
    }
    
    const angleData = categoryAngleData[d.century];
    
    // Get all events in this century and category
    const eventsInSameCenturyAndCategory = data.filter(
      item => item.century === d.century && item.category === d.category
    );
    
    // Find index of this node within its century+category group
    const nodeGroupIndex = eventsInSameCenturyAndCategory.indexOf(d);
    const totalNodesInGroup = eventsInSameCenturyAndCategory.length;
    
    // Calculate angle within the century arc
    let angle;
    if (totalNodesInGroup > 1) {
      // Calculate spread within the century
      const angleRange = angleData.endAngle - angleData.startAngle;
      const spreadFactor = 0.8; // Use 80% of the slice for spreading nodes
      const offset = (nodeGroupIndex + 0.5) / totalNodesInGroup;
      angle = angleData.startAngle + (angleRange * spreadFactor * offset) + (angleRange * (1 - spreadFactor) / 2);
    } else {
      // Center in the slice if only one node
      angle = (angleData.startAngle + angleData.endAngle) / 2;
    }
    
    // Find the min/max radius for this category
    const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
    
    // IMPROVED POSITIONING: Distribute nodes across the ring radius
    // Use a deterministic pattern based on node index to avoid clumping at the edges
    let radius;
    if (totalNodesInGroup <= 1) {
      // If only one node, place in middle of ring
      radius = (rMin + rMax) / 2;
    } else {
      // For multiple nodes, distribute them using golden ratio to create
      // a better distribution throughout the available radius
      const ringWidth = rMax - rMin;
      
      // More advanced distribution for larger groups
      if (totalNodesInGroup > 5) {
        // Create a spiral-like pattern that fills the ring area
        // Normalize index to 0-1 range
        const normalizedIndex = nodeGroupIndex / (totalNodesInGroup - 1);
        
        // Calculate radius using a golden ratio spiral pattern
        // This creates a more even distribution in the ring
        const golden_ratio = 1.618033988749895;
        const theta = normalizedIndex * 2 * Math.PI * golden_ratio;
        
        // Radius variation that ensures nodes stay within their slice
        const radiusOffset = Math.cos(theta * 2) * ringWidth * 0.3;
        radius = rMin + (ringWidth * 0.3) + (ringWidth * 0.4) * normalizedIndex + radiusOffset;
      } else {
        // For smaller groups, use simpler distribution
        radius = rMin + (ringWidth * (nodeGroupIndex + 1)) / (totalNodesInGroup + 1);
      }
    }
    
    // Ensure radius stays within bounds
    radius = Math.max(rMin + 20, Math.min(rMax - 20, radius));
    
    // Position at the calculated angle and radius
    d.x = center + Math.cos(angle) * radius;
    d.y = center + Math.sin(angle) * radius;
    
    // Save original position and parameters for constraints
    d.origAngle = angle;
    d.origRadius = radius;
    d.categoryMinRadius = rMin;
    d.categoryMaxRadius = rMax;
    d.startAngle = angleData.startAngle;
    d.endAngle = angleData.endAngle;
    
    // Flag to determine if the node is being dragged
    d.isDragging = false;
  });

  // Force simulation with appropriate constraints
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.4) // Increased to stabilize nodes faster
    .force("charge", d3.forceManyBody().strength(-30))
    .force("collide", d3.forceCollide(60).strength(0.8)) // Increased to prevent overlap
    .force("radial", d3.forceRadial(d => d.origRadius, center, center).strength(0.3)) // Added to keep nodes at their assigned radius
    .force("angle", d3.forceX(d => {
      // Force to maintain the correct angle
      const angle = (d.startAngle + d.endAngle) / 2;
      return center + Math.cos(angle) * d.origRadius * 0.8;
    }).strength(0.1))
    .force("angle-y", d3.forceY(d => {
      // Force to maintain the correct angle (y-component)
      const angle = (d.startAngle + d.endAngle) / 2;
      return center + Math.sin(angle) * d.origRadius * 0.8;
    }).strength(0.1))
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
    .on("click", function(event, d) {
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
            case "CSB": return "Theoretical Breakthroughs";
            case "EED": return "Engineering Experiments & Demonstrations";
            case "SF": return "Sociocultural & Economic Factors";
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

  // MODIFIED: Display only the title, not the date
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
    .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.7)")
    .style("color", "white")
    .html(d => `<strong>${d.title}</strong>`); // Remove the date line

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
    // Radial constraint (keep in ring)
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
      d.x = center + rMin + 10;
      d.y = center;
    }
    
    // Angular constraint (keep in century)
    if (d.startAngle !== undefined && d.endAngle !== undefined) {
      const currentAngle = Math.atan2(d.y - center, d.x - center);
      let normAngle = currentAngle;
      while (normAngle < 0) normAngle += 2 * Math.PI;
      while (normAngle >= 2 * Math.PI) normAngle -= 2 * Math.PI;
      
      let startAngle = d.startAngle;
      let endAngle = d.endAngle;
      
      // Normalize angles
      while (startAngle < 0) startAngle += 2 * Math.PI;
      while (startAngle >= 2 * Math.PI) startAngle -= 2 * Math.PI;
      while (endAngle < 0) endAngle += 2 * Math.PI;
      while (endAngle >= 2 * Math.PI) endAngle -= 2 * Math.PI;
      
      // Check if angle is outside the sector
      let isOutside = false;
      if (startAngle < endAngle) {
        isOutside = normAngle < startAngle || normAngle > endAngle;
      } else {
        isOutside = normAngle < startAngle && normAngle > endAngle;
      }
      
      if (isOutside && !d.isDragging) {
        // If outside, move back to original position gradually
        const moveToAngle = (startAngle + endAngle) / 2;
        d.x = center + Math.cos(moveToAngle) * dist;
        d.y = center + Math.sin(moveToAngle) * dist;
      }
    }
  }
  
  // Update link positions based on node positions
// Update link positions based on node positions
function updateLinks() {
  linkSelection
    .attr("x1", d => data[d.source].x)
    .attr("y1", d => data[d.source].y)
    .attr("x2", d => data[d.target].x)
    .attr("y2", d => data[d.target].y);
} // 
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

// Initial centering
svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.9));
console.log("Visualization setup complete");
});
