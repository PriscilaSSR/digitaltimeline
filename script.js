// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing visualization");
  
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  // Get the data directly from the source
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
    
  // Add a scrolling timeline container to the page
  const timelineContainer = d3.select("body")
    .append("div")
    .attr("id", "timeline-container")
    .style("display", "none") // Initially hidden
    .style("position", "fixed")
    .style("top", "50px")
    .style("right", "20px")
    .style("width", "300px")
    .style("max-height", "80vh")
    .style("overflow-y", "auto")
    .style("background-color", "rgba(40, 40, 40, 0.9)")
    .style("border-radius", "8px")
    .style("padding", "15px")
    .style("box-shadow", "0 4px 8px rgba(0,0,0,0.5)")
    .style("z-index", "100")
    .style("color", "white");
    
  // Add a header to the timeline
  timelineContainer.append("div")
    .attr("class", "timeline-header")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("align-items", "center")
    .style("margin-bottom", "10px")
    .html(`<h3 style="margin: 0;">Related Engineering Events</h3>
           <button id="close-timeline" style="background: none; border: none; font-size: 20px; color: white; cursor: pointer;">&times;</button>`);
    
  // Add a content div for the timeline items
  timelineContainer.append("div")
    .attr("id", "timeline-content");
    
  // Add event listener to close button
  d3.select("#close-timeline").on("click", function() {
    d3.select("#timeline-container").style("display", "none");
  });
    
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

  // Function to normalize centuries to exactly 9 for desired Aviation Technology timeline grouping
  function normalizeAviationCentury(year) {
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
    
    // 1900-1945 CE
    if (year >= 1900 && year < 1946) return 1900;
    
    // NEW: Post-1945 division
    if (year >= 1946) return 1946;
    
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
    if (d.category === "Aviation Technology") {
      d.century = normalizeAviationCentury(d.parsedYear);
    } else {
      d.century = normalizeOtherCentury(d.parsedYear);
    }
  });
  
  // Define fixed ring ranges - MODIFIED TO REMOVE ENGINEERING CIRCLE
  const ringRanges = {
    "Aviation Technology": [0, maxOuterRadius * (1/2)], // Innermost circle
    "Theoretical Breakthroughs": [maxOuterRadius * (1/2), maxOuterRadius * (3/4)], // Back to original position
    "Sociocultural & Economic Factors": [maxOuterRadius * (3/4), maxOuterRadius], // Unchanged
    "Humanity's Dream of Flying": [maxOuterRadius, maxOuterRadius * 1.1] // Unchanged
    // Engineering events removed from visual - will only appear in timeline
  };
  
  // Colors for each category
