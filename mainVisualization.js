// (A) Convert "500s BCE" => -500, "1969" => 1969, etc.
function parseDateToNumeric(dateString) {
  // Basic check: if it has "BCE" => negative
  if (dateString.includes("BCE")) {
    // Extract digits (e.g. "500s" => 500)
    const match = dateString.match(/\d+/);
    const val = match ? parseInt(match[0], 10) : 0;
    return -val;
  } else {
    // For CE, just parse as integer
    const parsed = parseInt(dateString, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
// (B) Gather numeric years from each node
const numericDates = nodes.map(d => parseDateToNumeric(d.date));
const minYear = d3.min(numericDates);
const maxYear = d3.max(numericDates);


// ---------------------------------------
    // 2. Build a title -> index map
    // ---------------------------------------
  const data = window.timelineItems;  
const titleMap = new Map();
data.forEach((item, i) => {
  titleMap.set(item.title, i);
    });

    // ---------------------------------------
    // 3. Build nodes array
    // ---------------------------------------
    const nodes = timelineItems.map((item, i) => ({
      id: i,
      title: item.title,
      date: item.date,
      location: item.location,
      description: item.description,
      img: item.img,
      category: item.category,
      people: item.people || [],
      connections: item.connections
    }));

// (C) Scale: older => smaller radius, newer => larger
const radiusScale = d3.scaleLinear()
  .domain([minYear, maxYear]) // e.g. [-2700, 1970]
  .range([0, 600]);           // tweak outer range as desired

// (D) Our radial force
const radialForce = d3.forceRadial(
  d => {
    // for each node, parse its date
    const year = parseDateToNumeric(d.date);
    // map it to the radial scale
    return radiusScale(year);
  },
  width / 2,   // center X
  height / 2   // center Y
)
// If nodes are too locked into rings, lower strength
// If they're too loosely arranged, raise strength
.strength(0.05);

    // ---------------------------------------
    // 4. Build links array
    // ---------------------------------------
    const links = [];
    timelineItems.forEach((item, sourceIndex) => {
      item.connections.forEach(connTitle => {
        const targetIndex = titleMap.get(connTitle);
        if (targetIndex !== undefined) {
          links.push({ source: sourceIndex, target: targetIndex });
        }
      });
    });

    // ---------------------------------------
    // 5. Setup color scale by category
    // ---------------------------------------
    const colorMap = {
      "Sociocultural Factors": "#e74c3c",
      "Conceptual & Scientific Breakthroughs": "#9b59b6",
      "Engineering Experiments & Demonstrations": "#3498db"
    };

    function getCategoryColor(cat) {
      return colorMap[cat] || "#95a5a6"; 
    }

    // ---------------------------------------
    // 6. Create the SVG and tooltip
    // ---------------------------------------
    const width = 1200;
    const height = 900;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const tooltip = d3.select("#tooltip");

    // ---------------------------------------
    // 7. Create a <g> to hold links & nodes
    //    This <g> will be zoomed
    // ---------------------------------------
    const gZoom = svg.append("g")
      .attr("class", "zoom-group");

    // ---------------------------------------
    // 8. Create the force simulation
    // ---------------------------------------
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(150))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2))
  // (E) Add the radial force so older => center, newer => outward
  .force("radial", radialForce)
   .force("collide", d3.forceCollide(60)) ;


    // ---------------------------------------
    // 9. Draw links inside gZoom
    // ---------------------------------------
    const link = gZoom.selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    // ---------------------------------------
    // 10. Draw node groups (g) inside gZoom
    // ---------------------------------------
    const node = gZoom.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

    // Large circles for multi-word titles
    node.append("circle")
      .attr("r", 60)
      .attr("fill", d => getCategoryColor(d.category))
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .on("click", (event, d) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY + 10) + "px")
               .style("display", "block")
               .html(`
                 <strong>${d.title}</strong><br/>
                 <em>${d.date} — ${d.location}</em><br/><br/>
                 ${d.description}<br/><br/>
                 <strong>People:</strong> ${d.people.join(", ")}
               `);

        event.stopPropagation();
      });

    node.append("text")
      .attr("dy", "0.35em")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .text(d => d.title);

    // ---------------------------------------
    // 11. Simulation tick
    // ---------------------------------------
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // ---------------------------------------
    // 12. Add the zoom behavior to the SVG
    //     We'll limit zoom to 0.3x - 5x
    // ---------------------------------------
    const zoom = d3.zoom()
      .scaleExtent([0.3, 5])  // min, max zoom
      .on("zoom", (event) => {
        gZoom.attr("transform", event.transform);
      });

    // Attach the zoom to the SVG
    svg.call(zoom);

    // ---------------------------------------
    // 13. Hide tooltip on background click
    // ---------------------------------------
    svg.on("click", () => {
      tooltip.style("display", "none");
    });

    // ---------------------------------------
    // 14. Drag behaviors
    // ---------------------------------------
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
