document.addEventListener('DOMContentLoaded', () => {
    const svgObject = document.getElementById('timeline-svg');
    const nodeDetails = document.getElementById('node-details');
    const detailsContent = document.getElementById('details-content');

    svgObject.addEventListener('load', () => {
        const svgDoc = svgObject.contentDocument;

        // Access your timeline items
        const timelineItems = window.timelineItems;

        // Create nodes based on timeline items
        timelineItems.forEach((item, index) => {
            // Determine node position (you'll need to map dates to coordinates)
            const { cx, cy } = getNodeCoordinates(item.date); // Implement getNodeCoordinates

            if (cx && cy) { // Only create node if coordinates are available
                const nodeElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                nodeElement.setAttribute("id", `node-${index}`);
                nodeElement.setAttribute("cx", cx);
                nodeElement.setAttribute("cy", cy);
                nodeElement.setAttribute("r", 10);
                nodeElement.setAttribute("fill", "rgba(255, 0, 0, 0.7)");
                nodeElement.style.cursor = "pointer";

                nodeElement.addEventListener('click', () => {
                    showNodeDetails(item);
                });

                svgDoc.documentElement.appendChild(nodeElement);
            }
        });
    });

    function showNodeDetails(item) {
        let detailsHTML = `<h3>${item.title}</h3>`;
        if (item.date) detailsHTML += `<p><strong>Date:</strong> ${item.date}</p>`;
        if (item.location) detailsHTML += `<p><strong>Location:</strong> ${item.location}</p>`;
        if (item.description) detailsHTML += `<p>${item.description}</p>`;
        detailsContent.innerHTML = detailsHTML;
        nodeDetails.style.display = 'block';
    }

    // Function to map dates to node coordinates (you'll need to implement this)
    function getNodeCoordinates(date) {
        // Implement logic to map dates to cx and cy coordinates within the SVG
        // This will depend on the layout of your timeline.
        // Example (replace with your actual logic):
        if (date.startsWith('500s BCE')) {
            return { cx: 50, cy: 100 };
        } else if (date === '1783') {
            return { cx: 400, cy: 150 };
        }
        // ... add more mappings
        return {}; // Return empty object if no mapping found
    }
});
