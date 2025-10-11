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
  // Multi-room system
  currentRoom = 0,
  rooms = [],
  doorObject = null,
  isTransitioning = false,
  roomsUnlocked = 1, // Only first room unlocked initially
  roomScores = [], // Track score for each room
  totalScore = 0,
  // Click vs drag detection
  mouseDownX = 0,
  mouseDownY = 0,
  isDragging = false,
  // Audio
  correctSound = null,
  wrongSound = null,
  backgroundMusic = null,
  audioEnabled = true,
  // Jumpscare
  jumpscareTimer = null,
  jumpscareTriggered = false,
  gameStartTime = null,
  roomTimer = null,
  roomTimeLimit = 300000, // 5 minutes in milliseconds
  roomStartTime = null,
  roomTimeRemaining = 0;

console.log('🔧 Starting game initialization...');
console.log('THREE.js available:', typeof THREE !== 'undefined');
console.log('VirtualJoystick available:', typeof VirtualJoystick !== 'undefined');
console.log('DPad available:', typeof DPad !== 'undefined');

try {
  init();
  animate();
  console.log('✅ Init and animate called successfully');
} catch (error) {
  console.error('❌ Error during initialization:', error);
}

function init() {
  console.log('🚀 Initializing 3D scene...');

  var container, mesh;

  container = document.getElementById('container');
  console.log('Container element found:', !!container);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
  camera.position.set(0, 0, 0); // Ensure camera is at center
  camera.target = new THREE.Vector3(0, 0, 0);
  console.log('📷 Camera created at position:', camera.position);
  console.log('📷 Camera target:', camera.target);

  scene = new THREE.Scene();

  var geometry = new THREE.SphereGeometry(600, 60, 40);
  geometry.scale(-1, 1, 1);

  // Create mesh with NO texture initially - loadRoom() will set it
  var material = new THREE.MeshBasicMaterial({
    color: 0x333333, // Dark gray instead of black for better debugging
    side: THREE.DoubleSide // Show material on both sides for debugging
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'backGround';
  scene.add(mesh);
  
  console.log('Background mesh created, loading initial texture...');
  
  // Load initial background immediately (Room 0 background)
  var initialLoader = new THREE.TextureLoader();
  initialLoader.load(
    'assets/bg.jpg',
    function(texture) {
      console.log('✅ Initial background loaded successfully');
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      mesh.material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      mesh.material.needsUpdate = true;
      
      // Force immediate render
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      console.log('✅ Initial background applied to mesh and rendered');
    },
    function(progress) {
      console.log('initial texture loading:', Math.round((progress.loaded / progress.total) * 100) + '%');
    },
    function(error) {
      console.error('❌ Failed to load initial background:', error);
    }
  );

  raycaster = new THREE.Raycaster();
  // Increase the threshold for easier clicking on objects
  raycaster.params.Points.threshold = 50;
  raycaster.params.Line.threshold = 50;

  renderer = new THREE.WebGLRenderer();
  console.log('✅ WebGL Renderer created');
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log('✅ Renderer size set:', window.innerWidth, 'x', window.innerHeight);
  container.appendChild(renderer.domElement);
  console.log('✅ Renderer canvas added to container');

  var clock = new THREE.Clock();

  // Initialize D-Pad controller
  joystick = new DPad({
    container: document.body,
    position: 'bottom-right',
    size: 150,
    offset: 20
  });
  console.log('✅ D-Pad controller initialized');

  var frameTime = 0;
  var dpadRotationSpeed = 100; // Degrees per second

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
  ui.backToMenuBtn = document.getElementById('backToMenuBtn');
  ui.backToMenuFromEndBtn = document.getElementById('backToMenuFromEndBtn');
  ui.muteBtn = document.getElementById('muteBtn');
  ui.jumpscareOverlay = document.getElementById('jumpscareOverlay');
  ui.jumpscareVideo = document.getElementById('jumpscareVideo');
  ui.roomProgress = document.getElementById('roomProgress');
  ui.doorTransitionOverlay = document.getElementById('doorTransitionOverlay');
  ui.doorTransitionVideo = document.getElementById('doorTransitionVideo');
  ui.timerDisplay = document.getElementById('timerDisplay');
  
  if (ui.restartBtn) {
    ui.restartBtn.addEventListener('click', function () {
      restartGame();
    });
  }
  
  if (ui.backToMenuBtn) {
    ui.backToMenuBtn.addEventListener('click', function () {
      stopBackgroundMusic();
      window.location.href = 'landing.html';
    });
  }
  
  if (ui.backToMenuFromEndBtn) {
    ui.backToMenuFromEndBtn.addEventListener('click', function () {
      stopBackgroundMusic();
      window.location.href = 'landing.html';
    });
  }
  
  if (ui.muteBtn) {
    ui.muteBtn.addEventListener('click', function () {
      toggleMute();
    });
  }

  // Initialize audio
  initAudio();
  
  // Enable video playback after first user interaction
  enableVideoPlayback();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
  // Check if click is on D-pad - if so, don't start camera interaction
  var target = event.target;
  var isDPadClick = target.closest('.dpad-container') || target.closest('.dpad-button');
  
  if (isDPadClick) {
    return; // Don't start camera drag on D-pad
  }
  
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
  // Check if touch is on D-pad - if so, don't start camera interaction
  var target = event.target;
  var isDPadTouch = target.closest('.dpad-container') || target.closest('.dpad-button');
  
  if (isDPadTouch) {
    return; // Don't start camera drag on D-pad
  }
  
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
    // Check if touch was on UI elements (buttons, overlays, D-pad, etc.)
    var target = event.target;
    var isUIElement = target.tagName === 'BUTTON' || 
                     target.closest('button') || 
                     target.closest('.ui-element') ||
                     target.closest('#muteBtn') ||
                     target.closest('#restartBtn') ||
                     target.closest('#backToMenuBtn') ||
                     target.closest('#backToMenuFromEndBtn') ||
                     target.closest('.dpad-container') ||
                     target.closest('.dpad-button');
    
    if (!isUIElement) {
      // This was a tap on the game area, not a UI element - handle selection
      mouse.x = (onPointerDownPointerX / window.innerWidth) * 2 - 1;
      mouse.y = -(onPointerDownPointerY / window.innerHeight) * 2 + 1;
      handleSelection();
    }
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
    // Check if click was on UI elements (buttons, overlays, D-pad, etc.)
    var target = event.target;
    var isUIElement = target.tagName === 'BUTTON' || 
                     target.closest('button') || 
                     target.closest('.ui-element') ||
                     target.closest('#muteBtn') ||
                     target.closest('#restartBtn') ||
                     target.closest('#backToMenuBtn') ||
                     target.closest('#backToMenuFromEndBtn') ||
                     target.closest('.dpad-container') ||
                     target.closest('.dpad-button');
    
    if (!isUIElement) {
      // This was a click on the game area, not a UI element - handle selection
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      handleSelection();
    }
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
    console.log('Items loaded, initializing game...');
    setupGame();
  } else if (!loadCompliat) {
    // Debug: Check if items are still loading
    console.log('Waiting for items to load... loadCompliat:', loadCompliat);
  }
  
  // D-Pad controls for camera rotation
  var rotationSpeed = 1.0; // Degrees per frame (reduced for smoother control)
  if (joystick) {
    if (joystick.right()) {
      lon += rotationSpeed;
    }
    if (joystick.left()) {
      lon -= rotationSpeed;
    }
    if (joystick.up()) {
      lat += rotationSpeed;
    }
    if (joystick.down()) {
      lat -= rotationSpeed;
    }
  }
  
  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.Math.degToRad(90 - lat);
  theta = THREE.Math.degToRad(lon);
  camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
  camera.target.y = 500 * Math.cos(phi);
  camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(camera.target);

  // Debug: Check if renderer is working
  if (!renderer) {
    console.error('❌ Renderer not initialized!');
    return;
  }
  
  renderer.render(scene, camera);
}

// ===== Game Logic =====
function setupGame() {
  console.log('=== setupGame() called ===');
  
  // Define rooms with their backgrounds and objects
  rooms = [
    {
      name: 'The Entrance Hall',
      background: 'assets/bg.jpg',
      objects: ['Cross', 'Candlestick', 'Oil Lamp'], // Real objects that give points
      fakeObjects: ['Vase', 'Rake', 'Telepfone', 'Old frame', 'Bulb1', 'Bulb2'], // Fake objects that are visible but don't give points
      doorPosition: { x: 0, y: -50, z: -250 },
      doorRotation: { x: 0, y: 0, z: 0 }
    },
    {
      name: 'The Living Room',
      background: 'assets/bg8.jpg',
      objects: ['Spider', 'Wig'], // Real objects that give points
      fakeObjects: ['Group', 'Teapot', 'Wood'], // Fake objects that are visible but don't give points
      doorPosition: { x: 200, y: -80, z: -200 },
      doorRotation: { x: 0, y: -0.5, z: 0 }
    },
    {
      name: 'The Study',
      background: 'assets/bg9.jpg',
      objects: ['Clock', 'Lamp', 'Specs'], // Real objects that give points
      fakeObjects: ['Bucket', 'Book'], // Fake objects that are visible but don't give points
      doorPosition: { x: -150, y: -60, z: -220 },
      doorRotation: { x: 0, y: 0.3, z: 0 }
    },
    {
      name: 'The Attic',
      background: 'assets/bg4.jpg',
      objects: ['Haunted Painting', 'Hour Glass', 'Key'], // Real objects that give points
      fakeObjects: ['Old clock'], // Fake objects that are visible but don't give points
      doorPosition: null, // No door in final room
      doorRotation: null
    }
  ];

  clueMap = {
    'Candlestick': 'I shrink as I stand, yet I never move,I weep without sorrow, yet my tears improve.Shadows flee when I whisper my light,What am I, that burns but has no fight',
    'Vase': 'Hollow throat of clay, once sipped the scent of dead flowers.',
    'Rake': 'Iron fingers by the hearth, forever combing ashes for bones.',
    'Telepfone': 'A distant voice entombed in wires, ringing after the caller is gone.',
    'Oil Lamp': 'Once I guided souls through night,Now I whisper without light',
    'Cross': 'Worn on necks or on walls I\'m seen, What am I that protects from the unseen?',
    'Bulb1': 'Glass vessel of forgotten light, once bright now dim in endless night.',
    'Bulb2': 'Hollow sphere that held the glow, now dark where light used to flow.',
    'Horse': 'Silent steed of wood, gallops only in memories.',
    'Spider': 'I believe with great power comes……..I guess we all know it',
    'Group': 'Faces gather but never speak, captured mid-whisper.',
    'Teapot': 'Porcelain throat pours warmth, now cold as the grave.',
    'Wood': 'Splinters of yesterday’s forest, sleeping by the fire’s ghost.',
    'Wig' : 'If shabby they are called jhaadu(broom),most of us know it as Kala Jaadu(Black Magic)',
    'Clock': 'I’ve seen them live, I’ve seen them die. My hands still move, though none can hear,Seek me where the ghosts appear',
    'Bucket': 'A mouth with a metal grin, thirsty for the well’s secrets.',
    'Book': 'Leather skin and paper bones, whispering learned curses.',
    'Lamp': 'A blind eye on the ceiling, once blinking with light.',
    'Specs': ' Potter stole something from Gandhi, guess what?',

    'Key': 'I became useless when Alohomora entered the castle',
    'Hour Glass': 'time is ticking go find soon once upside down its game over for you',
    'Haunted Painting': 'I hang where silence tends to creep,Eyes that watch while others sleep.',
    'Old clock': 'An elder of ticking halls, hoarding minutes like gold.',
    'Old frame': 'A wooden ring for ghosts, holding what is missing.',
    'Frame': 'Gilded teeth bite the wall, refusing to let go of memories.',
    'Cup': 'A small chalice of warmth, now sipping only dust.',
    'Lock': 'Iron secret-keeper, smiling without a key.'
  };

  score = 0;
  currentIndex = 0;
  isTransitioning = false;
  gameInitialized = true;
  
  // Load unlocked rooms from localStorage
  var savedUnlocked = localStorage.getItem('roomsUnlocked');
  if (savedUnlocked) {
    roomsUnlocked = parseInt(savedUnlocked);
    console.log('Loaded unlocked rooms from storage:', roomsUnlocked);
  }
  
  // Initialize room scores array
  roomScores = [];
  for (var i = 0; i < rooms.length; i++) {
    roomScores.push(0);
  }
  
  updateScore(0);
  
  // Check if a specific room was requested via URL parameter
  var urlParams = new URLSearchParams(window.location.search);
  var requestedRoom = urlParams.get('room');
  
  if (requestedRoom !== null) {
    var requestedIndex = parseInt(requestedRoom);
    // Security: Only allow access to unlocked rooms
    if (requestedIndex < roomsUnlocked) {
      currentRoom = requestedIndex;
      console.log('Starting with room from URL:', currentRoom);
    } else {
      console.log('⚠️ Room', requestedIndex, 'is locked! Starting with room 0');
      currentRoom = 0;
      // Redirect to remove invalid room parameter
      window.history.replaceState({}, '', 'index.html');
    }
  } else {
    currentRoom = 0;
  }
  
  // Initialize room
  console.log('🎮 About to load initial room:', currentRoom);
  console.log('🎮 Room data:', rooms[currentRoom]);
  loadRoom(currentRoom);
  
  // Start background music
  startBackgroundMusic();
  
  // Start jumpscare timer (1 minute)
  startJumpscareTimer();
  
  // Start room timer (5 minutes)
  startRoomTimer();
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
  console.log('nextClue - currentIndex:', currentIndex, 'targets.length:', targets.length);
  console.log('rooms array:', rooms);
  console.log('gameInitialized:', gameInitialized, 'isTransitioning:', isTransitioning);
  
  if (currentIndex >= targets.length) {
    // All objects in current room found
    console.log('All objects found in room', currentRoom);
    console.log('Current room:', currentRoom, 'Total rooms:', rooms ? rooms.length : 'rooms is undefined!');
    
    // Safety check: Don't show door animation if game just started or already transitioning
    if (!gameInitialized || isTransitioning) {
      console.log('⚠️ Preventing door animation - game not ready or already transitioning');
      return;
    }
    
    if (rooms && currentRoom < rooms.length - 1) {
      // More rooms to go - show door animation
      console.log('Showing door animation for next room');
      
      // Stop room timer
      stopRoomTimer();
      
      // Show completion message
      if (ui.clueBar) {
        ui.clueBar.textContent = 'Room Complete! Moving to next room...';
      }
      
      // Transition after short delay
      setTimeout(function() {
        showDoorAnimation();
      }, 1000);
    } else {
      // Final room complete - end game
      console.log('Final room complete - ending game');
      stopRoomTimer();
      endGame();
    }
    return;
  }
  if (!ui.clueBar) return;
  ui.clueBar.classList.remove('fade-in');
  ui.clueBar.classList.add('fade-in');
  ui.clueBar.textContent = clueMap[currentTargetName()] || ('Find: ' + currentTargetName());
}

function updateScore(delta) {
  score += delta;
  roomScores[currentRoom] += delta; // Track score for current room
  
  if (ui.scoreValue) ui.scoreValue.textContent = String(score);
  if (ui.scoreFlash && delta !== 0) {
    ui.scoreFlash.textContent = (delta > 0 ? '+' : '') + delta;
    ui.scoreFlash.className = delta > 0 ? 'flash-green' : 'flash-red';
    
    // Play sound effect
    if (audioEnabled) {
      if (delta > 0 && correctSound) {
        correctSound.currentTime = 0;
        correctSound.play().catch(function(e) { console.log('Audio play failed:', e); });
      } else if (delta < 0 && wrongSound) {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(function(e) { console.log('Audio play failed:', e); });
      }
    }
    
    // Clear after animation ends
    setTimeout(function(){ if (ui.scoreFlash) { ui.scoreFlash.textContent = ''; ui.scoreFlash.className=''; } }, 750);
  }
}

function endGame() {
  totalScore = score;
  
  if (ui.endOverlay) {
    ui.endOverlay.classList.remove('hidden');
    
    // Update victory message
    var victoryTitle = ui.endOverlay.querySelector('h1');
    if (victoryTitle) {
      victoryTitle.textContent = "You've Conquered the Shadows of Bhangarh!";
    }
    
    // Display total score
    if (ui.finalScore) {
      ui.finalScore.textContent = String(totalScore);
    }
    
    // Create room-by-room score breakdown
    var endContent = ui.endOverlay.querySelector('.endContent');
    if (endContent) {
      // Remove old breakdown if exists
      var oldBreakdown = endContent.querySelector('.score-breakdown');
      if (oldBreakdown) {
        oldBreakdown.remove();
      }
      
      // Create new breakdown
      var breakdown = document.createElement('div');
      breakdown.className = 'score-breakdown';
      breakdown.style.margin = '20px 0';
      breakdown.style.padding = '15px';
      breakdown.style.background = 'rgba(0,0,0,0.3)';
      breakdown.style.borderRadius = '8px';
      breakdown.style.border = '1px solid rgba(255,255,255,0.1)';
      
      var breakdownTitle = document.createElement('h3');
      breakdownTitle.textContent = 'Room Scores:';
      breakdownTitle.style.color = '#ff9800';
      breakdownTitle.style.marginBottom = '10px';
      breakdown.appendChild(breakdownTitle);
      
      for (var i = 0; i < rooms.length; i++) {
        var roomScore = document.createElement('div');
        roomScore.style.padding = '5px 0';
        roomScore.style.color = '#ccc';
        roomScore.innerHTML = '<strong>' + rooms[i].name + ':</strong> ' + 
                              '<span style="color: ' + (roomScores[i] >= 0 ? '#4CAF50' : '#ff4444') + 
                              '; font-weight: bold;">' + roomScores[i] + ' points</span>';
        breakdown.appendChild(roomScore);
      }
      
      // Insert before buttons
      var buttons = endContent.querySelector('.end-buttons');
      if (buttons) {
        endContent.insertBefore(breakdown, buttons);
      } else {
        endContent.appendChild(breakdown);
      }
    }
  }
}

function restartGame() {
  if (ui.endOverlay) ui.endOverlay.classList.add('hidden');
  score = 0;
  currentIndex = 0;
  currentRoom = 0;
  roomsUnlocked = 1; // Reset to only first room unlocked
  
  // Reset room scores
  roomScores = [];
  for (var i = 0; i < rooms.length; i++) {
    roomScores.push(0);
  }
  
  updateScore(0);
  
  // Reload first room
  loadRoom(0);
  
  // Reset jumpscare
  jumpscareTriggered = false;
  if (jumpscareTimer) {
    clearTimeout(jumpscareTimer);
  }
  startJumpscareTimer();
  
  // Reset room timer
  if (roomTimer) {
    clearInterval(roomTimer);
  }
  startRoomTimer();
}

function handleSelection() {
  if (!gameInitialized || isTransitioning) return;
  
  // Increase clickable area by checking multiple points around the click
  var hitObj = null;
  var clickRadius = 0.05; // Increase this for larger clickable area
  var offsets = [
    {x: 0, y: 0},           // Center
    {x: clickRadius, y: 0}, // Right
    {x: -clickRadius, y: 0},// Left
    {x: 0, y: clickRadius}, // Top
    {x: 0, y: -clickRadius},// Bottom
    {x: clickRadius, y: clickRadius},   // Top-right
    {x: -clickRadius, y: clickRadius},  // Top-left
    {x: clickRadius, y: -clickRadius},  // Bottom-right
    {x: -clickRadius, y: -clickRadius}  // Bottom-left
  ];
  
  // Try each offset point to find an object
  for (var i = 0; i < offsets.length && !hitObj; i++) {
    var testMouse = new THREE.Vector2(mouse.x + offsets[i].x, mouse.y + offsets[i].y);
    raycaster.setFromCamera(testMouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true).filter(function (hit) { 
      return hit.object && hit.object.name !== 'backGround' && hit.object.name !== 'door'; 
    });
    if (intersects.length > 0) {
      hitObj = intersects[0].object;
    }
  }

  if (!hitObj || !hitObj.visible || (hitObj.userData && hitObj.userData.isAnimating)) {
    // Empty space, already found, or currently animating
    updateScore(-2);
    return;
  }

  var expected = currentTargetName();
  var currentRoomData = rooms[currentRoom] || {};
  var isFakeObject = currentRoomData.fakeObjects && currentRoomData.fakeObjects.includes(hitObj.name);
  
  if (hitObj.name === expected) {
    // Correct object found - start animation (don't hide immediately)
    animateCorrectObject(hitObj);
    updateScore(+5);
    if (ui.clueBar) {
      ui.clueBar.classList.remove('fade-in');
      ui.clueBar.classList.add('fade-out');
      setTimeout(function(){ nextClue(); }, 2200); // Increased delay for longer animation
    } else {
      setTimeout(function(){ nextClue(); }, 2200);
    }
    return; // CRITICAL: Exit immediately to prevent penalty scoring
  } else if (isFakeObject) {
    // Fake object clicked - give penalty but show message
    updateScore(-2);
    if (ui.clueBar) {
      var originalText = ui.clueBar.textContent;
      ui.clueBar.textContent = 'This object is not what you seek...';
      ui.clueBar.classList.add('fade-in');
      setTimeout(function() {
        ui.clueBar.textContent = originalText;
      }, 1500);
    }
  } else {
    // Wrong real object or empty space
    updateScore(-2);
  }
}

function animateCorrectObject(object) {
  if (!object) return;
  
  // Mark object as animating to prevent multiple clicks
  object.userData.isAnimating = true;
  
  // Store original properties
  var originalPosition = object.position.clone();
  var originalScale = object.scale.clone();
  var originalOpacity = object.material.opacity !== undefined ? object.material.opacity : 1;
  
  // Make sure material supports transparency
  if (object.material) {
    object.material.transparent = true;
  }
  
  // Animation parameters
  var animationDuration = 2000; // 2 seconds total
  var scalePhase = 500; // First 500ms for scaling
  var movePhase = 1000; // Next 1000ms for moving to center (slower)
  var fadePhase = 500; // Last 500ms for fading out
  
  var startTime = Date.now();
  
  // Calculate center position relative to camera view
  var centerPosition = new THREE.Vector3();
  centerPosition.copy(camera.target).normalize().multiplyScalar(100); // Move towards camera target at distance 100
  
  function animateFrame() {
    var elapsed = Date.now() - startTime;
    var progress = Math.min(elapsed / animationDuration, 1);
    
    if (progress < scalePhase / animationDuration) {
      // Phase 1: Scale up
      var scaleProgress = (elapsed / scalePhase);
      var easeScale = 1 - Math.pow(1 - scaleProgress, 3); // Ease out cubic
      var scale = 1 + (easeScale * 0.5); // Scale up to 1.5x
      object.scale.setScalar(scale);
      
    } else if (progress < (scalePhase + movePhase) / animationDuration) {
      // Phase 2: Move to center while maintaining scale
      var moveProgress = (elapsed - scalePhase) / movePhase;
      var easeMove = 1 - Math.pow(1 - moveProgress, 4); // Ease out quartic (smoother)
      
      // Interpolate position to center
      object.position.lerpVectors(originalPosition, centerPosition, easeMove);
      
    } else {
      // Phase 3: Fade out
      var fadeProgress = (elapsed - scalePhase - movePhase) / fadePhase;
      var easeFade = fadeProgress; // Linear fade
      
      // Ensure object is at center
      object.position.copy(centerPosition);
      
      // Fade out
      if (object.material) {
        object.material.opacity = originalOpacity * (1 - easeFade);
      }
    }
    
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      // Animation complete - hide object
      object.visible = false;
      
      // Reset properties for potential future use
      object.position.copy(originalPosition);
      object.scale.copy(originalScale);
      if (object.material) {
        object.material.opacity = originalOpacity;
      }
      
      // Clear animation flag
      if (object.userData) {
        object.userData.isAnimating = false;
      }
    }
  }
  
  // Start animation
  requestAnimationFrame(animateFrame);
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

// ===== Video System =====
function enableVideoPlayback() {
  var videoEnabled = false;
  
  function enableVideos() {
    if (videoEnabled) return;
    videoEnabled = true;
    
    console.log('🎬 Enabling video playback after user interaction');
    
    // Prepare door transition video
    if (ui.doorTransitionVideo) {
      ui.doorTransitionVideo.load(); // Reload video to ensure it's ready
      console.log('✅ Door transition video prepared');
    }
    
    // Prepare jumpscare video
    if (ui.jumpscareVideo) {
      ui.jumpscareVideo.load();
      console.log('✅ Jumpscare video prepared');
    }
  }
  
  // Enable videos on first user interaction
  document.addEventListener('click', enableVideos, { once: true });
  document.addEventListener('touchstart', enableVideos, { once: true });
  document.addEventListener('keydown', enableVideos, { once: true });
}

// ===== Audio System =====
function initAudio() {
  try {
    // Initialize correct sound
    correctSound = new Audio('audio/correct.mp3');
    correctSound.preload = 'auto';
    correctSound.volume = 0.7;
    
    // Initialize wrong sound
    wrongSound = new Audio('audio/wrong.mp3');
    wrongSound.preload = 'auto';
    wrongSound.volume = 0.5;
    
    // Initialize background music
    backgroundMusic = new Audio('audio/background.mp3');
    backgroundMusic.preload = 'auto';
    backgroundMusic.volume = 0.3;
    backgroundMusic.loop = true;
    
    // Handle audio loading errors gracefully
    correctSound.onerror = function() {
      console.log('Could not load correct sound effect');
      correctSound = null;
    };
    
    wrongSound.onerror = function() {
      console.log('Could not load wrong sound effect');
      wrongSound = null;
    };
    
    backgroundMusic.onerror = function() {
      console.log('Could not load background music');
      backgroundMusic = null;
    };
    
  } catch (e) {
    console.log('Audio initialization failed:', e);
    audioEnabled = false;
  }
}

function startBackgroundMusic() {
  if (audioEnabled && backgroundMusic) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(function(e) { 
      console.log('Background music play failed:', e); 
    });
  }
}

function stopBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
}

function toggleMute() {
  audioEnabled = !audioEnabled;
  
  if (ui.muteBtn) {
    if (audioEnabled) {
      ui.muteBtn.textContent = '🔊';
      ui.muteBtn.classList.remove('muted');
      // Resume background music if it was playing
      if (gameInitialized && backgroundMusic) {
        backgroundMusic.play().catch(function(e) { 
          console.log('Background music resume failed:', e); 
        });
      }
    } else {
      ui.muteBtn.textContent = '🔇';
      ui.muteBtn.classList.add('muted');
      // Pause all audio
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    }
  }
}

// ===== Jumpscare System =====
function startJumpscareTimer() {
  if (jumpscareTriggered) return;
  
  gameStartTime = Date.now();
  jumpscareTimer = setTimeout(function() {
    triggerJumpscare();
  }, 60000); // 1 minute = 60000ms
}

function triggerJumpscare() {
  if (jumpscareTriggered || !gameInitialized) return;
  
  jumpscareTriggered = true;
  
  // Pause background music
  if (backgroundMusic) {
    backgroundMusic.pause();
  }
  
  // Show jumpscare overlay
  if (ui.jumpscareOverlay) {
    ui.jumpscareOverlay.classList.remove('hidden');
  }
  
  // Play jumpscare video
  if (ui.jumpscareVideo) {
    ui.jumpscareVideo.muted = false; // Unmute for jumpscare effect
    ui.jumpscareVideo.volume = 0.8;
    ui.jumpscareVideo.currentTime = 0;
    
    ui.jumpscareVideo.play().catch(function(e) {
      console.log('Jumpscare video play failed:', e);
      // If video fails, just hide overlay after 3 seconds
      setTimeout(function() {
        hideJumpscare();
      }, 3000);
    });
    
    // Hide jumpscare when video ends
    ui.jumpscareVideo.onended = function() {
      hideJumpscare();
    };
    
    // Fallback: hide after 10 seconds max
    setTimeout(function() {
      if (!ui.jumpscareOverlay.classList.contains('hidden')) {
        hideJumpscare();
      }
    }, 10000);
  }
}

