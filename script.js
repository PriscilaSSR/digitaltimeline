document.addEventListener("DOMContentLoaded", function() {
  // Load data from timelineData.js
  const data = window.timelineItems;

  // Dimensions for the SVG
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;

  // Category definitions with ring intervals:
  // We'll define for each category a [innerRadius, outerRadius].
  // The node will appear randomly somewhere in that annular region.
  const ringRanges = {
    "Engineering Experiments & Demonstrations": [0, 200],
    "Conceptual & Scientific Breakthroughs": [200, 300],
    "Sociocultural Factors": [300, 400]
  };

  // Category name, color, and the outer ring radius
  // (Used for drawing the filled circles + labels)
  const categories = [
    {
      name: "Sociocultural Factors",
      outerRadius: 400,
      color: "#c62828" // red
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      outerRadius: 300,
      color: "#1565c0" // blue
    },
    {
      name: "Engineering Experiments & Demonstrations",
      outerRadius: 200,
      color: "#2e7d32" // green
    }
  ];

  // Create the main SVG
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // We’ll place everything (rings, links, nodes) into a <g> "container"
  // so we can apply zoom and pan transformations to it.
  const container = svg.append("g")
    .attr("class", "zoom-container");

  // 1) Draw each ring as a colored circle with a category label
  const ringGroups = container.selectAll("g.ring-group")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "ring-group");

  ringGroups.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", d => d.outerRadius)
    .style("fill", d => d.color)
    .style("fill-opacity", 0.1)
    .style("stroke", d => d.color)
    .style("stroke-dasharray", "3,3");

  ringGroups.append("text")
    .attr("x", centerX)
    .attr("y", d => centerY - d.outerRadius + 20)
    .text(d => d.name)
    .style("fill", d => d.color)
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .style("opacity", 0.4);

  // 2) For nodes, we create a color scale matching the ring colors
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#c62828", "#1565c0", "#2e7d32"]);

  // 3) Compute each node's (x, y) position somewhere within its ring range
  data.forEach(d => {
    const [innerR, outerR] = ringRanges[d.category] || [0, 200];
    // pick a random radius between innerR and outerR
    const r = innerR + (outerR - innerR) * Math.random();
    // random angle
    const angle = Math.random() * 2 * Math.PI;

    d.x = centerX + r * Math.cos(angle);
    d.y = centerY + r * Math.sin(angle);
  });

  // 4) Build link array from "connections"
  const titleToIndex = new Map();
  data.forEach((d, i) => {
    titleToIndex.set(d.title, i);
  });

  const links = [];
  data.forEach((d, i) => {
    if (!d.connections) return;
    d.connections.forEach(connTitle => {
      const targetIndex = titleToIndex.get(connTitle);
      if (targetIndex !== undefined && targetIndex > i) {
        links.push({ source: i, target: targetIndex });
      }
    });
  });

  // 5) Draw the links behind the nodes
  container.selectAll("line.link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", d => data[d.source].x)
    .attr("y1", d => data[d.source].y)
    .attr("x2", d => data[d.target].x)
    .attr("y2", d => data[d.target].y)
    .style("stroke", "#999")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

  // 6) Draw each node as a group <g> with:
  //    - a circle
  //    - a foreignObject for multiline text (title + date)
  // We'll make them bigger so the text is visible
  const nodeGroup = container.selectAll("g.node")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .on("click", (event, d) => showModal(d));

  // Circle background
  const circleRadius = 50; // increase radius so text can fit inside
  nodeGroup.append("circle")
    .attr("r", circleRadius)
    .attr("fill", d => colorScale(d.category))
    .style("stroke", "#333")
    .style("stroke-width", 1);

  // A small foreignObject for the text, centered in the circle.
  // We'll create a <div> for text wrapping. 
  // Using text-anchor won't help for multiline, so foreignObject is simpler.
  nodeGroup.append("foreignObject")
    .attr("x", -circleRadius * 0.8) // a bit narrower than the circle
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

  // 7) Modal logic
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

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
  window.onclick = event => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // 8) Enable zoom & pan with mouse
  const zoom = d3.zoom()
    .scaleExtent([0.3, 5])  // min & max zoom
    .on("zoom", (event) => {
      container.attr("transform", event.transform);
    });

  svg.call(zoom);

  // 9) Add plus/minus buttons to control the zoom programmatically
  const zoomControls = d3.select("body").append("div")
    .attr("id", "zoom-controls")
    .style("position", "absolute")
    .style("top", "80px")
    .style("right", "20px")
    .style("display", "flex")
    .style("flex-direction", "column");

  zoomControls.append("button")
    .text("+")
    .style("font-size", "20px")
    .style("margin-bottom", "5px")
    .on("click", () => {
      // "zoom.scaleBy" increments the scale by a factor
      svg.transition().call(zoom.scaleBy, 1.2);
    });

  zoomControls.append("button")
    .text("−")
    .style("font-size", "20px")
    .on("click", () => {
      svg.transition().call(zoom.scaleBy, 1/1.2);
    });
});
