/**
 * D-Pad Virtual Joystick
 * A directional pad controller for room navigation
 */
var DPad = function(opts) {
    opts = opts || {};
    
    this._container = opts.container || document.body;
    this._dpadElement = null;
    this._pressed = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    // Position settings (bottom-right by default)
    this._position = opts.position || 'bottom-right';
    this._size = opts.size || 150;
    this._offset = opts.offset || 20;
    
    // Build and add D-pad to DOM
    this._buildDPad();
    this._attachEvents();
};

DPad.prototype._buildDPad = function() {
    // Create main container
    var dpad = document.createElement('div');
    dpad.className = 'dpad-container';
    dpad.id = 'dpadController';
    
    // Create center circle
    var center = document.createElement('div');
    center.className = 'dpad-center';
    
    // Create directional buttons
    var directions = ['up', 'right', 'down', 'left'];
    var buttons = {};
    
    for (var i = 0; i < directions.length; i++) {
        var dir = directions[i];
        var btn = document.createElement('div');
        btn.className = 'dpad-button dpad-' + dir;
        btn.setAttribute('data-direction', dir);
        
        // Add arrow icon
        var arrow = document.createElement('div');
        arrow.className = 'dpad-arrow';
        btn.appendChild(arrow);
        
        buttons[dir] = btn;
        dpad.appendChild(btn);
    }
    
    dpad.appendChild(center);
    
    this._dpadElement = dpad;
    this._buttons = buttons;
    this._container.appendChild(dpad);
};

DPad.prototype._attachEvents = function() {
    var self = this;
    
    // Helper to handle button press
    var handlePress = function(direction, isPressed) {
        self._pressed[direction] = isPressed;
        console.log('D-Pad:', direction, isPressed ? 'PRESSED' : 'RELEASED');
        var btn = self._buttons[direction];
        if (btn) {
            if (isPressed) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    };
    
    // Mouse events
    for (var dir in this._buttons) {
        (function(direction) {
            var btn = self._buttons[direction];
            
            btn.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handlePress(direction, true);
            });
            
            btn.addEventListener('mouseup', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handlePress(direction, false);
            });
            
            btn.addEventListener('mouseleave', function(e) {
                handlePress(direction, false);
            });
            
            // Touch events
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handlePress(direction, true);
            });
            
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handlePress(direction, false);
            });
            
            btn.addEventListener('touchcancel', function(e) {
                e.preventDefault();
                handlePress(direction, false);
            });
        })(dir);
    }
    
    // Global mouse/touch up to reset all buttons
    document.addEventListener('mouseup', function() {
        for (var dir in self._pressed) {
            handlePress(dir, false);
        }
    });
    
    document.addEventListener('touchend', function() {
        for (var dir in self._pressed) {
            handlePress(dir, false);
        }
    });
};

// Direction check methods (compatible with VirtualJoystick API)
DPad.prototype.up = function() {
    return this._pressed.up;
};

DPad.prototype.down = function() {
    return this._pressed.down;
};

DPad.prototype.left = function() {
    return this._pressed.left;
};

DPad.prototype.right = function() {
    return this._pressed.right;
};

// Destroy method
DPad.prototype.destroy = function() {
    if (this._dpadElement && this._dpadElement.parentNode) {
        this._dpadElement.parentNode.removeChild(this._dpadElement);
    }
};

// Show/hide methods
DPad.prototype.show = function() {
    if (this._dpadElement) {
        this._dpadElement.style.display = 'block';
    }
};

DPad.prototype.hide = function() {
    if (this._dpadElement) {
        this._dpadElement.style.display = 'none';
    }
};
