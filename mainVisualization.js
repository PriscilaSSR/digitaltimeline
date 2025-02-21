///////////////////////////////
// 1) Define parseDateToNumeric
///////////////////////////////
function parseDateToNumeric(dateString) {
  if (!dateString) return 0;
  if (dateString.includes("BCE")) {
    const match = dateString.match(/\d+/);
    const val = match ? parseInt(match[0], 10) : 0;
    return -val;  
  } else {
    const parsed = parseInt(dateString, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}

///////////////////////////////
// 2) Define wrapText
///////////////////////////////
function wrapText(selection, maxWidth) {
  selection.each(function() {
    const textEl = d3.select(this);
    const words = textEl.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.2; // em
    const x = 0;
    const y = 0;
    const dy = 0;

    textEl.text(null);

    let tspan = textEl.append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > maxWidth) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textEl.append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + "em")
          .text(word);
      }
    }
  });
}

///////////////////////////////
// 3) Get Data from timelineItems
///////////////////////////////
const data = window.timelineItems;

///////////////////////////////
// 4) Build title->index map
///////////////////////////////
const titleMap = new Map();
data.forEach((item, i) => {
  titleMap.set(item.title, i);
});

///////////////////////////////
// 5) Build nodes array
///////////////////////////////
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

///////////////////////////////
// 6) Build links array
///////////////////////////////
const links = [];
data.forEach((item, sourceIndex) => {
  item.connections.forEach(connTitle => {
    const targetIndex = titleMap.get(connTitle);
    if (targetIndex !== undefined) {
      links.push({ source: sourceIndex, target: targetIndex });
    }
  });
});

///////////////////////////////
// 7) Prepare numericDates
///////////////////////////////
const numericDates = nodes.map(d => parseDateToNumeric(d.date));
const minYear = d3.min(numericDates);
const maxYear = d3.max(numericDates);

// Radial scale
const radiusScale = d3.scaleLinear()
  .domain([minYear, maxYear])
  .range([0, 600]);

// Radial force
const radialForce = d3.forceRadial(
  d => radiusScale(parseDateToNumeric(d.date)),
  600, // x-center for radial (since 1200 wide -> 600 is center)
  450  // y-center for radial (since 900 tall -> 450 is center)
).strength(0.05);

///////////////////////////////
// 8) Color mapping
///////////////////////////////
const colorMap = {
  "Sociocultural Factors": "#e74c3c",
  "Conceptual & Scientific Breakthroughs": "#9b59b6",
  "Engineering Experiments & Demonstrations": "#3498db"
};
function getCategoryColor(cat) {
  return colorMap[cat] || "#95a5a6";
}

///////////////////////////////
// 9) Define width, height
///////////////////////////////
const width = 1200;
const height = 900;

///////////////////////////////
// 10) Create the SVG
///////////////////////////////
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

///////////////////////////////
// IMPORTANT: Define defs AFTER svg is created
///////////////////////////////
const defs = svg.append("defs");

// Drop shadow filter
const filter = defs.append("filter")
  .attr("id", "dropShadow");
filter.append("feGaussianBlur")
  .attr("in", "SourceAlpha")
  .attr("stdDeviation", 4)
  .attr("result", "blur");
filter.append("feOffset")
  .attr("in", "blur")
  .attr("dx", 4)
  .attr("dy", 4)
  .attr("result", "offsetBlur");
const feMerge = filter.append("feMerge");
feMerge.append("feMergeNode").attr("in", "offsetBlur");
feMerge.append("feMergeNode").attr("in", "SourceGraphic");

const tooltip = d3.select("#tooltip");

///////////////////////////////
// 11) Create a <g> for zoom/pan
///////////////////////////////
const gZoom = svg.append("g")
  .attr("class", "zoom-group");

///////////////////////////////
// 12) Create force simulation
///////////////////////////////
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(150))
  .force("charge", d3.forceManyBody().strength(-300))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("radial", radialForce)
  .force("collide", d3.forceCollide(80)); // circle radius 180 => might need more collision

///////////////////////////////
// 13) Draw links
///////////////////////////////
const link = gZoom.selectAll(".link")
  .data(links)
  .enter()
  .append("line")
  .attr("class", "link")
  .attr("stroke", "#999")
  .attr("stroke-width", 2);

///////////////////////////////
// 14) Draw nodes
///////////////////////////////
const node = gZoom.selectAll(".node")
  .data(nodes)
  .enter()
  .append("g")
  .attr("class", "node")
  .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

// Circle
node.append("circle")
  .attr("r", 100)    // big circles => might overlap a lot
  .style("filter", "url(#dropShadow)")  // apply drop shadow
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

// Wrapped text
node.append("text")
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("pointer-events", "none")
  .text(d => d.title)
  // You might want to allow more width, e.g. diameter - some padding
  .call(wrapText, 50);  // if r=180 => diameter=360 => let's try 300 or so

///////////////////////////////
// 15) Ticking
///////////////////////////////
simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("transform", d => `translate(${d.x},${d.y})`);
});

///////////////////////////////
// 16) Zoom behavior
///////////////////////////////
const zoom = d3.zoom()
  .scaleExtent([0.3, 5])
  .on("zoom", (event) => {
    gZoom.attr("transform", event.transform);
  });
svg.call(zoom);

///////////////////////////////
// 17) Hide tooltip on background click
///////////////////////////////
svg.on("click", () => {
  tooltip.style("display", "none");
});

///////////////////////////////
// 18) Drag behaviors
///////////////////////////////
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
