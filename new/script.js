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
  const maxOuterRadius = center * 0.9; // 900
  
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
    .html(`<h3 style="margin: 0;">Related Events</h3>
           <button id="close-timeline" style="background: none; border: none; font-size: 20px; color: white; cursor: pointer;">&times;</button>`);
    
  // Add a content div for the timeline items
  timelineContainer.append("div")
    .attr("id", "timeline-content");
    
  // Add event listener to close button
  d3.select("#close-timeline").on("click", function() {
    d3.select("#timeline-container").style("display", "none");
  });
    
  // -------------------------
  // 2) DEFINE CATEGORIES AND STRUCTURE
  // -------------------------
  
  // Define the main categories based on the new structure
  const mainCategories = {
    "1. Key Literary & Cultural Works": {
      color: "#9c27b0", // Purple
      radius: maxOuterRadius,
      timePeriods: {
        "1a. 500s BCE to 1399s CE": { startYear: -500, endYear: 1399 },
        "1b. 1400 CE to 1799s CE": { startYear: 1400, endYear: 1799 },
        "1c. 1800s CE to 1945 CE": { startYear: 1800, endYear: 1945 }
      }
    },
    "2. Socioeconomic Factors": {
      color: "#1565c0", // Blue
      radius: maxOuterRadius * 0.75,
      timePeriods: {
        "2a. 500s BCE to 1399s CE": { startYear: -500, endYear: 1399 },
        "2b. 1400 CE to 1699s CE": { startYear: 1400, endYear: 1699 },
        "2c. 1760s CE to 1890s CE": { startYear: 1760, endYear: 1890 },
        "2d. 1890s CE to 1980s CE": { startYear: 1890, endYear: 1980 }
      }
    },
    "3. Scientific Theories Breakthroughs": {
      color: "#00897b", // Teal
      radius: maxOuterRadius * 0.5,
      timePeriods: {
        "3a. 500s BCE to 1599s CE": { startYear: -500, endYear: 1599 },
        "3b. 1600s CE to 1760s CE": { startYear: 1600, endYear: 1760 },
        "3c. 1770s CE to 1899s CE": { startYear: 1770, endYear: 1899 },
        "3d. 1900s CE to 1945 CE": { startYear: 1900, endYear: 1945 }
      }
    },
    "4. Practical Implementations": {
      color: "#c62828", // Red
      radius: maxOuterRadius * 0.25,
      // Note: Category 4 uses thematic groups instead of time periods
      thematicGroups: {
        "4a. Non-Human Flight": {},
        "4b. Early Attempts at Human Flight": {},
        "4c. The Age of the Balloon": {},
        "4d. Early Glider Experiments": {},
        "4e. Race Toward Modern Aviation": {},
        "4f. Parallel Alternative: The Zeppelin": {},
        "4g. Post-War Advancements": {}
      }
    }
  };

  // Define the spaces between boundaries where nodes will be positioned
  const nodePlacementRanges = {
    "1. Key Literary & Cultural Works": [mainCategories["2. Socioeconomic Factors"].radius, mainCategories["1. Key Literary & Cultural Works"].radius],
    "2. Socioeconomic Factors": [mainCategories["3. Scientific Theories Breakthroughs"].radius, mainCategories["2. Socioeconomic Factors"].radius],
    "3. Scientific Theories Breakthroughs": [mainCategories["4. Practical Implementations"].radius, mainCategories["3. Scientific Theories Breakthroughs"].radius],
    "4. Practical Implementations": [0, mainCategories["4. Practical Implementations"].radius]
  };
  
  // Colors for each Excel category
  const colorScale = d3.scaleOrdinal()
    .domain(Object.keys(mainCategories))
    .range(Object.values(mainCategories).map(cat => cat.color));

  // -------------------------
  // 3) PARSE DATES AND PREPARE DATA
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

  // Determine the time period or thematic group for an event
  function assignCategoryAndGroup(item) {
    // First, map the original category to the new structure
    if (item.category === "Humanity's Dream of Flying") {
      item.excelCategory = "1. Key Literary & Cultural Works";
    } else if (item.category === "Sociocultural & Economic Factors") {
      item.excelCategory = "2. Socioeconomic Factors";
    } else if (item.category === "Theoretical Breakthroughs") {
      item.excelCategory = "3. Scientific Theories Breakthroughs";
    } else if (item.category === "Aviation Technology" || item.category === "Engineering Experiments & Demonstrations" || item.category === "Zeppelins") {
      item.excelCategory = "4. Practical Implementations";
    } else {
      // Default for anything we missed
      item.excelCategory = item.category;
    }

    // Process based on the category
    const year = item.parsedYear;
    
    // For categories 1-3, assign a time period based on year
    if (item.excelCategory === "1. Key Literary & Cultural Works" || 
        item.excelCategory === "2. Socioeconomic Factors" || 
        item.excelCategory === "3. Scientific Theories Breakthroughs") {
        
      const categoryObj = mainCategories[item.excelCategory];
      
      // Check each time period in this category
      for (const [periodName, periodRange] of Object.entries(categoryObj.timePeriods)) {
        if (year >= periodRange.startYear && year <= periodRange.endYear) {
          item.timePeriod = periodName;
          break;
        }
      }
      
      // If no time period was assigned, use the default
      if (!item.timePeriod) {
        const periods = Object.keys(categoryObj.timePeriods);
        item.timePeriod = periods[periods.length - 1]; // Use the last period as default
      }
    }
    // For category 4, assign a thematic group
    else if (item.excelCategory === "4. Practical Implementations") {
      // Assign thematic group based on title or content
      if (item.title.includes("Kite") || item.title.includes("Pigeon") || item.title.includes("Lantern")) {
        item.timePeriod = "4a. Non-Human Flight";
      } else if (item.title.includes("jump") || item.title.includes("Failed Flight")) {
        item.timePeriod = "4b. Early Attempts at Human Flight";
      } else if (item.title.includes("Balloon") || item.title.includes("Passarola")) {
        item.timePeriod = "4c. The Age of the Balloon";
      } else if (item.title.includes("Glider")) {
        item.timePeriod = "4d. Early Glider Experiments";
      } else if (item.title.includes("Dirigible") || item.title.includes("Zeppelin") || item.title.includes("Airship")) {
        item.timePeriod = "4f. Parallel Alternative: The Zeppelin";
      } else if (year >= 1945) {
        item.timePeriod = "4g. Post-War Advancements";
      } else {
        item.timePeriod = "4e. Race Toward Modern Aviation"; // Default for Category 4
      }
    }
    
    // Determine if the item is MAJOR, CIRCLE, or Timeline
    if (item.excelCategory === "1. Key Literary & Cultural Works") {
      item.nodeType = "MAJOR";
    } else if (item.excelCategory === "2. Socioeconomic Factors") {
      // For category 2, some items are MAJOR and some are CIRCLE
      // This is a simplification - in a real implementation, you would need to determine this based on specific criteria
      if (item.title.includes("Revolution") || item.title.includes("System") || item.title.includes("Tradition") || item.title.includes("Military Demand")) {
        item.nodeType = "MAJOR";
      } else {
        item.nodeType = "CIRCLE";
      }
    } else if (item.excelCategory === "3. Scientific Theories Breakthroughs") {
      item.nodeType = "CIRCLE";
    } else if (item.excelCategory === "4. Practical Implementations") {
      // For category 4, the thematic group is CIRCLE and the items are Timeline
      item.nodeType = "Timeline";
    }
  }

  // Parse all dates and assign categories and groups
  data.forEach(d => {
    d.parsedYear = parseTimelineDate(d.date);
    assignCategoryAndGroup(d);
  });
  
  // -------------------------
  // 4) CALCULATE TIME PERIOD ANGLES
  // -------------------------
  
  // Get all time periods for each category
  const categoryTimePeriods = {};
  
  // For categories 1-3 (time-based), get the time periods
  ["1. Key Literary & Cultural Works", "2. Socioeconomic Factors", "3. Scientific Theories Breakthroughs"].forEach(category => {
    categoryTimePeriods[category] = Object.keys(mainCategories[category].timePeriods);
  });
  
  // For category 4 (thematic), get the thematic groups
  categoryTimePeriods["4. Practical Implementations"] = Object.keys(mainCategories["4. Practical Implementations"].thematicGroups);
  
  console.log("Category time periods:", categoryTimePeriods);
  
  // Calculate angle spans for time periods/thematic groups within each category
  const categoryTimePeriodAngles = {};
  const totalAngle = 2 * Math.PI; // Full circle
  
  // For each category, calculate the angles for its time periods/groups
  Object.keys(categoryTimePeriods).forEach(category => {
    const periods = categoryTimePeriods[category];
    
    if (periods.length === 0) {
      return; // Skip if no periods for this category
    }
    
    // Initialize the angles object for this category
    categoryTimePeriodAngles[category] = {};
    
    // Calculate equal angle spans for each period in this category
    periods.forEach((period, index) => {
      const angleSize = totalAngle / periods.length;
      const startAngle = index * angleSize;
      const endAngle = startAngle + angleSize;
      
      categoryTimePeriodAngles[category][period] = {
        startAngle: startAngle,
        endAngle: endAngle
      };
    });
  });
  
  // -------------------------
  // 5) DRAW CATEGORY BOUNDARY CIRCLES AND TIME PERIOD DIVISIONS
  // -------------------------
  
  // First, draw the category boundary circles
  const boundaryGroup = container.append("g")
    .attr("class", "boundary-group");
    
  // Draw each category boundary as a circle
  Object.entries(mainCategories).forEach(([category, info]) => {
    boundaryGroup.append("circle")
      .attr("cx", center)
      .attr("cy", center)
      .attr("r", info.radius)
      .attr("fill", "none")
      .attr("stroke", info.color)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7);
      
    // Add the category label along the top of each circle
    boundaryGroup.append("text")
      .attr("x", center)
      .attr("y", center - info.radius + 20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(category)
      .style("fill", info.color)
      .style("font-size", "18px")
      .style("font-weight", "bold");
  });
  
  // Now draw the time period dividing lines for each category
  Object.entries(categoryTimePeriodAngles).forEach(([category, periodAngles]) => {
    const [innerRadius, outerRadius] = nodePlacementRanges[category];
    
    // Draw dividing lines for each time period in this category
    Object.entries(periodAngles).forEach(([period, angles]) => {
      // Draw start angle line
      boundaryGroup.append("line")
        .attr("x1", center + Math.cos(angles.startAngle) * innerRadius)
        .attr("y1", center + Math.sin(angles.startAngle) * innerRadius)
        .attr("x2", center + Math.cos(angles.startAngle) * outerRadius)
        .attr("y2", center + Math.sin(angles.startAngle) * outerRadius)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.6);
      
      // Add time period label at the middle of the section
      const labelAngle = (angles.startAngle + angles.endAngle) / 2;
      const labelRadius = (innerRadius + outerRadius) / 2;
      const labelX = center + Math.cos(labelAngle) * labelRadius;
      const labelY = center + Math.sin(labelAngle) * labelRadius;
      
      // Calculate rotation for the text so it follows the arc
      const rotation = (labelAngle * 180 / Math.PI + 90) % 360;
      
      boundaryGroup.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("transform", `rotate(${rotation}, ${labelX}, ${labelY})`)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(period)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-shadow", "1px 1px 2px black")
        .style("pointer-events", "none");
    });
  });

  // -------------------------
  // 6) INITIALIZE NODE POSITIONS AND LINKS
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

  // Position nodes according to their categories, time periods, and node types
  data.forEach(d => {    
    // Get the angle data for this node's category and time period
    const categoryPeriodAngles = categoryTimePeriodAngles[d.excelCategory];
    if (!categoryPeriodAngles || !categoryPeriodAngles[d.timePeriod]) {
      console.error("No angle data for category/period:", d.excelCategory, d.timePeriod);
      // Default fallback
      d.x = center;
      d.y = center;
      return;
    }
    
    const periodAngleData = categoryPeriodAngles[d.timePeriod];
    
    // Get all events in this time period and category with the same nodeType
    const eventsInSameGroup = data.filter(
      item => item.timePeriod === d.timePeriod && 
             item.excelCategory === d.excelCategory &&
             item.nodeType === d.nodeType
    );
    
    // Find index of this node within its group
    const nodeGroupIndex = eventsInSameGroup.indexOf(d);
    const totalNodesInGroup = eventsInSameGroup.length;
    
    // Calculate angle within the time period
    let angle;
    if (totalNodesInGroup > 1) {
      // Calculate spread within the time period
      const angleRange = periodAngleData.endAngle - periodAngleData.startAngle;
      const spreadFactor = 0.8; // Use 80% of the slice for spreading nodes
      const offset = (nodeGroupIndex + 0.5) / totalNodesInGroup;
      angle = periodAngleData.startAngle + (angleRange * spreadFactor * offset) + (angleRange * (1 - spreadFactor) / 2);
    } else {
      // Center in the slice if only one node
      angle = (periodAngleData.startAngle + periodAngleData.endAngle) / 2;
    }
    
    // Get the radius range for this category from nodePlacementRanges
    const [rMin, rMax] = nodePlacementRanges[d.excelCategory] || [0, maxOuterRadius];
    
    // Distribute nodes between the category boundaries
    let radius;
    
    // Different radius positioning based on node type
    if (d.nodeType === "MAJOR") {
      // MAJOR nodes are positioned near the outer edge
      radius = rMin + (rMax - rMin) * 0.8;
    } else if (d.nodeType === "CIRCLE") {
      // CIRCLE nodes are positioned in the middle area
      radius = rMin + (rMax - rMin) * 0.5;
    } else { // Timeline nodes
      // Timeline nodes are distributed throughout the area
      if (totalNodesInGroup <= 1) {
        radius = (rMin + rMax) / 2;
      } else {
        const areaWidth = rMax - rMin;
        
        // Advanced distribution for larger groups
        if (totalNodesInGroup > 5) {
          const normalizedIndex = nodeGroupIndex / (totalNodesInGroup - 1);
          const golden_ratio = 1.618033988749895;
          const theta = normalizedIndex * 2 * Math.PI * golden_ratio;
          const radiusOffset = Math.cos(theta * 2) * areaWidth * 0.3;
          radius = rMin + (areaWidth * 0.3) + (areaWidth * 0.4) * normalizedIndex + radiusOffset;
        } else {
          radius = rMin + (areaWidth * (nodeGroupIndex + 1)) / (totalNodesInGroup + 1);
        }
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
    d.startAngle = periodAngleData.startAngle;
    d.endAngle = periodAngleData.endAngle;
    
    // Flag to determine if the node is being dragged
    d.isDragging = false;
  });

  // Force simulation with appropriate constraints
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.4) // Increased to stabilize nodes faster
    .force("charge", d3.forceManyBody().strength(-30))
    .force("collide", d3.forceCollide(d => {
      // Larger collision radius for MAJOR nodes
      return d.nodeType === "MAJOR" ? 70 : 50;
    }).strength(0.8))
    .force("radial", d3.forceRadial(d => d.origRadius, center, center).strength(0.3))
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
  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", d => `node-group node-type-${d.nodeType}`)
    .attr("data-category", d => d.excelCategory)
    .attr("data-node-type", d => d.nodeType)
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .on("click", function(event, d) {
      // Show the modal if we're not dragging
      if (!d.wasDragged) {
        showModal(d);
      }
      // Reset the flag
      d.wasDragged = false;
    })
    .call(drag); // Add drag behavior

  // Vary node appearance based on node type
  nodeGroup.append("circle")
    .attr("r", d => {
      // Different sizes based on node type
      if (d.nodeType === "MAJOR") return 60;
      if (d.nodeType === "CIRCLE") return 50;
      return 40; // Timeline nodes are smaller
    })
    .attr("fill", d => colorScale(d.excelCategory))
    .style("stroke", "#333")
    .style("stroke-width", d => d.nodeType === "MAJOR" ? 2 : 1) // Thicker border for MAJOR nodes
    .style("cursor", "move"); // Change cursor to indicate draggable

  // Add a special visual indicator for MAJOR nodes
  nodeGroup.filter(d => d.nodeType === "MAJOR")
    .append("circle")
    .attr("r", 65)
    .attr("fill", "none")
    .attr("stroke", d => colorScale(d.excelCategory))
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .style("opacity", 0.6);

  // Display node title (and date for Timeline nodes)
  nodeGroup.append("foreignObject")
    .attr("x", d => {
      if (d.nodeType === "MAJOR") return -60;
      if (d.nodeType === "CIRCLE") return -50;
      return -40;
    })
    .attr("y", d => {
      if (d.nodeType === "MAJOR") return -60;
      if (d.nodeType === "CIRCLE") return -50;
      return -40;
    })
    .attr("width", d => {
      if (d.nodeType === "MAJOR") return 120;
      if (d.nodeType === "CIRCLE") return 100;
      return 80;
    })
    .attr("height", d => {
      if (d.nodeType === "MAJOR") return 120;
      if (d.nodeType === "CIRCLE") return 100;
      return 80;
    })
    .append("xhtml:div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("text-align", "center")
    .style("font-size", d => {
      if (d.nodeType === "MAJOR") return "14px";
      if (d.nodeType === "CIRCLE") return "12px";
      return "10px";
    })
    .style("width", "100%")
    .style("height", "100%")
    .style("overflow", "hidden")
    .style("pointer-events", "none") // Make text non-interactable so it doesn't interfere with dragging
    .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.7)")
    .style("color", "white")
    .html(d => {
      let content = `<strong>${d.title}</strong>`;
      // Add date for Timeline nodes
      if (d.nodeType === "Timeline") {
        content += `<br><small>${d.date}</small>`;
      }
      return content;
    });
    
  // -------------------------
  // 7) DRAG FUNCTIONS
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

  // Apply constraints to keep nodes between category boundaries and within their time period
  function applyRingConstraints(d) {
    // Radial constraint (keep between category boundaries)
    const [rMin, rMax] = nodePlacementRanges[d.excelCategory] || [0, maxOuterRadius];
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
      // Continuation of the applyRingConstraints function
    } else {
      // If exactly at center, nudge outward
      d.x = center + rMin + 10;
      d.y = center;
    }
    
    // Angular constraint (keep in time period)
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
    const categoryText = d.excelCategory;
    
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
    
    // Add time period information
    let timePeriodElement = document.getElementById("modal-time-period");
    if (!timePeriodElement) {
      timePeriodElement = document.createElement("p");
      timePeriodElement.id = "modal-time-period";
      const periodStrong = document.createElement("strong");
      periodStrong.textContent = "Time Period: ";
      timePeriodElement.appendChild(periodStrong);
      const periodSpan = document.createElement("span");
      periodSpan.id = "modal-period-span";
      timePeriodElement.appendChild(periodSpan);
      
      // Insert after category
      categoryElement.parentElement.insertBefore(timePeriodElement, categoryElement.nextSibling);
    }
    
    // Update time period text
    document.getElementById("modal-period-span").innerText = d.timePeriod;
    
    // Add node type information
    let nodeTypeElement = document.getElementById("modal-node-type");
    if (!nodeTypeElement) {
      nodeTypeElement = document.createElement("p");
      nodeTypeElement.id = "modal-node-type";
      const nodeTypeStrong = document.createElement("strong");
      nodeTypeStrong.textContent = "Node Type: ";
      nodeTypeElement.appendChild(nodeTypeStrong);
      const nodeTypeSpan = document.createElement("span");
      nodeTypeSpan.id = "modal-node-type-span";
      nodeTypeElement.appendChild(nodeTypeSpan);
      
      // Insert after time period
      timePeriodElement.parentElement.insertBefore(nodeTypeElement, timePeriodElement.nextSibling);
    }
    
    // Update node type text
    document.getElementById("modal-node-type-span").innerText = d.nodeType;
  }
  
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = e => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };

  // Initial centering
  svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.9));
  
  // Update the category legend to match the new structure
  updateCategoryLegend();
  
  function updateCategoryLegend() {
    // Clear existing legend
    d3.select(".category-legend").html("");
    
    // Add title
    d3.select(".category-legend")
      .append("h3")
      .style("margin-top", "0")
      .text("Categories");
    
    // Add legend items for each category from mainCategories
    Object.entries(mainCategories).forEach(([categoryName, categoryInfo]) => {
      const legendItem = d3.select(".category-legend")
        .append("div")
        .attr("class", "legend-item");
        
      legendItem.append("div")
        .attr("class", "legend-color")
        .style("background-color", categoryInfo.color);
        
      legendItem.append("div")
        .text(categoryName);
        
      // Add sub-periods for this category
      if (categoryTimePeriods[categoryName] && categoryTimePeriods[categoryName].length > 0) {
        const subPeriodContainer = d3.select(".category-legend")
          .append("div")
          .style("margin-left", "20px")
          .style("margin-bottom", "10px");
          
        categoryTimePeriods[categoryName].forEach(period => {
          const periodItem = subPeriodContainer
            .append("div")
            .attr("class", "legend-item")
            .style("margin-top", "3px");
            
          periodItem.append("div")
            .attr("class", "legend-marker")
            .style("width", "8px")
            .style("height", "8px")
            .style("border-right", "1px solid " + categoryInfo.color)
            .style("margin-right", "8px");
            
          periodItem.append("div")
            .text(period)
            .style("font-size", "13px");
        });
      }
      
      // Add legend for node types if this is the first category
      if (categoryName === "1. Key Literary & Cultural Works") {
        const nodeTypeLegend = d3.select(".category-legend")
          .append("div")
          .style("margin-top", "20px")
          .style("margin-bottom", "10px");
        
        nodeTypeLegend.append("h4")
          .text("Node Types")
          .style("margin-top", "10px")
          .style("margin-bottom", "5px");
        
        // MAJOR nodes
        const majorItem = nodeTypeLegend.append("div")
          .attr("class", "legend-item")
          .style("margin-top", "5px");
        
        majorItem.append("div")
          .attr("class", "legend-color")
          .style("border", "2px dashed #fff")
          .style("background-color", "rgba(255,255,255,0.2)");
        
        majorItem.append("div")
          .text("MAJOR")
          .style("font-weight", "bold");
        
        // CIRCLE nodes
        const circleItem = nodeTypeLegend.append("div")
          .attr("class", "legend-item")
          .style("margin-top", "5px");
        
        circleItem.append("div")
          .attr("class", "legend-color")
          .style("border", "1px solid #fff")
          .style("background-color", "rgba(255,255,255,0.1)");
        
        circleItem.append("div")
          .text("CIRCLE");
        
        // Timeline nodes
        const timelineItem = nodeTypeLegend.append("div")
          .attr("class", "legend-item")
          .style("margin-top", "5px");
        
        timelineItem.append("div")
          .attr("class", "legend-color")
          .style("background-color", "rgba(255,255,255,0.1)")
          .style("width", "10px")
          .style("height", "10px");
        
        timelineItem.append("div")
          .text("Timeline")
          .style("font-size", "0.9em");
      }
    });
  }

  // -------------------------
  // 8) ADD MISSING NODES FROM NEWORDEREVENT
  // -------------------------
  
  // This function would add any missing nodes that are in the NewOrderEvents.docx file
  // but not in the current visualization
  function addMissingNodesFromNewOrderEvents() {
    // In a real implementation, this would compare the current data
    // with the nodes from NewOrderEvents.docx
    console.log("Function ready to add missing nodes from NewOrderEvents.docx when parsed");
    
    // Example of how to add nodes from the missing Wright Brothers event
    const missingNodes = [
      {
        title: "Wright Brothers' Flights",
        date: "1903-1906",
        description: "Orville and Wilbur Wright achieve the first sustained, controlled, powered flight with their Wright Flyer.",
        img: "/api/placeholder/100/100",
        people: ['Orville Wright', 'Wilbur Wright'],
        category: "Engineering Experiments & Demonstrations",
        excelCategory: "4. Practical Implementations",
        timePeriod: "4e. Race Toward Modern Aviation",
        nodeType: "Timeline",
        connections: []
      }
    ];
    
    // Add each missing node
    missingNodes.forEach(newNode => {
      // Parse the date
      newNode.parsedYear = parseTimelineDate(newNode.date);
      
      // Add to data array
      data.push(newNode);
      
      // Position the node based on its category and time period
      const categoryPeriodAngles = categoryTimePeriodAngles[newNode.excelCategory];
      if (!categoryPeriodAngles || !categoryPeriodAngles[newNode.timePeriod]) {
        console.error("No angle data for category/period:", newNode.excelCategory, newNode.timePeriod);
        return;
      }
      
      const periodAngleData = categoryPeriodAngles[newNode.timePeriod];
      const angle = (periodAngleData.startAngle + periodAngleData.endAngle) / 2;
      
      const [rMin, rMax] = nodePlacementRanges[newNode.excelCategory];
      const radius = (rMin + rMax) / 2;
      
      newNode.x = center + Math.cos(angle) * radius;
      newNode.y = center + Math.sin(angle) * radius;
      
      // Add the node to the visualization
      const newNodeGroup = container.append("g")
        .datum(newNode)
        .attr("class", `node-group node-type-${newNode.nodeType}`)
        .attr("data-category", newNode.excelCategory)
        .attr("data-node-type", newNode.nodeType)
        .attr("transform", `translate(${newNode.x}, ${newNode.y})`)
        .on("click", function(event, d) {
          showModal(d);
        })
        .call(drag);
      
      // Add the circle for the node
      newNodeGroup.append("circle")
        .attr("r", newNode.nodeType === "Timeline" ? 40 : 50)
        .attr("fill", colorScale(newNode.excelCategory))
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .style("cursor", "move");
      
      // Add the label
      newNodeGroup.append("foreignObject")
        .attr("x", -40)
        .attr("y", -40)
        .attr("width", 80)
        .attr("height", 80)
        .append("xhtml:div")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("text-align", "center")
        .style("font-size", "10px")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow", "hidden")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.7)")
        .style("color", "white")
        .html(`<strong>${newNode.title}</strong><br><small>${newNode.date}</small>`);
      
      // Add to simulation
      simulation.nodes().push(newNode);
      simulation.alpha(0.3).restart();
    });
  }
  
  // Call this function to add the Wright Brothers node
  // Uncomment this line to add the missing Wright Brothers node:
  // addMissingNodesFromNewOrderEvents();
  
  console.log("Visualization setup complete");
});