const colorScale = d3.scaleOrdinal()
  .domain(["Humanity's Dream of Flying", "Sociocultural & Economic Factors", "Theoretical Breakthroughs", "Aviation Technology", "Zeppelins"])
  .range(["#9c27b0", "#c62828", "#1565c0", "#2e7d32", "#ff9800"]); // Added orange color for Zeppelins

  // Calculate slice angles for Aviation Technology category (formerly Engineering)
  // Get all Aviation Technology events
  const aviationEvents = data.filter(d => d.category === "Aviation Technology");
  console.log("Aviation Technology events:", aviationEvents.length);
  
  // Get unique normalized centuries for Aviation Technology
  const aviationCenturies = [...new Set(aviationEvents.map(d => d.century))].sort((a, b) => a - b);
  console.log("Aviation Technology centuries:", aviationCenturies);
  
  // Count events per century for Aviation Technology
  const aviationCenturyCounts = {};
  aviationCenturies.forEach(century => {
    aviationCenturyCounts[century] = aviationEvents.filter(d => d.century === century).length;
  });
  console.log("Aviation Technology counts:", aviationCenturyCounts);
  
  // Calculate angle spans for Aviation Technology centuries
  const aviationAngleData = {};
  const totalAviationEvents = aviationEvents.length;
  const totalAngle = 2 * Math.PI; // Full circle
  
  // MODIFIED: Make slice size proportional to event count with a minimum size
  // Calculate weighted angles - directly proportional to the number of events
  let startAngle = 0;
  // Calculate total weight = sum of all events + minimum slice per century
  const minSliceWeight = 1; // Minimum weight for a century with few events
  const totalWeight = Object.values(aviationCenturyCounts).reduce((sum, count) => sum + Math.max(count, minSliceWeight), 0);
  
  aviationCenturies.forEach(century => {
    const count = aviationCenturyCounts[century];
    // Use count as weight, but ensure minimum size for visibility
    const weight = Math.max(count, minSliceWeight);
    const angleSize = (weight / totalWeight) * totalAngle;
    
    aviationAngleData[century] = {
      startAngle: startAngle,
      endAngle: startAngle + angleSize,
      count: count
    };
    
    startAngle += angleSize;
  });
  
  // Normalize to full circle (in case of rounding errors)
  const correction = totalAngle / startAngle;
  aviationCenturies.forEach(century => {
    aviationAngleData[century].startAngle *= correction;
    aviationAngleData[century].endAngle *= correction;
  });
  
  // Also calculate similar data for other categories
  const categoryAngles = {
    "Aviation Technology": aviationAngleData
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
  
  // Define ring categories for visualization - MODIFIED TO REMOVE ENGINEERING
  const ringCategories = [
    {
      name: "Humanity's Dream of Flying",
      outerRadius: maxOuterRadius * 1.1, // Unchanged
      innerRadius: maxOuterRadius,
      color: "#9c27b0"
    },
    {
      name: "Sociocultural & Economic Factors",
      outerRadius: maxOuterRadius,
      innerRadius: maxOuterRadius * (3/4), // Unchanged
      color: "#c62828"
    },
    {
      name: "Theoretical Breakthroughs",
      outerRadius: maxOuterRadius * (3/4), // Unchanged
      innerRadius: maxOuterRadius * (1/2), // Back to original
      color: "#1565c0"
    },
    {
      name: "Aviation Technology",
      outerRadius: maxOuterRadius * (1/2), // Was Engineering
      innerRadius: 0,
      color: "#2e7d32" // Keep the green color
    },
    // Engineering removed - will only appear in timeline
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
        } else if (d.century === 1946 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `Post-1945: ${d.count} events`;
        } else if (d.century === 100 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `100-799 CE: ${d.count} events`;
        } else if (d.century === 800 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `800-1199 CE: ${d.count} events`;
        } else if (d.century === 1200 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `1200-1499 CE: ${d.count} events`;
        } else if (d.century === 1500 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `1500-1699 CE: ${d.count} events`;
        } else if (d.century === 1700 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `1700-1799 CE: ${d.count} events`;
        } else if (d.century === 1800 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `1800-1899 CE: ${d.count} events`;
        } else if (d.century === 1900 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
          return `1900-1945: ${d.count} events`;
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
      } else if (d.century === 1946 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "Post-1945";
      } else if (d.century === 100 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "100-799 CE";
      } else if (d.century === 800 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "800-1199 CE";
      } else if (d.century === 1200 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "1200-1499 CE";
      } else if (d.century === 1500 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "1500-1699 CE";
      } else if (d.century === 1700 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "1700-1799 CE";
      } else if (d.century === 1800 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "1800-1899 CE";
      } else if (d.century === 1900 && (categoryData.name === "Aviation Technology" || categoryData.name === "Engineering Experiments & Demonstrations")) {
        labelText = "1900-1945";
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
    // Skip Engineering nodes - they'll only appear in the timeline
if (d.category === "Engineering Experiments & Demonstrations") {
      // Position them off-screen so they're not visible
      d.x = -9999;
      d.y = -9999;
      d.hidden = true;
      return;
    }
    if (d.category === "Zeppelins") {
      // Position them off-screen so they're not visible
      d.x = -9999;
      d.y = -9999;
      d.hidden = true;
      return;
    }
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

  // Draw node groups with drag capability - filter out Engineering nodes
  const circleRadius = 50;
  const nodeGroup = container.selectAll("g.node-group")
    .data(data.filter(d => d.category !== "Engineering Experiments & Demonstrations" && d.category !== "Zeppelins")) // Filter out Engineering nodes
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("data-category", d => d.category) // Add data attribute for styling
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .on("click", function(event, d) {
      // If it's an Aviation Technology node, show the timeline
      if (d.category === "Aviation Technology" && !d.wasDragged) {
        showEngineeringTimeline(d);
      } 
      // For any node, show the modal if we're not dragging
      else if (!d.wasDragged) {
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
  case "AT": return "Aviation Technology";
  case "Zeppelins": return "Zeppelins";
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
    .style("stroke-width", d => d.category === "Aviation Technology" ? 2 : 1) // Thicker border for Aviation Tech
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
    .html(d => {
      // Add a small icon to Aviation Technology nodes to indicate they can open the timeline
      if (d.category === "Aviation Technology") {
        return `<strong>${d.title}</strong><span style="display:block;font-size:8px;margin-top:3px;">🔎 Click for details</span>`;
      }
      return `<strong>${d.title}</strong>`;
    });
    
  // -------------------------
  // 5) ENGINEERING TIMELINE FUNCTIONS
  // -------------------------
  
  // Function to show the engineering timeline for a specific Aviation Technology node
  function showEngineeringTimeline(aviationNode) {
    // Get the century of the clicked Aviation node
    const century = aviationNode.century;
    const yearStart = aviationNode.parsedYear;
    
    // Get all Engineering events from the same century
    const engineeringEvents = data.filter(d => 
      d.category === "Engineering Experiments & Demonstrations" && 
      d.century === century
    );
    
    // Find all Zeppelin events related to this Aviation Node
    const zeppelinEvents = [];
    
    // Check if this Aviation node has connections to Zeppelin events
    if (aviationNode.connections) {
      // Find Zeppelin events that match the connection titles
const connectedZeppelins = data.filter(d => 
  (d.category === "Zeppelins" || 
   (d.group && (d.group === "Zeppelins" || d.group.includes("Zeppelins")))) && 
  aviationNode.connections.includes(d.title)
);
      
      // Add to our zeppelin events array
      zeppelinEvents.push(...connectedZeppelins);
    }
    
    // Sort engineering events by year
    engineeringEvents.sort((a, b) => a.parsedYear - b.parsedYear);
    
    // Sort zeppelin events by year
    zeppelinEvents.sort((a, b) => a.parsedYear - b.parsedYear);
    
    // Format the century for display
    let centuryLabel;
    if (century < 0) {
      centuryLabel = `${Math.abs(century)}s BCE`;
    } else if (century === 1946) {
      centuryLabel = "Post-1945";
    } else if (century === 100) {
      centuryLabel = "100-799 CE";
    } else if (century === 800) {
      centuryLabel = "800-1199 CE";
    } else if (century === 1200) {
      centuryLabel = "1200-1499 CE";
    } else if (century === 1500) {
      centuryLabel = "1500-1699 CE";
    } else if (century === 1700) {
      centuryLabel = "1700-1799 CE";
    } else if (century === 1800) {
      centuryLabel = "1800-1899 CE";
    } else if (century === 1900) {
      centuryLabel = "1900-1945";
    } else {
      centuryLabel = `${century}s`;
    }
    
    // Update the timeline header
    const headerText = zeppelinEvents.length > 0 
      ? `Engineering & Zeppelin Events: ${centuryLabel}`
      : `Engineering Events: ${centuryLabel}`;
    d3.select(".timeline-header h3").html(headerText);
    
    // Clear existing timeline content
    const timelineContent = d3.select("#timeline-content").html("");
    
    // Add the selected Aviation Technology event at the top
    timelineContent.append("div")
      .attr("class", "timeline-item selected-item")
      .style("border-left", "4px solid #2e7d32")
      .style("padding", "10px 15px")
      .style("margin-bottom", "15px")
      .style("background-color", "rgba(46, 125, 50, 0.15)")
      .html(`
        <h4 style="margin: 0 0 5px 0;">${aviationNode.title}</h4>
        <p style="margin: 0 0 8px 0;font-size: 12px;opacity: 0.8;">${aviationNode.date}</p>
        <p style="margin: 0;font-size: 14px;">${aviationNode.description.substring(0, 150)}${aviationNode.description.length > 150 ? '...' : ''}</p>
      `)
      .on("click", function() {
        showModal(aviationNode);
      });
    
    // Add a divider
    timelineContent.append("div")
      .style("border-bottom", "1px solid rgba(255,255,255,0.2)")
      .style("margin", "10px 0 15px 0");
      
    const hasEvents = engineeringEvents.length > 0 || zeppelinEvents.length > 0;
    
    if (hasEvents) {
      // Check if we have engineering events
      if (engineeringEvents.length > 0) {
        timelineContent.append("h4")
          .style("margin", "0 0 10px 0")
          .text("Related Engineering Events:");
          
        // Add each engineering event
        engineeringEvents.forEach(event => {
          timelineContent.append("div")
            .attr("class", "timeline-item")
            .style("border-left", "4px solid #ff9800")
            .style("padding", "10px 15px")
            .style("margin-bottom", "10px")
            .style("cursor", "pointer")
            .html(`
              <h4 style="margin: 0 0 5px 0;">${event.title}</h4>
              <p style="margin: 0 0 8px 0;font-size: 12px;opacity: 0.8;">${event.date}</p>
              <p style="margin: 0;font-size: 14px;">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
            `)
            .on("click", function() {
              showModal(event);
            });
        });
      }
      
      // Check if we have Zeppelin events
      if (zeppelinEvents.length > 0) {
        // Add a divider if we already displayed engineering events
        if (engineeringEvents.length > 0) {
          timelineContent.append("div")
            .style("border-bottom", "1px solid rgba(255,255,255,0.2)")
            .style("margin", "15px 0");
        }
        
        timelineContent.append("h4")
          .style("margin", "15px 0 10px 0")
          .text("Related Zeppelin Events:");
          
        // Add each Zeppelin event
        zeppelinEvents.forEach(event => {
          timelineContent.append("div")
            .attr("class", "timeline-item")
            .style("border-left", "4px solid #9c27b0") // Different color for Zeppelin events
            .style("padding", "10px 15px")
            .style("margin-bottom", "10px")
            .style("cursor", "pointer")
            .html(`
              <h4 style="margin: 0 0 5px 0;">${event.title}</h4>
              <p style="margin: 0 0 8px 0;font-size: 12px;opacity: 0.8;">${event.date}</p>
              <p style="margin: 0;font-size: 14px;">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
            `)
            .on("click", function() {
              showModal(event);
            });
        });
      }
    } else {
      timelineContent.append("p")
        .style("font-style", "italic")
        .text("No related engineering or zeppelin events found for this time period.");
    }
    
    // Make the timeline visible
    d3.select("#timeline-container").style("display", "block");
  }
  // -------------------------
  // 6) DRAG FUNCTIONS
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
  // 7) ZOOM AND CONTROLS
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
    document.getElementById("modal-location").innerText = d.location || "Unknown";
    document.getElementById("modal-people").innerText = (d.people || []).join(", ") || "Unknown";
    
    // Set modal image with fallback
    const modalImage = document.getElementById("modal-image");
    modalImage.src = d.img || "/api/placeholder/400/300";
    modalImage.alt = d.title;
    
    // Add category information to the modal
    const categoryText = d.originalCategory ? `${d.category} (originally ${d.originalCategory})` : d.category;
    
    // Add category info if not already present in the modal
    let categoryElement = document.getElementById("modal-category");
    if (!categoryElement) {
      categoryElement = document.createElement("p");
      categoryElement.id = "modal-category";
      const categoryStrong = document.createElement("strong");
      categoryStrong.textContent = "Category: ";
      categoryElement.appendChild(categoryStrong);
      const categorySpan = document.createElement("span");
      categorySpan.id = "modal-category-span";
      categoryElement.appendChild(categorySpan);
      
      // Insert after location
      const locationElement = document.querySelector("#modal-location").parentElement;
      locationElement.parentElement.insertBefore(categoryElement, locationElement.nextSibling);
    }
    
    // Update category text
    document.getElementById("modal-category-span").innerText = categoryText;
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
