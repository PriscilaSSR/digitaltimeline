// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing visualization");
  
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  // Get the data directly from the source - only visible items
  const data = window.visibleTimelineItems || window.timelineItems;
  console.log("Data loaded, visible items:", data.length);

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
    .style("width", "380px")
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
    .style("margin-bottom", "15px")
    .html(`<h3 style="margin: 0;">Timeline Events</h3>
           <button id="close-timeline" style="background: none; border: none; font-size: 20px; color: white; cursor: pointer;">&times;</button>`);
    
  // Add a content div for the timeline items
  timelineContainer.append("div")
    .attr("id", "timeline-content");
    
  // Add event listener to close button
  d3.select("#close-timeline").on("click", function() {
    d3.select("#timeline-container").style("display", "none");
  });
  
  // -------------------------
  // 2) DEFINE CIRCULAR BOUNDARIES
  // -------------------------
  
  // Define circular boundaries for the Excel categories - these will be the dividing lines
  const categoryBoundaries = {
    "Key Literary & Cultural Works": maxOuterRadius,
    "Socioeconomic Factors": maxOuterRadius * 0.75,
    "Scientific Theories Breakthroughs": maxOuterRadius * 0.5,
    "Practical Implementations": maxOuterRadius * 0.25
  };
  
  // Define the spaces between boundaries where nodes will be positioned
  const nodePlacementRanges = {
    "Key Literary & Cultural Works": [categoryBoundaries["Socioeconomic Factors"], categoryBoundaries["Key Literary & Cultural Works"]],
    "Socioeconomic Factors": [categoryBoundaries["Scientific Theories Breakthroughs"], categoryBoundaries["Socioeconomic Factors"]],
    "Scientific Theories Breakthroughs": [categoryBoundaries["Practical Implementations"], categoryBoundaries["Scientific Theories Breakthroughs"]],
    "Practical Implementations": [0, categoryBoundaries["Practical Implementations"]]
  };
  
  // Colors for each Excel category
  const colorScale = d3.scaleOrdinal()
    .domain(["Key Literary & Cultural Works", "Socioeconomic Factors", "Scientific Theories Breakthroughs", "Practical Implementations"])
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
      
      // Add triangular arrow indicator at the dividing line
      const arrowSize = 40;
      const arrowRadius = (innerRadius + outerRadius) / 2;
      const arrowX = center + Math.cos(angles.startAngle) * arrowRadius;
      const arrowY = center + Math.sin(angles.startAngle) * arrowRadius;
      const arrowAngle = angles.startAngle + Math.PI/2; // Perpendicular to the radius
      
      // Create triangle points
      const trianglePoints = [
        [arrowX, arrowY],
        [arrowX + Math.cos(arrowAngle) * arrowSize, arrowY + Math.sin(arrowAngle) * arrowSize],
        [arrowX + Math.cos(angles.startAngle) * arrowSize, arrowY + Math.sin(angles.startAngle) * arrowSize]
      ].map(point => point.join(',')).join(' ');
      
      boundaryGroup.append("polygon")
        .attr("points", trianglePoints)
        .attr("fill", colorScale(category))
        .attr("class", "period-arrow")
        .attr("data-period", period)
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
        .on("click", function() {
          highlightTimePeriod(period);
        });
      
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
        .attr("class", "period-label")
        .attr("data-period", period)
        .text(period)
        .style("fill", "#fff")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("text-shadow", "1px 1px 2px black")
        .style("pointer-events", "none");
        
      // Add highlight arc for the time period
      const arcGenerator = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(angles.startAngle)
        .endAngle(angles.endAngle);
        
      boundaryGroup.append("path")
        .attr("d", arcGenerator)
        .attr("transform", `translate(${center}, ${center})`)
        .attr("class", "time-slice")
        .attr("data-period", period)
        .attr("fill", colorScale(category))
        .attr("fill-opacity", 0.1)
        .attr("stroke", colorScale(category))
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.3)
        .style("cursor", "pointer")
        .on("click", function() {
          highlightTimePeriod(period);
        });
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
    
    // Distribute nodes between the category boundaries based on node type
    let radius;
    
    if (d.nodeType === "MAJOR") {
      // MAJOR nodes are placed at the outer edge of their category ring to follow the arch
      radius = rMax - 30; // Slight inset from the boundary
    } else if (d.nodeType === "TIMELINE_TRIGGER") {
      // TIMELINE_TRIGGER nodes are placed in the middle area
      radius = (rMin + rMax) / 2;
    } else {
      // CIRCLE nodes are distributed throughout the ring
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
    }
    
    // Ensure radius stays within bounds
    radius = Math.max(rMin + 20, Math.min(rMax - 20, radius));
    
    // Position at the calculated angle and radius
   // d.x = center + Math.cos(angle) * radius;
   // d.y = center + Math.sin(angle) * radius;
    
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

  // -------------------------
  // 6) RENDERING AND INTERACTIVITY
  // -------------------------
  
  // Force simulation with appropriate constraints
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.4) // Increased to stabilize nodes faster
    .force("charge", d3.forceManyBody().strength(-30))
    .force("collide", d3.forceCollide(d => d.nodeType === "MAJOR" ? 40 : 60).strength(0.8)) // Adjust collision by node type
    .force("radial", d3.forceRadial(d => d.origRadius, center, center).strength(0.3)) // Keep nodes at their assigned radius
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
  const circleRadius = 50; // Standard circle radius
  const majorNodeHeight = 30; // Height for MAJOR category text displays
  
  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", d => `node-group node-${d.nodeType.toLowerCase()}`)
    .attr("data-category", d => d.excelCategory)
    .attr("data-type", d => d.nodeType)
    .attr("data-period", d => d.timePeriod)
    //.attr("transform", d => `translate(${d.x}, ${d.y})`)
      .each(function(d) {
    this.style.setProperty('--my-angle', `${d.origAngle * 180 / Math.PI}deg`);
    this.style.setProperty('--my-radius', `${d.origRadius}px`);
  })
    .on("click", function(event, d) {
      // If not dragging, show info
      if (!d.wasDragged) {
    if (d.nodeType === "TIMELINE_TRIGGER" && d.TimeLineCategory) {
        // For timeline trigger nodes, show timeline popup
        showTimelinePopup(d);
    } else if (d.nodeType === "TIMELINE_CATEGORY" && d.TimeLineCategory) {
        // For timeline category nodes, show timeline popup
        showTimelinePopup(d);
    } else {
        // For other nodes, show the regular modal
        showModal(d);
    }
}
      // Reset the flag
      d.wasDragged = false;
    })
    .call(drag); // Add drag behavior

  // HANDLE DIFFERENT NODE TYPES
 // 1. CIRCLE nodes - regular circles
