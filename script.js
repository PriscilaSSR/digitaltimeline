document.addEventListener("DOMContentLoaded", function() {
  // 1) Load data from timelineData.js
  const data = window.timelineItems;

  // 2) Dimensions for the SVG
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;

  // 3) Radii for each ring by category
  const radiusMap = {
    "Engineering Experiments & Demonstrations": 200,
    "Conceptual & Scientific Breakthroughs": 300,
    "Sociocultural Factors": 400
  };

  // 4) Create an SVG
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Draw the three concentric circles for reference
  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", 200)
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-dasharray", "4,2");

  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", 300)
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-dasharray", "4,2");

  svg.append("circle")
    .attr("cx", centerX)
    .attr("cy", centerY)
    .attr("r", 400)
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-dasharray", "4,2");

  // 5) Color scale for the nodes
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#d95f02", "#7570b3", "#1b9e77"]);

  // 6) FIRST, compute each node’s x,y position so we can use it for the links
  data.forEach(d => {
    const angle = Math.random() * 2 * Math.PI;      // random angle
    d.angle = angle;                                // store angle if needed
    const r = radiusMap[d.category] || 200;         // fallback radius
    d.x = centerX + r * Math.cos(angle);            // store x in data
    d.y = centerY + r * Math.sin(angle);            // store y in data
  });

  // 7) Create a map from title -> index, for easy lookup
  const titleToIndex = new Map();
  data.forEach((d, i) => {
    titleToIndex.set(d.title, i);
  });

  // 8) Build an array of links
  //    Each link = { source: indexOfSource, target: indexOfTarget }
  //    To avoid duplicates (A->B & B->A), only add link if targetIndex > sourceIndex
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

  // 9) Draw the links FIRST (so they’re behind the nodes)
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

  // 10) Draw the node circles on top
  svg.selectAll(".node")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 6)
    .attr("fill", d => colorScale(d.category))
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .on("click", function(event, d) {
      showModal(d);
    });

  // 11) Modal logic
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

  closeBtn.onclick = function() {
    modal.style.display = "none";
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
});
