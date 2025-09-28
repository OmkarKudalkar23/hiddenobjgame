var camera, scene, raycaster, renderer;

var mouse = new THREE.Vector2(),
  INTERSECTED;
var radius = 100,
  theta = 0;

var isUserInteracting = false,
  onMouseDownMouseX = 0,
  onMouseDownMouseY = 0,
  lon = 0,
  onMouseDownLon = 0,
  lat = 0,
  onMouseDownLat = 0,
  phi = 0,
  theta = 0,
  mouse,
  zero = {},
  raycaster,
  curentName,
  flagResetColor = false,
  windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2,
  targetRotation = 0,
  joystick,
  touchSelect = true,
  setST,
  listOfItems = [],
  loadCompliat = false,
  itemDelited = false,
  obj,
  // Game state
  gameInitialized = false,
  score = 0,
  currentIndex = 0,
  targets = [],
  clueMap = {},
  ui = {},
  // Click vs drag detection
  mouseDownX = 0,
  mouseDownY = 0,
  isDragging = false;

init();
animate();

function init() {

  var container, mesh;

  container = document.getElementById('container');

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  camera.target = new THREE.Vector3(0, 0, 0);

  scene = new THREE.Scene();

  var geometry = new THREE.SphereGeometry(600, 60, 40);
  geometry.scale(-1, 1, 1);

  var material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('assets/bg.jpg')
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'backGround';
  scene.add(mesh);

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  var clock = new THREE.Clock();

  joystick = new VirtualJoystick({
    mouseSupport: true,
    stationaryBase: false,
    strokeStyle: 'grey',
    baseX: 100,
    baseY: 150,
    limitStickTravel: true,
    stickRadius: 45
  });

  var frameTime = 0;

  animate();

  function animate() {

    requestAnimationFrame(animate);
    frameTime = clock.getDelta();

    onPointerDownLon = lon;
    onPointerDownLat = lat;

    if (joystick.right()) {
      lon = onPointerDownLon + 60 * frameTime;
    }
    if (joystick.left()) {
      lon = onPointerDownLon - 60 * frameTime;
    }
    if (joystick.up()) {
      lat = onPointerDownLat + 60 * frameTime;
    }
    if (joystick.down()) {
      lat = onPointerDownLat - 60 * frameTime;
    }
  }

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);
  document.addEventListener('wheel', onDocumentMouseWheel, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  document.addEventListener('touchend', onDocumentTouchEnd, false);
  window.addEventListener('resize', onWindowResize, false);

  // Cache UI elements
  ui.clueBar = document.getElementById('clueBar');
  ui.scoreValue = document.getElementById('scoreValue');
  ui.scoreFlash = document.getElementById('scoreFlash');
  ui.endOverlay = document.getElementById('endOverlay');
  ui.finalScore = document.getElementById('finalScore');
  ui.restartBtn = document.getElementById('restartBtn');
  if (ui.restartBtn) {
    ui.restartBtn.addEventListener('click', function () {
      restartGame();
    });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  
  isUserInteracting = true;
  isDragging = false;

  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;
}

function onDocumentTouchStart(event) {
  event.preventDefault();

  mouseDownX = event.touches[0].clientX;
  mouseDownY = event.touches[0].clientY;
  onPointerDownPointerX = event.touches[0].clientX;
  onPointerDownPointerY = event.touches[0].clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;
  isDragging = false;
}

function onDocumentTouchMove(event) {
  if (event.touches.length > 0) {
    var deltaX = Math.abs(event.touches[0].clientX - mouseDownX);
    var deltaY = Math.abs(event.touches[0].clientY - mouseDownY);
    // If touch moved more than 5 pixels, consider it a drag
    if (deltaX > 5 || deltaY > 5) {
      isDragging = true;
    }
  }
}

function onDocumentTouchEnd(event) {
  if (!isDragging) {
    // This was a tap, not a drag - handle selection
    mouse.x = (onPointerDownPointerX / window.innerWidth) * 2 - 1;
    mouse.y = -(onPointerDownPointerY / window.innerHeight) * 2 + 1;
    handleSelection();
  }
  isDragging = false;
}

function onDocumentMouseMove(event) {

  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (isUserInteracting) {
    var deltaX = Math.abs(event.clientX - mouseDownX);
    var deltaY = Math.abs(event.clientY - mouseDownY);
    // If mouse moved more than 5 pixels, consider it a drag
    if (deltaX > 5 || deltaY > 5) {
      isDragging = true;
    }
  }
}

function onDocumentMouseUp(event) {
  if (isUserInteracting && !isDragging) {
    // This was a click, not a drag - handle selection
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    handleSelection();
  }
  isUserInteracting = false;
  isDragging = false;
}

function onDocumentMouseWheel(event) {
  if (camera.fov + event.deltaY * 0.05 <= 90) {
    camera.fov += event.deltaY * 0.05;
    camera.updateProjectionMatrix();
  }
}


function animate() {

  requestAnimationFrame(animate);
  render();
  update();
}

function update() {
  // Lazy init when items are loaded
  if (loadCompliat && !gameInitialized) {
    setupGame();
  }
  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.Math.degToRad(90 - lat);
  theta = THREE.Math.degToRad(lon);

  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
  camera.target.y = 500 * Math.cos(phi);
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(camera.target);

  renderer.render(scene, camera);
}

// ===== Game Logic =====
function setupGame() {
  // Define targets and clues. Order matters.
  targets = [
    'Candlestick','Vase','Rake','Telepfone','Oil Lamp','Horse','Spider','Group','Teapot','Wood',
    'Clock','Bucket','Book','Lamp','Teddy','Bat','Ball','Poster','Old clock','Old frame','Frame','Cup','Lock'
  ];

  clueMap = {
    'Candlestick': 'Wax tears frozen in brass, I’ve watched long nights burn away.',
    'Vase': 'Hollow throat of clay, once sipped the scent of dead flowers.',
    'Rake': 'Iron fingers by the hearth, forever combing ashes for bones.',
    'Telepfone': 'A distant voice entombed in wires, ringing after the caller is gone.',
    'Oil Lamp': 'Glass belly and metal spine, I drink oil to birth a timid flame.',
    'Horse': 'Silent steed of wood, gallops only in memories.',
    'Spider': 'Threads of silence spun thin, a widow’s veil in the corner.',
    'Group': 'Faces gather but never speak, captured mid-whisper.',
    'Teapot': 'Porcelain throat pours warmth, now cold as the grave.',
    'Wood': 'Splinters of yesterday’s forest, sleeping by the fire’s ghost.',
    'Clock': 'I count the heartbeats of walls, yet my hands seldom move.',
    'Bucket': 'A mouth with a metal grin, thirsty for the well’s secrets.',
    'Book': 'Leather skin and paper bones, whispering learned curses.',
    'Lamp': 'A blind eye on the ceiling, once blinking with light.',
    'Teddy': 'A child’s guardian, stitched with forgotten lullabies.',
    'Bat': 'Night’s folded dagger, hanging from dark rafters.',
    'Ball': 'Round as a moon, chased by footsteps that no longer echo.',
    'Poster': 'A paper window to elsewhere, stained by time’s breath.',
    'Old clock': 'An elder of ticking halls, hoarding minutes like gold.',
    'Old frame': 'A wooden ring for ghosts, holding what is missing.',
    'Frame': 'Gilded teeth bite the wall, refusing to let go of memories.',
    'Cup': 'A small chalice of warmth, now sipping only dust.',
    'Lock': 'Iron secret-keeper, smiling without a key.'
  };

  // Ensure all targets exist and are visible
  scene.children.forEach(function (o) {
    if (o && o.name && o.name !== 'backGround') {
      o.visible = true;
    }
  });

  score = 0;
  currentIndex = 0;
  gameInitialized = true;
  updateScore(0);
  showClue(currentTargetName());
}

function currentTargetName() {
  return targets[currentIndex];
}

function showClue(name) {
  if (!ui.clueBar) return;
  var text = clueMap[name] || ('Find: ' + name);
  ui.clueBar.classList.remove('fade-out');
  ui.clueBar.classList.add('fade-in');
  ui.clueBar.textContent = text;
}

function nextClue() {
  currentIndex++;
  if (currentIndex >= targets.length) {
    endGame();
    return;
  }
  if (!ui.clueBar) return;
  ui.clueBar.classList.remove('fade-in');
  ui.clueBar.classList.add('fade-in');
  ui.clueBar.textContent = clueMap[currentTargetName()] || ('Find: ' + currentTargetName());
}

function updateScore(delta) {
  score += delta;
  if (ui.scoreValue) ui.scoreValue.textContent = String(score);
  if (ui.scoreFlash && delta !== 0) {
    ui.scoreFlash.textContent = (delta > 0 ? '+' : '') + delta;
    ui.scoreFlash.className = delta > 0 ? 'flash-green' : 'flash-red';
    // Clear after animation ends
    setTimeout(function(){ if (ui.scoreFlash) { ui.scoreFlash.textContent = ''; ui.scoreFlash.className=''; } }, 750);
  }
}

function endGame() {
  if (ui.finalScore) ui.finalScore.textContent = String(score);
  if (ui.endOverlay) ui.endOverlay.classList.remove('hidden');
}

function restartGame() {
  // Reset object visibility
  scene.children.forEach(function (o) {
    if (o && o.name && o.name !== 'backGround') {
      o.visible = true;
    }
  });
  if (ui.endOverlay) ui.endOverlay.classList.add('hidden');
  score = 0;
  currentIndex = 0;
  updateScore(0);
  showClue(currentTargetName());
}

function handleSelection() {
  if (!gameInitialized) return;
  // Compute intersections ignoring background
  var intersects = raycaster.intersectObjects(scene.children, true).filter(function (hit) { return hit.object && hit.object.name !== 'backGround'; });
  var hitObj = intersects.length > 0 ? intersects[0].object : null;

  if (!hitObj || !hitObj.visible) {
    // Empty space or already found
    updateScore(-5);
    return;
  }

  var expected = currentTargetName();
  if (hitObj.name === expected) {
    hitObj.visible = false;
    updateScore(+10);
    if (ui.clueBar) {
      ui.clueBar.classList.remove('fade-in');
      ui.clueBar.classList.add('fade-out');
      setTimeout(function(){ nextClue(); }, 300);
    } else {
      nextClue();
    }
  } else {
    updateScore(-5);
  }
}

function render() {
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length === 1 && flagResetColor && touchSelect) {
    scene.children.forEach(function(elem) {
      if (elem.name === curentName && elem.name !== 'backGround') {
        elem.material.color.r = 1;
      }
    });
  }

  if (intersects.length >= 1 && intersects.length < 2) {

    if (INTERSECTED !== intersects[0].object && touchSelect) {
      if (INTERSECTED) {
        if (intersects[0].object.name !== 'backGround') {
          curentName = intersects[0].object.name;
          flagResetColor = true;
        }
      }

      INTERSECTED = intersects[0].object;
    }
  } else {
    INTERSECTED = null;
  }

  renderer.render(scene, camera);
}