function hideJumpscare() {
  if (ui.jumpscareOverlay) {
    ui.jumpscareOverlay.classList.add('hidden');
  }
  
  if (ui.jumpscareVideo) {
    ui.jumpscareVideo.pause();
    ui.jumpscareVideo.muted = true;
  }
  
  // Resume background music if audio is enabled
  if (audioEnabled && backgroundMusic && gameInitialized) {
    backgroundMusic.play().catch(function(e) {
      console.log('Background music resume after jumpscare failed:', e);
    });
  }
}

// ===== Room Timer System =====
function startRoomTimer() {
  roomStartTime = Date.now();
  roomTimeRemaining = roomTimeLimit;
  
  // Clear any existing timer
  if (roomTimer) {
    clearInterval(roomTimer);
  }
  
  // Update timer every second
  roomTimer = setInterval(function() {
    var elapsed = Date.now() - roomStartTime;
    roomTimeRemaining = roomTimeLimit - elapsed;
    
    if (roomTimeRemaining <= 0) {
      // Time's up!
      clearInterval(roomTimer);
      handleRoomTimeout();
    } else {
      updateTimerDisplay();
    }
  }, 100); // Update every 100ms for smooth countdown
  
  // Initial display update
  updateTimerDisplay();
}

function updateTimerDisplay() {
  if (!ui.timerDisplay) return;
  
  var secondsRemaining = Math.max(0, Math.ceil(roomTimeRemaining / 1000));
  var minutes = Math.floor(secondsRemaining / 60);
  var seconds = secondsRemaining % 60;
  
  // Format as MM:SS
  var timeString = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  ui.timerDisplay.textContent = timeString;
  
  // Change color when time is running out
  if (secondsRemaining <= 30) {
    ui.timerDisplay.style.color = '#ff4444';
    ui.timerDisplay.style.animation = 'pulse 1s infinite';
  } else if (secondsRemaining <= 60) {
    ui.timerDisplay.style.color = '#ff9800';
    ui.timerDisplay.style.animation = 'none';
  } else {
    ui.timerDisplay.style.color = '#4CAF50';
    ui.timerDisplay.style.animation = 'none';
  }
}

