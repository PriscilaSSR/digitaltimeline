document.addEventListener("DOMContentLoaded", function() {
  // -------------------------
  // 1) LOAD & SETUP
  // -------------------------
  const data = window.timelineItems;

  // Colors for each category
  const colorMap = {
    "Sociocultural Factors": 0xc62828,
    "Conceptual & Scientific Breakthroughs": 0x1565c0,
    "Engineering Experiments & Demonstrations": 0x2e7d32
  };

  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.z = 1500;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("chart").appendChild(renderer.domElement);

  // Add ambient and directional light
  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // Create orbital shells for each category
  const categories = [
    {
      name: "Engineering Experiments & Demonstrations",
      radius: 500,
      color: 0x2e7d32
    },
    {
      name: "Conceptual & Scientific Breakthroughs",
      radius: 1000,
      color: 0x1565c0
    },
    {
      name: "Sociocultural Factors",
      radius: 1500,
      color: 0xc62828
    }
  ];

  // Add orbital rings
  categories.forEach(category => {
    const ringGeometry = new THREE.TorusGeometry(category.radius, 3, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: category.color,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    
    // Add category label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    context.fillStyle = '#ffffff';
    context.font = 'Bold 60px Arial';
    context.fillText(category.name, 10, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    const label = new THREE.Sprite(labelMaterial);
    label.position.set(category.radius + 100, 100, 0);
    label.scale.set(200, 50, 1);
    scene.add(label);
  });

  // Build node objects
  const nodes = [];
  const nodeObjects = [];
  const textSprites = [];
  const nodeRadius = 25;

  // Build link data
  const titleToIndex = new Map();
  data.forEach((d, i) => {
    titleToIndex.set(d.title, i);
  });
  
  const links = [];
  data.forEach((d, i) => {
    if (!d.connections) return;
    d.connections.forEach(conn => {
      const j = titleToIndex.get(conn);
      if (j !== undefined && j > i) {
        links.push({ source: i, target: j });
      }
    });
  });

  // Create nodes in 3D space
  data.forEach((item, index) => {
    const categoryInfo = categories.find(cat => cat.name === item.category);
    if (!categoryInfo) return;
    
    // Random position on orbital shell
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI * 2;
    const radius = categoryInfo.radius;
    
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);
    
    // Create sphere for node
    const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: colorMap[item.category] || 0xffffff
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    sphere.userData = { itemIndex: index };
    scene.add(sphere);
    nodeObjects.push(sphere);
    
    // Create text label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    context.fillStyle = '#ffffff';
    context.font = '24px Arial';
    context.fillText(item.title, 10, 34);
    context.font = '18px Arial';
    context.fillText(item.date, 10, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    const label = new THREE.Sprite(labelMaterial);
    label.position.set(x, y + nodeRadius + 20, z);
    label.scale.set(100, 50, 1);
    scene.add(label);
    textSprites.push(label);
    
    // Save node data for links
    nodes.push({
      x: x,
      y: y,
      z: z,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: categoryInfo.radius,
      category: item.category
    });
  });

  // Create links between nodes
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x999999,
    transparent: true,
    opacity: 0.5 
  });
  
  links.forEach(link => {
    const sourceNode = nodes[link.source];
    const targetNode = nodes[link.target];
    
    const points = [];
    points.push(new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z));
    points.push(new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
  });

  // Add controls for orbit and zoom
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 3000;

  // Set up raycaster for interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Modal logic
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("close");
  
  function showModal(itemIndex) {
    const d = data[itemIndex];
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
  
  // Click event listener
  function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(nodeObjects);
    
    if (intersects.length > 0) {
      const itemIndex = intersects[0].object.userData.itemIndex;
      showModal(itemIndex);
    }
  }
  
  window.addEventListener('click', onMouseClick, false);
  
  // Handle window resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  window.addEventListener('resize', onWindowResize, false);
  
  // Add simple rotation animation
  const rotationSpeed = 0.0005;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    // Make labels always face the camera
    textSprites.forEach(sprite => {
      sprite.lookAt(camera.position);
    });
    
    // Slowly rotate the entire scene
    scene.rotation.y += rotationSpeed;
    
    controls.update();
    renderer.render(scene, camera);
  }
  
  animate();

  // Hook up plus/minus buttons
  d3.select("#zoom-in").on("click", () => {
    camera.position.z *= 0.8;
  });
  d3.select("#zoom-out").on("click", () => {
    camera.position.z *= 1.2;
  });
});
