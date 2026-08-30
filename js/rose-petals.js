// =============================================================================
// MHS STORE - LUXURY ROSE PETALS FALLING ENGINE
// Delicate, Light & Ethereal Particle Effect for "Kuchu Puchu Special"
// =============================================================================

export class RosePetalsEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.petals = [];
    this.rafId = null;
    this.isActive = false;
    this.opacity = 0;
    this.targetOpacity = 0;
    // Lighter intensity: fewer petals for a soft, premium, non-cluttered atmosphere
    this.petalCount = window.innerWidth <= 768 ? 16 : 24;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.onResize = this.handleResize.bind(this);
  }

  initCanvas() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'mhs-rose-petals-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '25';
    this.canvas.style.opacity = '0';
    this.canvas.style.transition = 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)';

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.handleResize();
    window.addEventListener('resize', this.onResize, { passive: true });
    this.createPetals();
  }

  handleResize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.height = this.height * Math.min(window.devicePixelRatio || 1, 2);
    if (this.ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  createPetals() {
    this.petals = [];
    for (let i = 0; i < this.petalCount; i++) {
      this.petals.push(this.createSinglePetal(true));
    }
  }

  createSinglePetal(initial = false) {
    // Soft, luminous, light pastel rose and blossom shades
    const shades = [
      { start: '#fff5f7', mid: '#ffb3c6', end: '#ff758f' }, // Luminous Soft Rose
      { start: '#ffffff', mid: '#ffc2d1', end: '#ff8fa3' }, // Delicate Pearl Blossom
      { start: '#fff0f3', mid: '#ffccd5', end: '#f7889e' }, // Sakura Pastel Pink
      { start: '#fde2e4', mid: '#ffc6d9', end: '#e07a9a' }, // Ethereal Rose Quartz
      { start: '#fff8f9', mid: '#f8bbd0', end: '#f48fb1' }  // Ultra-Light Baby Blossom
    ];

    const size = Math.random() * 10 + 13; // 13px to 23px
    return {
      x: Math.random() * this.width,
      y: initial ? Math.random() * this.height : -size - Math.random() * 80,
      size: size,
      aspectRatio: Math.random() * 0.3 + 0.85,
      speedY: Math.random() * 0.6 + 0.5, // Gentle, ultra-slow float (0.5 - 1.1 px/frame)
      speedX: Math.random() * 0.4 - 0.2,
      swayAmplitude: Math.random() * 1.4 + 0.6,
      swayFrequency: Math.random() * 0.018 + 0.008,
      swayPhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.018,
      pitch: Math.random() * Math.PI * 2,
      pitchSpeed: Math.random() * 0.025 + 0.01,
      colors: shades[Math.floor(Math.random() * shades.length)],
      opacity: Math.random() * 0.22 + 0.45, // Soft, translucent ambient opacity (0.45 - 0.67)
      flutter: Math.random() * Math.PI * 2
    };
  }

  start() {
    if (this.isActive) return;
    this.initCanvas();
    this.isActive = true;
    this.targetOpacity = 1;

    if (this.canvas) {
      this.canvas.style.opacity = '1';
    }

    if (!this.rafId) {
      this.render();
    }
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    this.targetOpacity = 0;

    if (this.canvas) {
      this.canvas.style.opacity = '0';
    }

    setTimeout(() => {
      if (!this.isActive && this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.width, this.height);
        }
      }
    }, 1400);
  }

  drawPetal(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    this.ctx.scale(Math.cos(p.pitch) * p.aspectRatio, 1);
    this.ctx.globalAlpha = p.opacity;

    const r = p.size;

    // Organic Rose Petal Path
    this.ctx.beginPath();
    this.ctx.moveTo(0, -r);
    this.ctx.bezierCurveTo(r * 0.9, -r * 0.9, r * 1.1, r * 0.4, 0, r);
    this.ctx.bezierCurveTo(-r * 1.1, r * 0.4, -r * 0.9, -r * 0.9, 0, -r);
    this.ctx.closePath();

    // Soft Luminous Radiant Gradient Fill
    const grad = this.ctx.createRadialGradient(-r * 0.2, -r * 0.3, 0, 0, 0, r * 1.2);
    grad.addColorStop(0, p.colors.start);
    grad.addColorStop(0.55, p.colors.mid);
    grad.addColorStop(1, p.colors.end);

    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Gentle soft highlight vein
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -r * 0.7);
    this.ctx.quadraticCurveTo(r * 0.1, 0, 0, r * 0.8);
    this.ctx.stroke();

    this.ctx.restore();
  }

  render() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];

      // Physics update: dreamy slow fall with gentle sway
      p.swayPhase += p.swayFrequency;
      p.flutter += 0.016;
      p.y += p.speedY + Math.sin(p.flutter) * 0.15;
      p.x += Math.sin(p.swayPhase) * p.swayAmplitude + p.speedX;
      p.rotation += p.rotSpeed;
      p.pitch += p.pitchSpeed;

      this.drawPetal(p);

      // Wrap around bottom boundary
      if (p.y > this.height + p.size * 2) {
        Object.assign(p, this.createSinglePetal(false));
      }
    }

    if (this.isActive || this.canvas.style.opacity !== '0') {
      this.rafId = requestAnimationFrame(() => this.render());
    }
  }

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
    window.removeEventListener('resize', this.onResize);
  }
}