function stopRoomTimer() {
  if (roomTimer) {
    clearInterval(roomTimer);
    roomTimer = null;
  }
}

function handleRoomTimeout() {
  console.log('⏱️ Room timer expired!');
  console.log('Current room:', currentRoom, 'Total rooms:', rooms.length);
  
  // Stop the timer
  stopRoomTimer();
  
  // Show timeout message
  if (ui.clueBar) {
    ui.clueBar.textContent = 'Time\'s up! Moving to the next room...';
    ui.clueBar.classList.add('fade-in');
  }
  
  // Check if there are more rooms
  if (currentRoom < rooms.length - 1) {
    console.log('Moving to next room due to timeout. Current room:', currentRoom);
    
    // Set isTransitioning to prevent conflicts
    if (!isTransitioning) {
      // Move to next room after delay with door animation
      setTimeout(function() {
        console.log('Timeout: Showing door animation before transition');
        showDoorAnimation();
      }, 2000);
    } else {
      console.log('Already transitioning, skipping timeout transition');
    }
  } else {
    // Last room - end the game
    console.log('Last room timeout - ending game');
    setTimeout(function() {
      endGame();
    }, 2000);
  }
}

// ===== Multi-Room System =====
function loadRoom(roomIndex) {
  console.log('====== loadRoom called ======');
  console.log('Requested room index:', roomIndex);
  console.log('Current room before change:', currentRoom);
  console.log('Total rooms:', rooms.length);
  console.log('Stack trace:');
  console.trace();
  
  if (roomIndex < 0 || roomIndex >= rooms.length) {
    console.error('❌ Invalid room index:', roomIndex);
    return;
  }
  
  var room = rooms[roomIndex];
  console.log('Setting currentRoom from', currentRoom, 'to', roomIndex);
  currentRoom = roomIndex;
  console.log('✅ Loading room:', room.name, '(index:', currentRoom, ')');
  
  // Stop any existing room timer
  stopRoomTimer();
  
  // Update background with immediate transition
  var backgroundMesh = scene.getObjectByName('backGround');
  if (backgroundMesh) {
    console.log('🔄 Loading background texture:', room.background);
    
    // IMMEDIATELY replace with loading background to prevent old room display
    if (backgroundMesh.material && backgroundMesh.material.map) {
      backgroundMesh.material.map.dispose();
    }
    if (backgroundMesh.material) {
      backgroundMesh.material.dispose();
    }
    
    // Set temporary dark background immediately
    backgroundMesh.material = new THREE.MeshBasicMaterial({
      color: 0x000000, // Black loading background
      side: THREE.DoubleSide
    });
    backgroundMesh.material.needsUpdate = true;
    
    // Force immediate render to show loading background
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
    
    // Now load the actual texture
    var loader = new THREE.TextureLoader();
    
    // Load texture asynchronously
    try {
      loader.load(
        room.background,
        // Success
        function(texture) {
          console.log('✅ Texture loaded successfully:', room.background);
          
          // Configure texture
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          
          // Dispose temporary loading material
          if (backgroundMesh.material) {
            backgroundMesh.material.dispose();
          }
          
          // Create new material with loaded texture
          backgroundMesh.material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
          });
          backgroundMesh.material.needsUpdate = true;
          
          // Force immediate render with new texture
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
          
          console.log('✅ Background material updated and rendered successfully');
        },
        // Progress
        function(progress) {
          console.log('Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        // Error
        function(error) {
          console.error('❌ Failed to load texture:', room.background);
          console.error('Error details:', error);
          
          // Create fallback colored material
          if (backgroundMesh.material) {
            backgroundMesh.material.dispose();
          }
          backgroundMesh.material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide
          });
          console.log('🔄 Applied fallback colored background');
        }
      );
    } catch (e) {
      console.error('❌ Exception during texture loading:', e);
      // Emergency fallback
      backgroundMesh.material = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide
      });
    }
  } else {
    console.error('❌ Background mesh not found in scene!');
  }
  
  // Hide all objects first
  scene.children.forEach(function (o) {
    if (o && o.name && o.name !== 'backGround' && o.name !== 'door') {
      o.visible = false;
    }
  });
  
  // Show real objects for this room
  room.objects.forEach(function(objName) {
    var obj = scene.getObjectByName(objName);
    if (obj) {
      obj.visible = true;
      console.log('Showing real object:', objName);
    } else {
      console.log('Real object not found:', objName);
    }
  });
  
  // Show fake objects for this room (if any)
  if (room.fakeObjects) {
    room.fakeObjects.forEach(function(objName) {
      var obj = scene.getObjectByName(objName);
      if (obj) {
        obj.visible = true;
        console.log('Showing fake object:', objName);
      } else {
        console.log('Fake object not found:', objName);
      }
    });
  }
  
  // Remove old door if exists
  if (doorObject) {
    scene.remove(doorObject);
    doorObject = null;
  }
  
  // Add door if not final room
  if (room.doorPosition) {
    createDoor(room.doorPosition, room.doorRotation);
    console.log('Door created at position:', room.doorPosition);
  } else {
    console.log('No door for final room');
  }
  
  // Reset targets for this room
  targets = room.objects.slice();
  currentIndex = 0;
  console.log('Targets for this room:', targets);
  
  // Show room name and first clue
  showRoomTransition(room.name);
  
  // Add room info to clue bar temporarily
  if (ui.clueBar) {
    ui.clueBar.textContent = 'Loading ' + room.name + '...';
  }
  
  setTimeout(function() {
    showClue(currentTargetName());
    // Start room timer after room is fully loaded
    startRoomTimer();
  }, 2000);
}

