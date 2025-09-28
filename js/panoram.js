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
  isDragging = false,
  // Audio
  correctSound = null,
  wrongSound = null,
  backgroundMusic = null,
  audioEnabled = true,
  // Jumpscare
  jumpscareTimer = null,
  jumpscareTriggered = false,
  gameStartTime = null;

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
  ui.backToMenuBtn = document.getElementById('backToMenuBtn');
  ui.backToMenuFromEndBtn = document.getElementById('backToMenuFromEndBtn');
  ui.muteBtn = document.getElementById('muteBtn');
  ui.jumpscareOverlay = document.getElementById('jumpscareOverlay');
  ui.jumpscareVideo = document.getElementById('jumpscareVideo');
  
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
  
  // Start background music
  startBackgroundMusic();
  
  // Start jumpscare timer (1 minute)
  startJumpscareTimer();
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
  
  // Reset jumpscare
  jumpscareTriggered = false;
  if (jumpscareTimer) {
    clearTimeout(jumpscareTimer);
  }
  startJumpscareTimer();
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
    // Start the smooth animation sequence
    animateCorrectObject(hitObj);
    updateScore(+10);
    if (ui.clueBar) {
      ui.clueBar.classList.remove('fade-in');
      ui.clueBar.classList.add('fade-out');
      setTimeout(function(){ nextClue(); }, 2200); // Increased delay for longer animation
    } else {
      setTimeout(function(){ nextClue(); }, 2200);
    }
  } else {
    updateScore(-5);
  }
}

function animateCorrectObject(object) {
  if (!object) return;
  
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
  
  // Calculate center position (convert screen center to world position)
  var centerPosition = new THREE.Vector3(0, 0, -50); // Closer to camera for visibility
  
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
