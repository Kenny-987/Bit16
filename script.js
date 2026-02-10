const toggleButton = document.getElementsByClassName('toggle-button')[0];
const navbarLinks = document.getElementsByClassName('navbar-links')[0];

toggleButton.addEventListener('click', () => {
    // Toggles the 'active' class on the navbar links
    // This triggers the display: flex in the CSS
    navbarLinks.classList.toggle('active');
});

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

let particlesArray;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle mouse interactions
const mouse = {
    x: null,
    y: null,
    radius: 150 // Radius of interaction
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Clear mouse position when it leaves the window so particles settle
window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        
        // Backup of original speed to return to normal
        this.baseX = directionX;
        this.baseY = directionY;
        
        // Density affects how heavy the particle is (how hard it is to push)
        this.density = (Math.random() * 30) + 1;
    }

    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        // The 5th argument (Math.PI / 2) rotates the oval 90 degrees
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.8, Math.PI / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Check particle position, check mouse position, move the particle, draw the particle
    update() {
        // Check if particle is still within canvas
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Collision detection - Mouse position / particle position
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        // Physics: Antigravity / Repulsion
        if (distance < mouse.radius + this.size) {
            // Calculate direction to push particle
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            
            // The closer the mouse, the stronger the force
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Push away
            const directionX = forceDirectionX * force * this.density;
            const directionY = forceDirectionY * force * this.density;
            
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Return to normal drift logic
            // If the particle is not near the mouse, it should move at its base speed
            // But we want to preserve inertia slightly for smoothness, 
            // though for this specific "antigravity" look, resetting to base is often cleaner.
            
            // Standard movement
            if (this.x !== this.x + this.directionX) {
                this.x += this.directionX;
                this.y += this.directionY;
            }
        }
        
        // Draw particle
        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 20000; // Adjust density based on screen size
    
    // Define a color palette for the particles
    const colors = [ '#00ffff', '#ff00ff', '#ffff00']; 

    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 3) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        
        // Random speed and direction
        let directionX = (Math.random() * 1) - 0.5;
        let directionY = (Math.random() * 1) - 0.5;
        
        // Select a random color from the palette
        let color = colors[Math.floor(Math.random() * colors.length)];

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
}

// Handle Window Resize
window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init(); // Re-initialize particles to fill new area
});

init();
animate();