function createDoor(position, rotation) {
  // Create a simple door using planes
  var doorGeometry = new THREE.PlaneGeometry(80, 150);
  
  // Create door material with a dark wood color
  var doorMaterial = new THREE.MeshBasicMaterial({
    color: 0x3d2817,
    side: THREE.DoubleSide
  });
  
  doorObject = new THREE.Mesh(doorGeometry, doorMaterial);
  doorObject.name = 'door';
  doorObject.position.set(position.x, position.y, position.z);
  doorObject.rotation.set(rotation.x, rotation.y, rotation.z);
  doorObject.visible = false; // Hidden until all objects found
  
  // Add door frame
  var frameMaterial = new THREE.MeshBasicMaterial({
    color: 0x1a0f0a,
    side: THREE.DoubleSide
  });
  
  var frameGeometry = new THREE.PlaneGeometry(90, 160);
  var doorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
  doorFrame.position.set(0, 0, -1);
  doorObject.add(doorFrame);
  
  scene.add(doorObject);
}

function showDoorAnimation() {
  console.log('showDoorAnimation called');
  console.log('currentRoom before transition:', currentRoom);
  console.log('gameInitialized:', gameInitialized, 'currentIndex:', currentIndex, 'targets.length:', targets.length);
  
  // Safety check: Don't show door animation if conditions aren't met
  if (!gameInitialized) {
    console.log('⚠️ Aborting door animation - game not initialized');
    return;
  }
  
  if (isTransitioning) {
    console.log('⚠️ Aborting door animation - already transitioning');
    return;
  }
  
  // Allow door animation during timeout even if no objects found
  if (currentRoom === 0 && currentIndex === 0 && roomTimeRemaining > 0) {
    console.log('⚠️ Aborting door animation - still in first room, no objects found, and time remaining');
    return;
  }
  
  isTransitioning = true;
  
  // Show message
  if (ui.clueBar) {
    ui.clueBar.textContent = 'The door opens... Enter to continue your journey.';
    ui.clueBar.classList.add('fade-in');
  }
  
  // Play door opening video
  if (ui.doorTransitionOverlay && ui.doorTransitionVideo) {
    console.log('Playing door opening video...');
    
    // Show the overlay
    ui.doorTransitionOverlay.classList.remove('hidden');
    
    // Reset video and ensure it's ready to play
    ui.doorTransitionVideo.currentTime = 0;
    ui.doorTransitionVideo.muted = false; // Ensure it's not muted
    ui.doorTransitionVideo.volume = 0.8;
    
    // Track if transition was already triggered
    var transitionTriggered = false;
    var fallbackTimeout = null;
    
    // Play video with proper error handling
    var playPromise = ui.doorTransitionVideo.play();
    
    if (playPromise !== undefined) {
      playPromise.then(function() {
        console.log('✅ Door video started playing successfully');
      }).catch(function(error) {
        console.error('❌ Door video play failed:', error);
        // If video fails to play, just transition after a delay
        if (!transitionTriggered) {
          transitionTriggered = true;
          setTimeout(function() {
            console.log('Transitioning without video due to play failure');
            ui.doorTransitionOverlay.classList.add('hidden');
            transitionToNextRoom();
          }, 2000);
        }
      });
    }
    
    // When video ends, transition to next room
    ui.doorTransitionVideo.onended = function() {
      console.log('Door video complete, transitioning...');
      
      // Only transition if not already triggered
      if (!transitionTriggered) {
        transitionTriggered = true;
        
        // Clear the fallback timeout
        if (fallbackTimeout) {
          clearTimeout(fallbackTimeout);
        }
        
        // Hide the overlay
        ui.doorTransitionOverlay.classList.add('hidden');
        
        // Transition to next room
        transitionToNextRoom();
      }
    };
    
    // Fallback: If video doesn't end within 10 seconds, force transition
    fallbackTimeout = setTimeout(function() {
      if (!transitionTriggered && !ui.doorTransitionOverlay.classList.contains('hidden')) {
        console.log('⚠️ Door video timeout, forcing transition');
        transitionTriggered = true;
        ui.doorTransitionOverlay.classList.add('hidden');
        transitionToNextRoom();
      }
    }, 10000);
  } else {
    // Fallback if video elements not found - just transition directly
    console.log('Door video not found, transitioning directly...');
    setTimeout(function() {
      transitionToNextRoom();
    }, 1500);
  }
}

