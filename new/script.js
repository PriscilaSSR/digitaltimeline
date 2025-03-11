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

  // Define timeline periods specific to each category based on Excel structure
  function assignTimePeriod(year, category) {
    // Category 1: Key Literary & Cultural Works
    if (category === "1. Key Literary & Cultural Works") {
      if (year <= -100 || (year >= 0 && year < 1400)) {
        return "1a. 500s BCE to 1399s CE";
      } else if (year >= 1400 && year < 1800) {
        return "1b. 1400 CE to 1799s CE";
      } else {
        return "1c. 1800s CE to 1945 CE";
      }
    }
    // Category 2: Socioeconomic Factors
    else if (category === "2. Socioeconomic Factors") {
      if (year <= -100 || (year >= 0 && year < 1400)) {
        return "2a. 500s BCE to 1399s CE";
      } else if (year >= 1400 && year < 1700) {
        return "2b. 1400 CE to 1699s CE";
      } else if (year >= 1700 && year < 1890) {
        return "2c. 1760s CE to 1890s CE";
      } else {
        return "2d. 1890s CE to 1980s CE";
      }
    }
    // Category 3: Scientific Theories Breakthroughs
    else if (category === "3. Scientific Theories Breakthroughs") {
      if (year <= -100 || (year >= 0 && year < 1600)) {
        return "3a. 500s BCE to 1599s CE";
      } else if (year >= 1600 && year < 1760) {
        return "3b. 1600s CE to 1760s CE";
      } else if (year >= 1760 && year < 1900) {
        return "3c. 1770s CE to 1899s CE";
      } else {
        return "3d. 1900s CE to 1945 CE";
      }
    }
    // Category 4: Practical Implementations - has the most subcategories
    else if (category === "4. Practical Implementations") {
      // We'll need to further refine this based on your Excel subcategories
      if (year <= -100 || (year >= 0 && year < 800)) {
        return "4a. Non-Human Flight";
      } else if (year >= 800 && year < 1700) {
        return "4b. Early Attempts at Human Flight";
      } else if (year >= 1700 && year < 1800) {
        return "4c. The Age of the Balloon";
      } else if (year >= 1800 && year < 1890) {
        return "4d. Early Glider Experiments";
      } else if (year >= 1890 && year < 1930) {
        return "4e. Race Toward Modern Aviation";
      } else if (year >= 1900 && year < 1940) {
        return "4f. Parallel Alternative: The Zeppelin";
      } else {
        return "4g. Post-War Advancements";
      }
    }
    // Default fallback
    else {
      return "Unknown Period";
    }
  }

  // Function to normalize centuries for category assignment
  function normalizeTimePeriod(year) {
    // Get the time period
    const period = assignTimePeriod(year);
    
    // Return a normalized value for the time period for angle calculations
    switch(period) {
      case "500s BCE to 1399s CE": return -500;
      case "1400 CE to 1599s CE": return 1400;
      case "1600s CE to 1760s CE": return 1600;
      case "1760s CE to 1799s CE": return 1760;
      case "1800s CE to 1899s CE": return 1800;
      case "1900s CE to 1945 CE": return 1900;
      default: return year;
    }
  }

  // Parse all dates and assign to time periods with category-specific divisions
  data.forEach(d => {
    d.parsedYear = parseTimelineDate(d.date);
    
    // MODIFIED: Map category to Excel structure
    // Map the existing categories to the Excel structure
    if (d.category === "Aviation Technology") {
      d.excelCategory = "4. Practical Implementations";
      d.excelSubcategory = "4a. Non-Human Flight";
    } else if (d.category === "Theoretical Breakthroughs") {
      d.excelCategory = "3. Scientific Theories Breakthroughs";
    } else if (d.category === "Sociocultural & Economic Factors") {
      d.excelCategory = "2. Socioeconomic Factors";
    } else if (d.category === "Humanity's Dream of Flying") {
      d.excelCategory = "1. Key Literary & Cultural Works";
    } else if (d.category === "Engineering Experiments & Demonstrations") {
      d.excelCategory = "4. Practical Implementations";
      d.excelSubcategory = "4e. Race Toward Modern Aviation";
    } else {
      // Default for anything we missed
      d.excelCategory = d.category;
    }
    
    // Now assign the time period based on both date and category
    d.timePeriod = assignTimePeriod(d.parsedYear, d.excelCategory);
  });
  
  // Define circular boundaries for the Excel categories - these will be the dividing lines
  const categoryBoundaries = {
    "1. Key Literary & Cultural Works": maxOuterRadius,
    "2. Socioeconomic Factors": maxOuterRadius * 0.75,
    "3. Scientific Theories Breakthroughs": maxOuterRadius * 0.5,
    "4. Practical Implementations": maxOuterRadius * 0.25
  };
  
  // Define the spaces between boundaries where nodes will be positioned
  const nodePlacementRanges = {
    "1. Key Literary & Cultural Works": [categoryBoundaries["2. Socioeconomic Factors"], categoryBoundaries["1. Key Literary & Cultural Works"]],
    "2. Socioeconomic Factors": [categoryBoundaries["3. Scientific Theories Breakthroughs"], categoryBoundaries["2. Socioeconomic Factors"]],
    "3. Scientific Theories Breakthroughs": [categoryBoundaries["4. Practical Implementations"], categoryBoundaries["3. Scientific Theories Breakthroughs"]],
    "4. Practical Implementations": [0, categoryBoundaries["4. Practical Implementations"]]
  };
  
  // Colors for each Excel category
  const colorScale = d3.scaleOrdinal()
    .domain(["1. Key Literary & Cultural Works", "2. Socioeconomic Factors", "3. Scientific Theories Breakthroughs", "4. Practical Implementations"])
    .range(["#9c27b0", "#c62828", "#1565c0", "#2e7d32"]);

  // -------------------------
  // 3) CALCULATE TIME PERIOD ANGLES
  // -------------------------
  
  // Get category-specific time periods
  const categoryTimePeriods = {};
  
  // Get unique time periods for each category
  Object.keys(nodePlacementRanges).forEach(category => {
    categoryTimePeriods[category] = [...new Set(
      data
        .filter(d => d.excelCategory === category)
        .map(d => d.timePeriod)
    )].sort((a, b) => {
      // Sort based on the first year or the prefix (1a, 1b, etc.)
      const getPrefix = (period) => {
        const match = period.match(/(\d+[a-z])/);
        return match ? match[0] : period;
      };
      return getPrefix(a).localeCompare(getPrefix(b));
    });
  });
  
  console.log("Category time periods:", categoryTimePeriods);
  
  // Calculate angle spans for time periods within each category
  const categoryTimePeriodAngles = {};
  const totalAngle = 2 * Math.PI; // Full circle
  
  // For each category, calculate the angles for its time periods
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
  // 4) DRAW CATEGORY BOUNDARY CIRCLES AND TIME PERIOD DIVISIONS
  // -------------------------
  
  // First, draw the category boundary circles
  const boundaryGroup = container.append("g")
    .attr("class", "boundary-group");
    
  // Draw each category boundary as a circle
  Object.entries(categoryBoundaries).forEach(([category, radius]) => {
    boundaryGroup.append("circle")
      .attr("cx", center)
      .attr("cy", center)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", colorScale(category))
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7);
      
    // Add the category label along the top of each circle
    boundaryGroup.append("text")
      .attr("x", center)
      .attr("y", center - radius + 20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(category)
      .style("fill", colorScale(category))
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
  // 5) INITIALIZE NODE POSITIONS AND LINKS
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

  // Position nodes between the category boundary circles based on their time period
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
    
    // Get all events in this time period and category
    const eventsInSamePeriodAndCategory = data.filter(
      item => item.timePeriod === d.timePeriod && item.excelCategory === d.excelCategory
    );
    
    // Find index of this node within its period+category group
    const nodeGroupIndex = eventsInSamePeriodAndCategory.indexOf(d);
    const totalNodesInGroup = eventsInSamePeriodAndCategory.length;
    
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
    if (totalNodesInGroup <= 1) {
      // If only one node, place in middle of the area
      radius = (rMin + rMax) / 2;
    } else {
      // For multiple nodes, distribute them throughout the area
      const areaWidth = rMax - rMin;
      
      // More advanced distribution for larger groups
      if (totalNodesInGroup > 5) {
        // Create a pattern that fills the area between circles
        const normalizedIndex = nodeGroupIndex / (totalNodesInGroup - 1);
        const golden_ratio = 1.618033988749895;
        const theta = normalizedIndex * 2 * Math.PI * golden_ratio;
        const radiusOffset = Math.cos(theta * 2) * areaWidth * 0.3;
        radius = rMin + (areaWidth * 0.3) + (areaWidth * 0.4) * normalizedIndex + radiusOffset;
      } else {
        // For smaller groups, use simpler distribution
        radius = rMin + (areaWidth * (nodeGroupIndex + 1)) / (totalNodesInGroup + 1);
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
    .attr("data-category", d => d.excelCategory) // Add data attribute for styling
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

  nodeGroup.append("circle")
    .attr("r", circleRadius)
    .attr("fill", d => colorScale(d.excelCategory))
    .style("stroke", "#333")
    .style("stroke-width", 1)
    .style("cursor", "move"); // Change cursor to indicate draggable

  // Display only the title, not the date
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
    .html(d => `<strong>${d.title}</strong>`);
    
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

Angle !== undefined && d.endAngle !== undefined) {
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
    const categoryText = d.excelCategory + (d.excelSubcategory ? ` (${d.excelSubcategory})` : '');
    
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
  }
  
  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = e => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };

  // Initial centering
  svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.9));
  
  // Update the category legend to match Excel structure
  updateCategoryLegend();
  
  function updateCategoryLegend() {
    // Clear existing legend
    d3.select(".category-legend").html("");
    
    // Add title
    d3.select(".category-legend")
      .append("h3")
      .style("margin-top", "0")
      .text("Categories");
    
    // Add legend items for each Excel category
    [
      {name: "1. Key Literary & Cultural Works", color: "#9c27b0"},
      {name: "2. Socioeconomic Factors", color: "#c62828"},
      {name: "3. Scientific Theories Breakthroughs", color: "#1565c0"},
      {name: "4. Practical Implementations", color: "#2e7d32"}
    ].forEach(cat => {
      const legendItem = d3.select(".category-legend")
        .append("div")
        .attr("class", "legend-item");
        
      legendItem.append("div")
        .attr("class", "legend-color")
        .style("background-color", cat.color);
        
      legendItem.append("div")
        .text(cat.name);
        
      // Add sub-periods for this category
      if (categoryTimePeriods[cat.name] && categoryTimePeriods[cat.name].length > 0) {
        const subPeriodContainer = d3.select(".category-legend")
          .append("div")
          .style("margin-left", "20px")
          .style("margin-bottom", "10px");
          
        categoryTimePeriods[cat.name].forEach(period => {
          const periodItem = subPeriodContainer
            .append("div")
            .attr("class", "legend-item")
            .style("margin-top", "3px");
            
          periodItem.append("div")
            .attr("class", "legend-marker")
            .style("width", "8px")
            .style("height", "8px")
            .style("border-right", "1px solid " + cat.color)
            .style("margin-right", "8px");
            
          periodItem.append("div")
            .text(period)
            .style("font-size", "13px");
        });
      }
    });
  }
  
  // -------------------------
  // 8) ADD MISSING NODES FROM EXCEL
  // -------------------------
  
  // This function would add any missing nodes that are in your Excel file
  // but not in the current visualization
  function addMissingNodesFromExcel() {
    // In a real implementation, this would compare the current data
    // with a separate data source loaded from your Excel file
    console.log("Function ready to add missing nodes from Excel when data is available");
    
    // Example of how to add a new node (would need actual data)
    /*
    const newNode = {
      title: "New Event from Excel",
      date: "1750",
      description: "Description of the event",
      category: "1. Key Literary & Cultural Works",
      // other properties as needed
    };
    
    // Parse the date and assign time period
    newNode.parsedYear = parseTimelineDate(newNode.date);
    newNode.timePeriod = assignTimePeriod(newNode.parsedYear);
    
    // Add to data array
    data.push(newNode);
    
    // Position the node
    // (similar to code in the positioning section above)
    
    // Add to visualization
    // (would need to create a new node group, etc.)
    */
  }
  
  console.log("Visualization setup complete");
});
