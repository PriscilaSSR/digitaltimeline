// script.js

document.addEventListener("DOMContentLoaded", function() {
  // Data is loaded from timelineData.js
  const data = window.timelineItems;

  // Dimensions for the SVG
  const width = 800;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;

  // Radii for each category ring
  // Inner ring (Engineering), middle ring (Conceptual), outer ring (Sociocultural)
  const radiusMap = {
    "Engineering Experiments & Demonstrations": 200,
    "Conceptual & Scientific Breakthroughs": 300,
    "Sociocultural Factors": 400
  };

  // Create an SVG
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Draw 3 concentric circles just for reference
  // (So the user can visually see there's an inner ring, a middle ring, and an outer ring)
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

  // Color scale for the nodes, if desired
  const colorScale = d3.scaleOrdinal()
    .domain(["Sociocultural Factors", "Conceptual & Scientific Breakthroughs", "Engineering Experiments & Demonstrations"])
    .range(["#d95f02", "#7570b3", "#1b9e77"]);

  // Create a selection for all nodes
  svg.selectAll(".node")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 6)
    .attr("fill", d => colorScale(d.category))
    .attr("cx", d => {
      const angle = Math.random() * 2 * Math.PI; // random angle
      d.angle = angle; // store for later usage if needed
      const r = radiusMap[d.category] || 200;   // default if missing
      return centerX + r * Math.cos(angle);
    })
    .attr("cy", d => {
      const r = radiusMap[d.category] || 200;
      return centerY + r * Math.sin(d.angle);
    })
    .on("click", function(event, d) {
      showModal(d);
    });

  // Modal logic
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("close");

  // Show the popup with data
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

  // Hide the popup
  closeBtn.onclick = function() {
    modal.style.display = "none";
  };

  // If user clicks anywhere outside the modal content, close
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
});