function transitionToNextRoom() {
  console.log('transitionToNextRoom called');
  console.log('Current room before increment:', currentRoom);
  console.log('Room score:', roomScores[currentRoom]);
  console.log('isTransitioning flag:', isTransitioning);
  
  // Double-check we're not already in the middle of a transition
  if (!isTransitioning) {
    console.log('⚠️ transitionToNextRoom called but isTransitioning is false - aborting');
    return;
  }
  
  // Fade out effect
  if (ui.clueBar) {
    ui.clueBar.classList.add('fade-out');
  }
  
  // Create fade overlay
  var fadeOverlay = document.createElement('div');
  fadeOverlay.style.position = 'fixed';
  fadeOverlay.style.top = '0';
  fadeOverlay.style.left = '0';
  fadeOverlay.style.width = '100vw';
  fadeOverlay.style.height = '100vh';
  fadeOverlay.style.backgroundColor = '#000';
  fadeOverlay.style.opacity = '0';
  fadeOverlay.style.transition = 'opacity 1s ease-in-out';
  fadeOverlay.style.zIndex = '5000';
  fadeOverlay.style.pointerEvents = 'none';
  document.body.appendChild(fadeOverlay);
  
  console.log('Fade overlay created');
  
  // Fade to black
  setTimeout(function() {
    fadeOverlay.style.opacity = '1';
    console.log('Fading to black...');
  }, 50);
  
  // Load next room
  setTimeout(function() {
    var nextRoomIndex = currentRoom + 1;
    console.log('====== TRANSITION: Calculating next room ======');
    console.log('Current room index:', currentRoom);
    console.log('Next room index will be:', nextRoomIndex);
    console.log('Room names: current="' + rooms[currentRoom].name + '", next="' + rooms[nextRoomIndex].name + '"');
    
    // DO NOT update currentRoom here - let loadRoom do it
    // This prevents double increment issues
    
    // Unlock the next room
    if (nextRoomIndex >= roomsUnlocked) {
      roomsUnlocked = nextRoomIndex + 1;
      localStorage.setItem('roomsUnlocked', roomsUnlocked);
      console.log('🔓 Unlocked room:', nextRoomIndex, '- Saved to storage');
    }
    
    console.log('Calling loadRoom with index:', nextRoomIndex);
    loadRoom(nextRoomIndex);
    
    // Fade back in
    setTimeout(function() {
      fadeOverlay.style.opacity = '0';
      console.log('Fading back in...');
      setTimeout(function() {
        document.body.removeChild(fadeOverlay);
        isTransitioning = false;
        console.log('Transition complete! Now in room:', currentRoom);
      }, 1000);
    }, 500);
  }, 1500);
}

