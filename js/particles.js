// Magic Twinkling Stars & Enchanted Particle Canvas
const canvas = document.getElementById('magic-canvas') || document.getElementById('starsCanvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];
    let mouse = { x: null, y: null, radius: 150 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    resize();

    class TwinkleStar {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 10;
            this.size = Math.random() * 3.5 + 1.2; // Star radius
            this.speedX = (Math.random() - 0.5) * 0.25;
            this.speedY = - (Math.random() * 0.35 + 0.08); // Slow gentle upward drift
            
            // Twinkling parameters
            this.baseAlpha = Math.random() * 0.4 + 0.3; // Base opacity 0.3 - 0.7
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = Math.random() * 0.035 + 0.015;
            this.isFourPoint = Math.random() < 0.65; // 65% are 4-point cross stars

            // Color Palette: Gold, Emerald, Violet, and Diamond White
            const rand = Math.random();
            if (rand < 0.45) {
                this.hue = 45;  // Gold / Warm Yellow
                this.sat = '95%';
                this.light = '75%';
            } else if (rand < 0.70) {
                this.hue = 155; // Emerald Magic
                this.sat = '85%';
                this.light = '70%';
            } else if (rand < 0.90) {
                this.hue = 275; // Violet / Purple
                this.sat = '85%';
                this.light = '75%';
            } else {
                this.hue = 50;  // Diamond Celestial White
                this.sat = '20%';
                this.light = '95%';
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.twinklePhase += this.twinkleSpeed;

            // Parallax mouse repulsion
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 1.5;
                    this.y += (dy / dist) * force * 1.5;
                }
            }

            // Wrap around edges
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
            if (this.y < -15) this.reset(false);
        }

        draw() {
            const currentAlpha = Math.max(0.12, Math.min(0.95, this.baseAlpha + Math.sin(this.twinklePhase) * 0.35));
            const color = `hsla(${this.hue}, ${this.sat}, ${this.light}, ${currentAlpha})`;
            const glowColor = `hsla(${this.hue}, ${this.sat}, 60%, ${currentAlpha * 0.4})`;

            ctx.save();
            ctx.translate(this.x, this.y);

            // Draw radial glow for shimmering atmosphere
            if (this.size > 2.0 && currentAlpha > 0.4) {
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3.5);
                gradient.addColorStop(0, glowColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            if (this.isFourPoint) {
                // Draw elegant 4-point twinkling star
                ctx.fillStyle = color;
                ctx.beginPath();
                const r = this.size * 1.8;
                const inner = r * 0.22;
                
                // 4 points
                ctx.moveTo(0, -r);
                ctx.quadraticCurveTo(0, -inner, inner, 0);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.quadraticCurveTo(inner, 0, 0, inner);
                ctx.quadraticCurveTo(0, 0, 0, r);
                ctx.quadraticCurveTo(0, inner, -inner, 0);
                ctx.quadraticCurveTo(0, 0, -r, 0);
                ctx.quadraticCurveTo(-inner, 0, 0, -inner);
                ctx.quadraticCurveTo(0, 0, 0, -r);
                ctx.closePath();
                ctx.fill();
            } else {
                // Soft glowing round stardust
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.85, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * (width * 0.8);
            this.y = Math.random() * (height * 0.4);
            this.len = Math.random() * 80 + 50;
            this.speed = Math.random() * 6 + 4;
            this.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2; // ~45 degrees downward
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.active = false;
        }

        spawn() {
            this.reset();
            this.active = true;
        }

        update() {
            if (!this.active) return;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.alpha -= this.decay;
            if (this.alpha <= 0 || this.x > width || this.y > height) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active || this.alpha <= 0) return;
            ctx.save();
            ctx.strokeStyle = `rgba(251, 191, 36, ${this.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x - Math.cos(this.angle) * this.len,
                this.y - Math.sin(this.angle) * this.len
            );
            ctx.stroke();
            ctx.restore();
        }
    }

    function initParticles() {
        stars = [];
        const count = Math.min(130, Math.floor((width * height) / 9000));
        for (let i = 0; i < count; i++) {
            stars.push(new TwinkleStar());
        }
        shootingStars = [new ShootingStar(), new ShootingStar()];
    }

    let lastShootTime = 0;
    function animate(timestamp) {
        ctx.clearRect(0, 0, width, height);

        for (let s of stars) {
            s.update();
            s.draw();
        }

        // Random shooting star every 4 - 8 seconds
        if (timestamp - lastShootTime > 4000 && Math.random() < 0.02) {
            const inactive = shootingStars.find(st => !st.active);
            if (inactive) {
                inactive.spawn();
                lastShootTime = timestamp;
            }
        }

        for (let st of shootingStars) {
            st.update();
            st.draw();
        }

        requestAnimationFrame(animate);
    }

    initParticles();
    requestAnimationFrame(animate);
}

// Mobile Menu Toggle Support
document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Skull Easter Egg Interactions
document.addEventListener('DOMContentLoaded', () => {
    const skulls = document.querySelectorAll('.skull-icon');
    const emojis = ['🌻', '✨', '💀', '🕯️', '🌿', '🔮', '💛', '💜', '⭐'];
    
    skulls.forEach((skull) => {
        skull.addEventListener('click', (e) => {
            skull.classList.remove('skull-activated');
            void skull.offsetWidth; // Trigger reflow
            skull.classList.add('skull-activated');
            
            const rect = skull.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 18; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'magic-sparkle';
                sparkle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                sparkle.style.left = `${originX}px`;
                sparkle.style.top = `${originY}px`;
                const randomX = (Math.random() - 0.5) * 280;
                sparkle.style.setProperty('--tx', `${randomX}px`);
                sparkle.style.animationDelay = `${Math.random() * 0.15}s`;
                document.body.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 2000);
            }
        });
    });
});
