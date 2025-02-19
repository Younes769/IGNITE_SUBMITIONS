"use client";

import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "@/hooks/useWindowSize";

const Background = () => {
  const canvasRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const windowSize = useWindowSize();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    let embers = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const resizeCanvas = () => {
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    class Ember {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 1;
        this.speedY = (Math.random() - 0.5) * 1;
        this.life = Math.random() * 0.5 + 0.5;
        this.hue = Math.random() * 30 + 10;
        this.brightness = Math.random() * 30 + 70;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.002;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        if (this.life <= 0) this.reset();
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.life})`;
        ctx.fill();
      }
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        const centerX = canvas.width / 2;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200;

        this.x = centerX + Math.cos(angle) * distance;
        this.y = canvas.height;
        this.baseX = this.x;
        this.size = Math.random() * 6 + 3;
        this.speedY = -(Math.random() * 4 + 2);
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.hue = Math.random() * 40 + 10;
        this.brightness = Math.random() * 40 + 60;
        this.angle = angle;
        this.distance = distance;
        this.oscillationSpeed = Math.random() * 0.02 + 0.01;
        this.oscillationDistance = Math.random() * 100 + 50;
        this.glowSize = Math.random() * 15 + 8;
      }

      update() {
        this.x =
          this.baseX +
          Math.sin(time * this.oscillationSpeed) * this.oscillationDistance;
        this.y += this.speedY;

        this.speedY *= 0.98;
        this.life -= this.decay;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          const angle = Math.atan2(dy, dx);
          const force = (150 - distance) / 150;
          this.x += Math.cos(angle) * force * 3;
          this.y += Math.sin(angle) * force * 3;
        }

        if (this.life <= 0) this.reset();
      }

      draw(ctx) {
        const alpha = this.life;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.glowSize * 2
        );
        gradient.addColorStop(
          0,
          `hsla(${this.hue}, 100%, ${this.brightness}%, ${alpha})`
        );
        gradient.addColorStop(
          1,
          `hsla(${this.hue}, 100%, ${this.brightness}%, 0)`
        );

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.glowSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${
          this.brightness + 30
        }%, ${alpha})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${this.hue}, 100%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Create more particles
    const particleCount = Math.min(
      200,
      Math.floor((canvas.width * canvas.height) / 10000)
    );
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Create more embers
    const emberCount = 150;
    for (let i = 0; i < emberCount; i++) {
      embers.push(new Ember());
    }

    const animate = () => {
      time += 0.01;

      // Clear with pure black and less fade for more contrast
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      // Draw embers
      embers.forEach((ember) => {
        ember.update();
        ember.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", null);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isClient, windowSize]);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default Background;