function showRoomTransition(roomName) {
  // Create room name overlay
  var roomOverlay = document.createElement('div');
  roomOverlay.style.position = 'fixed';
  roomOverlay.style.top = '50%';
  roomOverlay.style.left = '50%';
  roomOverlay.style.transform = 'translate(-50%, -50%)';
  roomOverlay.style.color = '#ff5555';
  roomOverlay.style.fontSize = '36px';
  roomOverlay.style.fontFamily = 'Georgia, serif';
  roomOverlay.style.textShadow = '0 0 20px rgba(255,0,0,0.8)';
  roomOverlay.style.zIndex = '6000';
  roomOverlay.style.opacity = '0';
  roomOverlay.style.transition = 'opacity 0.5s ease-in-out';
  roomOverlay.style.pointerEvents = 'none';
  roomOverlay.textContent = roomName;
  document.body.appendChild(roomOverlay);
  
  // Fade in
  setTimeout(function() {
    roomOverlay.style.opacity = '1';
  }, 50);
  
  // Fade out
  setTimeout(function() {
    roomOverlay.style.opacity = '0';
    setTimeout(function() {
      document.body.removeChild(roomOverlay);
    }, 500);
  }, 1500);
  
  // Update room progress indicator
  updateRoomProgress();
}

function updateRoomProgress() {
  if (!ui.roomProgress) return;
  
  ui.roomProgress.innerHTML = '';
  
  for (var i = 0; i < rooms.length; i++) {
    var dot = document.createElement('span');
    dot.className = 'room-progress-dot';
    
    if (i < currentRoom) {
      dot.classList.add('completed');
    } else if (i === currentRoom) {
      dot.classList.add('current');
    }
    
    ui.roomProgress.appendChild(dot);
  }
}
