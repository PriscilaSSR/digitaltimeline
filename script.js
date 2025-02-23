document.addEventListener("DOMContentLoaded", function() {
  // 1) Load data from timelineData.js
  const data = window.timelineItems;

  // 2) Dimensions for the SVG
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;

  // 3) We define each category’s ring radius and color
  //    (largest ring first, so it’s behind)
  const categories = [
    {
      name: "Sociocultural Factors",
      radius: 400,
      color: "#c62828" // red
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      radius: 300,
      color: "#1565c0" // blue
    },
    {
      name: "Engineering Experiments & Demonstrations",
      radius: 200,
      color: "#2e7d32" // green
    }
  ];

  // 4) Create an SVG
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 5) Draw each ring as a colored circle + label
  //    We do this first (behind nodes & links)
  const ringGroups = svg.selectAll("g.ring-group")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "ring-group");

  // Add the colored circle for each ring
  ringGroups.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", d => d.radius)
    .style("fill", d => d.color)
    .style("fill-opacity", 0.1)  // translucent so lines/nodes show on top
    .style("stroke", d => d.color)
    .style("stroke-dasharray", "3,3");

  // Add the text label near the top of each ring
  ringGroups.append("text")
    .attr("x", centerX)
    .attr("y", d => centerY - d.radius + 20) // 20px below ring top
    .text(d => d.name)
    .style("fill", d => d.color)
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .style("opacity", 0.4); // behind the nodes

  // 6) Create a color scale that matches the ring colors above
  //    so nodes share the same colors
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#c62828", "#1565c0", "#2e7d32"]);

  // 7) Map each category to the ring radius
  const radiusMap = {
    "Sociocultural Factors": 400,
    "Conceptual & Scientific Breakthroughs": 300,
    "Engineering Experiments & Demonstrations": 200
  };

  // 8) Compute each node’s x,y position in its ring
  data.forEach(d => {
    const angle = Math.random() * 2 * Math.PI; // random angle
    const r = radiusMap[d.category] || 200;    // fallback
    d.x = centerX + r * Math.cos(angle);
    d.y = centerY + r * Math.sin(angle);
  });

  // 9) Build a map from title -> index for easy “connections” lookup
  const titleToIndex = new Map();
  data.forEach((d, i) => {
    titleToIndex.set(d.title, i);
  });

  // 10) Build an array of links from the "connections" field
  const links = [];
  data.forEach((d, i) => {
    if (!d.connections) return;
    d.connections.forEach(connTitle => {
      const targetIndex = titleToIndex.get(connTitle);
      // only add link if the target index is valid and bigger, to avoid duplicates
      if (targetIndex !== undefined && targetIndex > i) {
        links.push({ source: i, target: targetIndex });
      }
    });
  });

  // 11) Draw the links (behind the nodes)
  svg.selectAll("line.link")
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

  // 12) Draw the nodes on top
  svg.selectAll(".node")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 6)
    .attr("fill", d => colorScale(d.category))
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .on("click", (event, d) => {
      showModal(d);
    });

  // 13) Modal logic
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
});