nodeGroup.filter(d => d.nodeType === "CIRCLE")
    .each(function(d) {
      // Add circle
      d3.select(this).append("circle")
        .attr("r", circleRadius)
        .attr("fill", colorScale(d.excelCategory))
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .style("cursor", "pointer");
      
      // Add title text
      d3.select(this).append("foreignObject")
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
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.7)")
        .style("color", "white")
        .html(`<strong>${d.title}</strong>`);
    });
  
  // 2. MAJOR nodes - text that follows the circular arch
 nodeGroup.filter(d => d.nodeType === "MAJOR")
  .each(function(d) {
    const angle = d.origAngle;
    const radius = d.origRadius;
    
    // Create curved path for the text to follow
    // The ID needs to be unique for each path
    const pathId = `textPath-${d.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    
    // First approach: Use an arc path with a proper center transformation
 
    const sweep = Math.min(Math.PI * 0.5, 2.0 * Math.PI / data.filter(item => 
      item.nodeType === "MAJOR" && 
      item.timePeriod === d.timePeriod
    ).length);
    
    const startAngle = angle - sweep / 2;
    const endAngle = angle + sweep / 2;
    
    // Create arc path
    const arcPath = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(0);
    
    // Add path for text to follow
    d3.select(this).append("path")
      .attr("id", pathId)
      .attr("d", arcPath())
      .attr("transform", `translate(0, 0)`) // No translation needed since nodes are already positioned
      .style("fill", "none")
      .style("stroke", "none");
      
    // Add text that follows the path
    d3.select(this).append("text")
      .append("textPath")
      .attr("href", `#${pathId}`)
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .text(d.title)
      .style("fill", colorScale(d.excelCategory))
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("text-shadow", "0px 0px 3px black, 0px 0px 2px black")
      .style("pointer-events", "none");
    
    // Alternative approach using a custom path
    // This approach explicitly creates a curved path in the correct position
    /*
    const pathLength = radius * sweep;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Create arc path centered at 0,0 (will be positioned by the node transform)
    let pathData = `M ${radius * Math.cos(startAngle)},${radius * Math.sin(startAngle)} `;
    pathData += `A ${radius},${radius} 0 0,1 ${radius * Math.cos(endAngle)},${radius * Math.sin(endAngle)}`;
    
    d3.select(this).append("path")
      .attr("id", pathId)
      .attr("d", pathData)
      .style("fill", "none")
      .style("stroke", "none");
      */
    // Add a small indicator dot
    d3.select(this).append("circle")
      .attr("r", 8)
      .attr("fill", colorScale(d.excelCategory))
      .style("stroke", "#333")
      .style("stroke-width", 1)
      .style("cursor", "pointer");
  });

  // 3. TIMELINE_TRIGGER nodes - nodes that trigger a timeline popup
  nodeGroup.filter(d => d.nodeType === "TIMELINE_TRIGGER")
    .each(function(d) {
      // Create a special indicator node that looks different
      d3.select(this).append("circle")
        .attr("r", circleRadius * 0.8)
        .attr("fill", colorScale(d.excelCategory))
        .style("stroke", "#fff")
        .style("stroke-width", 2)
        .style("cursor", "pointer")
        .style("stroke-dasharray", "4,4") // Dashed outline
        .style("filter", "drop-shadow(0 0 4px rgba(255,255,255,0.5))"); // Glow effect
    
      // Add a timeline icon
      const iconSize = 16;
      d3.select(this).append("g")
        .attr("class", "timeline-icon")
        .html(`
          <rect x="${-iconSize}" y="${-iconSize/2}" width="${iconSize*2}" height="${2}" fill="white"></rect>
          <rect x="${-iconSize}" y="${-iconSize/2-6}" width="${iconSize*2}" height="${2}" fill="white"></rect>
          <rect x="${-iconSize}" y="${-iconSize/2+6}" width="${iconSize*2}" height="${2}" fill="white"></rect>
          <circle cx="${-iconSize+4}" cy="${-iconSize/2}" r="3" fill="white"></circle>
          <circle cx="${-iconSize+4}" cy="${-iconSize/2-6}" r="3" fill="white"></circle>
          <circle cx="${iconSize-4}" cy="${-iconSize/2+6}" r="3" fill="white"></circle>
        `);
      
      // Add category label (e.g., "Zeppelins", "Non-Human Flight", etc.)
      d3.select(this).append("foreignObject")
        .attr("x", -circleRadius * 0.7)
        .attr("y", -circleRadius * 0.7 + 15) // Offset to make room for the icon
        .attr("width", circleRadius * 1.4)
        .attr("height", circleRadius * 1.4)
        .append("xhtml:div")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("text-align", "center")
        .style("font-size", "12px")
        .style("width", circleRadius * 1.4 + "px")
        .style("height", circleRadius * 1.4 + "px")
        .style("overflow", "hidden")
        .style("pointer-events", "none")
        .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.7)")
        .style("color", "white")
        .html(`<strong>${d.TimeLineCategory}</strong>`);
    });
// 4. TIMELINE_CATEGORY nodes - new nodes to trigger timeline popups
nodeGroup.filter(d => d.nodeType === "TIMELINE_CATEGORY")
    .each(function(d) {
        // Add circle
        d3.select(this).append("circle")
            .attr("r", circleRadius)
            .attr("fill", colorScale(d.excelCategory))
            .style("stroke", "#333")
            .style("stroke-width", 1)
            .style("cursor", "pointer");

        // Add title text
        d3.select(this).append("foreignObject")
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
            .style("pointer-events", "none")
            .style("text-shadow", "0px 0px 3px rgba(0,0,0,0.7)")
            .style("color", "white")
            .html(`<strong>${d.title}</strong>`);
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
      if (categoryName === "Key Literary & Cultural Works") {
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

 
  console.log("Visualization setup complete");
});
