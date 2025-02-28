document.addEventListener("DOMContentLoaded", function() {
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  const data = window.timelineItems;

  // We'll use a 2000x2000 viewBox
  const viewBoxSize = 2000;
  const center = viewBoxSize / 2; // 1000

  // Define the largest ring radius (90% of half the viewBox)
  const maxOuterRadius = center * 0.9; // 800

  // Count events per category for proportional rings
  const categoryCounts = {
    "Engineering Experiments & Demonstrations": data.filter(d => d.category === "Engineering Experiments & Demonstrations").length,
    "Conceptual & Scientific Breakthroughs": data.filter(d => d.category === "Conceptual & Scientific Breakthroughs").length,
    "Sociocultural Factors": data.filter(d => d.category === "Sociocultural Factors").length
  };
  
  // Calculate total count for proportions
  const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate proportional widths (minimum 20% width for any category)
  const eedProportion = Math.max(0.2, categoryCounts["Engineering Experiments & Demonstrations"] / totalCount);
  const csbProportion = Math.max(0.2, categoryCounts["Conceptual & Scientific Breakthroughs"] / totalCount);
  const sfProportion = Math.max(0.2, categoryCounts["Sociocultural Factors"] / totalCount);
  
  // Normalize proportions to sum to 1
  const totalProportion = eedProportion + csbProportion + sfProportion;
  const normEedProp = eedProportion / totalProportion;
  const normCsbProp = csbProportion / totalProportion;
  const normSfProp = sfProportion / totalProportion;
  
  // Define ring ranges based on normalized proportions
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, maxOuterRadius * normEedProp],
    "Conceptual & Scientific Breakthroughs": [
      maxOuterRadius * normEedProp, 
      maxOuterRadius * (normEedProp + normCsbProp)
    ],
    "Sociocultural Factors": [
      maxOuterRadius * (normEedProp + normCsbProp), 
      maxOuterRadius
    ],
    "Human's Dream of Flying": [maxOuterRadius, maxOuterRadius * 1.1] // Visual only
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
  // 2) PARSE DATES AND CREATE TIME SLICES
  // -------------------------
  
  // Parse timeline dates
  function parseTimelineDate(dateStr) {
    dateStr = dateStr.trim();
    
    if (dateStr.includes('BCE')) {
      const year = parseInt(dateStr.replace(/[^0-9]/g, ''));
      return -year;
    }
    
    if (dateStr.match(/^\d+s$/)) {
      return parseInt(dateStr);
    }
    
    if (dateStr.includes('–') || dateStr.includes('-')) {
      const parts = dateStr.split(/[–-]/);
      return parseInt(parts[0]);
    }
    
    if (dateStr.includes('Centuries') || dateStr.includes('Century')) {
      const match = dateStr.match(/(\d+)(?:st|nd|rd|th)/);
      if (match) {
        return (parseInt(match[1]) - 1) * 100;
      }
    }
    
    if (dateStr.match(/^\d+$/)) {
      return parseInt(dateStr);
    }
    
    return 0;
  }

  // Parse all dates and assign to centuries
  data.forEach(d => {
    d.parsedYear = parseTimelineDate(d.date);
    d.century = Math.floor(d.parsedYear / 100) * 100;
  });

  // Get unique centuries that actually have events (no empty centuries)
  const uniqueCenturies = [...new Set(data.map(d => d.century))].sort((a, b) => a - b);
  
  // Calculate counts per century for each category
  const categoryCenturyCounts = {};
  uniqueCenturies.forEach(century => {
    categoryCenturyCounts[century] = {
      "Engineering Experiments & Demonstrations": data.filter(d => d.century === century && d.category === "Engineering Experiments & Demonstrations").length,
      "Conceptual & Scientific Breakthroughs": data.filter(d => d.century === century && d.category === "Conceptual & Scientific Breakthroughs").length,
      "Sociocultural Factors": data.filter(d => d.century === century && d.category === "Sociocultural Factors").length,
      "total": data.filter(d => d.century === century).length
    };
  });
  
  // Calculate the angle each century should span (equal distribution around the circle)
  const totalAngle = 2 * Math.PI; // Full circle
  const anglePerCentury = totalAngle / uniqueCenturies.length;
  
  // Create century objects with angle information
  const centuries = uniqueCenturies.map((century, i) => {
    return {
      year: century,
      startAngle: i * anglePerCentury,
      endAngle: (i + 1) * anglePerCentury,
      midAngle: i * anglePerCentury + anglePerCentury / 2,
      counts: categoryCenturyCounts[century]
    };
  });

  // -------------------------
  // 3) DRAW CATEGORY RINGS WITH TIME SLICES
  // -------------------------
  
  // Define category rings
  const categories = [
    {
      name: "Human's Dream of Flying",
      outerRadius: maxOuterRadius * 1.1,
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
    
    // Special handling for the "Human's Dream of Flying" ring (just a visual outline)
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
    
    // Create data for time slices
    const timeSliceData = centuries.map(century => {
      return {
        century: century.year,
        startAngle: century.startAngle,
        endAngle: century.endAngle,
        midAngle: century.midAngle,
        ringData: categoryData,
        count: century.counts[categoryData.name] || 0
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
        return d.count > 0 ? baseColor : d3.color(baseColor).copy({opacity: 0.05});
      })
      .style("stroke", categoryData.color)
      .style("stroke-width", 0.5)
      .style("opacity", d => d.count > 0 ? Math.min(0.9, 0.7 + (d.count * 0.05)) : 0.1)
      .append("title")
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
    
    // Add century labels where there are events or at regular intervals
    timeSliceData.forEach((d, i) => {
      // Show labels for populated centuries or every 3rd century as reference
      if (d.count > 0 || i % 3 === 0) {
        // Calculate position on the middle of the arc
        const angle = d.midAngle;
        const radius = (categoryData.innerRadius + categoryData.outerRadius) / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        
        // Add century label
        group.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("transform", `rotate(${angle * 180 / Math.PI + 90}, ${x}, ${y})`)
          .text(d.century < 0 ? `${Math.abs(d.century)}s BCE` : `${d.century}s`)
          .style("fill", "#fff")
          .style("font-size", d.count > 0 ? "16px" : "14px")
          .style("font-weight", d.count > 0 ? "bold" : "normal")
          .style("opacity", d.count > 0 ? 0.8 : 0.6);
      }
    });
  });

  // -------------------------
  // 4) NODE POSITIONING AND LINKS
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
    // Find the century object
    const centuryObj = centuries.find(c => c.year === d.century);
    
    if (!centuryObj) {
      console.error(`Century not found for ${d.title} (${d.century})`);
      return;
    }
    
    // Find all nodes in the same century and category to distribute evenly
    const nodesInSameGroup = data.filter(item => 
      item.century === d.century && item.category === d.category
    );
    
    // Get this node's index in the group (if there are multiple)
    const nodeIndexInGroup = nodesInSameGroup.indexOf(d);
    
    // Calculate angle with slight offset if multiple nodes in same category/century
    let angle = centuryObj.midAngle;
    if (nodesInSameGroup.length > 1) {
      // Spread nodes within their arc segment
      const totalSpread = anglePerCentury * 0.8; // Use 80% of the segment
      const nodeSpread = totalSpread / nodesInSameGroup.length;
      const startOffset = -totalSpread / 2;
      angle = centuryObj.midAngle + startOffset + nodeSpread * (nodeIndexInGroup + 0.5);
    }
    
    // Find the min/max radius for this category
    const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
    
    // Randomize radius slightly within the range to reduce overlap
    const radiusRange = rMax - rMin;
    const avgRadius = rMin + radiusRange * 0.5;
    
    // Position at the calculated point
    d.x = center + Math.cos(angle) * avgRadius;
    d.y = center + Math.sin(angle) * avgRadius;
    
    // Store original position for constraining movement
    d.origX = d.x;
    d.origY = d.y;
    d.origAngle = angle;
    d.categoryRadius = avgRadius;
    
    // Flag to determine if the node is being dragged
    d.isDragging = false;
  });

  // Force simulation with appropriate constraints
  const simulation = d3.forceSimulation(data)
    .velocityDecay(0.2)
    .force("charge", d3.forceManyBody().strength(-30))
    .force("collide", d3.forceCollide(60).strength(0.7))
    .force("x", d3.forceX().x(d => d.origX).strength(0.1))
    .force("y", d3.forceY().y(d => d.origY).strength(0.1))
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

  // Calculate node sizes based on connections
  data.forEach(d => {
    // Count connections
    let connectionCount = d.connections ? d.connections.length : 0;
    
    // Base radius with scaling for connections
    d.radius = 45 + Math.min(15, connectionCount * 2);
  });

  // Draw nodes
  const nodeGroup = container.selectAll("g.node-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .on("click", (event, d) => {
      if (!d.wasDragged) {
        showModal(d);
      }
      d.wasDragged = false;
    })
    .call(drag);

  // Add node circles
  nodeGroup.append("circle")
    .attr("r", d => d.radius)
    .attr("fill", d => {
      // Handle cross-category nodes with gradient
      if (d.group && d.group.includes("-")) {
        const gradientId = `grad-${d.title.replace(/[^\w]/g, "-")}`;
        
        const gradient = svg.append("defs")
          .append("linearGradient")
          .attr("id", gradientId)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "100%");
        
        const categories = d.group.split("-").map(g => {
          switch (g) {
            case "CSB": return "Conceptual & Scientific Breakthroughs";
            case "EED": return "Engineering Experiments & Demonstrations";
            case "SF": return "Sociocultural Factors";
            default: return d.category;
          }
        });
        
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
    .style("cursor", "move");

  // Add node labels
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
    .style("font-size", d => Math.max(10, Math.min(14, d.radius * 0.25)) + "px")
    .style("width", d => d.radius * 1.6 + "px")
    .style("height", d => d.radius * 1.6 + "px")
    .style("overflow", "hidden")
    .style("pointer-events", "none")
    .style("text-shadow", "0px 0px 2px rgba(0,0,0,0.8)")
    .style("color", "white")
    .html(d => `<strong>${d.title}</strong><br/><em>${d.date}</em>`);

  // -------------------------
  // 5) DRAG FUNCTIONS
  // -------------------------
  
  function dragstarted(event, d) {
    simulation.alphaTarget(0).stop();
    d.isDragging = true;
    d.wasDragged = false;
  }

  function dragged(event, d) {
    d.wasDragged = true;
    
    d.x = event.x;
    d.y = event.y;
    
    // Keep nodes within their category and roughly within their century
    applyConstraints(d);
    
    d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
    updateLinks();
  }

  function dragended(event, d) {
    d.isDragging = false;
    
    // Return to simulation with original position as target
    simulation.alphaTarget(0.1).restart();
    setTimeout(() => simulation.alphaTarget(0), 300);
  }

  // Apply constraints to keep nodes in their category and near their century
  function applyConstraints(d) {
    // Find category constraints
    const [rMin, rMax] = ringRanges[d.category] || [0, maxOuterRadius];
    
    // Calculate distance from center
    const dx = d.x - center;
    const dy = d.y - center;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // Keep within the category ring
    if (dist > 0) {
      if (dist < rMin) {
        const ratio = rMin / dist;
        d.x = center + dx * ratio;
        d.y = center + dy * ratio;
      } else if (dist > rMax) {
        const ratio = rMax / dist;
        d.x = center + dx * ratio;
        d.y = center + dy * ratio;
      }
    } else {
      d.x = center + rMin;
      d.y = center;
    }
    
    // Optional: Keep nodes roughly within their century angle
    // Find the current angle
    const currentAngle = Math.atan2(d.y - center, d.x - center);
    
    // Get the century object
    const centuryObj = centuries.find(c => c.year === d.century);
    
    // Allow movement but gently pull back toward original angle/sector
    if (centuryObj && !d.wasDragged) {
      // Find angular difference
      let angleDiff = currentAngle - d.origAngle;
      
      // Normalize to [-π, π]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // Apply gentle pull back toward original angle if far
      if (Math.abs(angleDiff) > anglePerCentury / 2) {
        const pullStrength = 0.1;
        const newAngle = currentAngle - angleDiff * pullStrength;
        const radius = Math.sqrt(dx*dx + dy*dy);
        d.x = center + Math.cos(newAngle) * radius;
        d.y = center + Math.sin(newAngle) * radius;
      }
    }
  }

  // Update link positions
  function updateLinks() {
    linkSelection
      .attr("x1", d => data[d.source].x)
      .attr("y1", d => data[d.source].y)
      .attr("x2", d => data[d.target].x)
      .attr("y2", d => data[d.target].y);
  }

  // Update positions on each simulation tick
  function ticked() {
    data.forEach(d => {
      if (!d.isDragging) {
        applyConstraints(d);
      }
    });

    updateLinks();

    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
  }

  // -------------------------
  // 6) ZOOM AND CONTROLS
  // -------------------------

  // Zoom functionality
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", event => {
      container.attr("transform", event.transform);
    });
  svg.call(zoom);

  // Connect zoom buttons
  d3.select("#zoom-in").on("click", () => {
    svg.transition().call(zoom.scaleBy, 1.2);
  });
  d3.select("#zoom-out").on("click", () => {
    svg.transition().call(zoom.scaleBy, 1/1.2);
  });

  // Add category legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(50, 50)`);
  
  categories.slice(1).forEach((cat, i) => {
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
