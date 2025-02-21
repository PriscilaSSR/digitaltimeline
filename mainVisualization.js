// 1) Define parseDateToNumeric (for "500s BCE" -> -500, "1969" -> 1969, etc.)
function parseDateToNumeric(dateString) {
  if (!dateString) return 0; // fallback if missing
  if (dateString.includes("BCE")) {
    // e.g. "500s" => 500
    const match = dateString.match(/\d+/);
    const val = match ? parseInt(match[0], 10) : 0;
    return -val;  // negative means older
  } else {
    const parsed = parseInt(dateString, 10);
    return isNaN(parsed) ? 0 : parsed;  // fallback to 0 if it fails
  }
}

// 2) Grab data from window.timelineItems
const data = window.timelineItems;  

// 3) Build a title -> index map
const titleMap = new Map();
data.forEach((item, i) => {
  titleMap.set(item.title, i);
});

// 4) Build nodes array (MUST happen before numericDates!)
const nodes = data.map((item, i) => ({
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

// 5) Build links array
const links = [];
data.forEach((item, sourceIndex) => {
  item.connections.forEach(connTitle => {
    const targetIndex = titleMap.get(connTitle);
    if (targetIndex !== undefined) {
      links.push({ source: sourceIndex, target: targetIndex });
    }
  });
});

// 6) Prepare numericDates AFTER nodes is defined
const numericDates = nodes.map(d => parseDateToNumeric(d.date));
const minYear = d3.min(numericDates);
const maxYear = d3.max(numericDates);

// 7) Create the radial scale (older => smaller, newer => bigger)
const radiusScale = d3.scaleLinear()
  .domain([minYear, maxYear])
  .range([0, 600]); // Tweak outer range as you like

// 8) Create the radial force (pull older nodes to center, newer outward)
const radialForce = d3.forceRadial(
  d => radiusScale(parseDateToNumeric(d.date)),  // radius accessor
  // Center X/Y
  600, // or width / 2; we define it after we set width below
  450  // or height / 2
)
.strength(0.05);  // Tweak to taste

// 9) Setup color by category
const colorMap = {
  "Sociocultural Factors": "#e74c3c",
  "Conceptual & Scientific Breakthroughs": "#9b59b6",
  "Engineering Experiments & Demonstrations": "#3498db"
};
function getCategoryColor(cat) {
  return colorMap[cat] || "#95a5a6"; 
}

// 10) Now define width, height, and create SVG
const width = 1200;
const height = 900;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

// 11) A <g> for zoom/pan
const gZoom = svg.append("g")
  .attr("class", "zoom-group");

// 12) Finally create your simulation
// Note the radialForce and collision added here
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(150))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("radial", radialForce)
  .force("collide", d3.forceCollide(60));

// 13) Draw links
const link = gZoom.selectAll(".link")
  .data(links)
  .enter()
  .append("line")
  .attr("class", "link")
  .attr("stroke", "#999")
  .attr("stroke-width", 2);

// 14) Draw nodes
const node = gZoom.selectAll(".node")
  .data(nodes)
  .enter()
  .append("g")
  .attr("class", "node")
  .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

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

// 15) On simulation tick, update positions
simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("transform", d => `translate(${d.x},${d.y})`);
});

// 16) Add zoom behavior
const zoom = d3.zoom()
  .scaleExtent([0.3, 5])
  .on("zoom", (event) => {
    gZoom.attr("transform", event.transform);
  });
svg.call(zoom);

// 17) Hide tooltip on background click
svg.on("click", () => {
  tooltip.style("display", "none");
});

// 18) Drag behaviors
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
