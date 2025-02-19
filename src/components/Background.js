"use client";

import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    // IGNITE theme colors
    const colors = {
      primary: "#FF6B00",
      secondary: "#FF3D00",
    };

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const createParticles = () => {
      particles.current = [];
      const numberOfParticles = Math.min(
        100,
        Math.floor((canvas.width * canvas.height) / 20000)
      );

      for (let i = 0; i < numberOfParticles; i++) {
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          connections: [],
        });
      }
    };

    const drawBackground = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateParticles = () => {
      particles.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        // Keep particle within bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Reset connections
        particle.connections = [];

        // Mouse interaction
        const dx = mouse.current.x - particle.x;
        const dy = mouse.current.y - particle.y;
        const distance = dx * dx + dy * dy;
        if (distance < 10000) {
          const force = 0.02;
          particle.x -= dx * force;
          particle.y -= dy * force;
        }
      });
    };

    const findConnections = () => {
      particles.current.forEach((particle, i) => {
        particles.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            particle.connections.push(otherParticle);
            otherParticle.connections.push(particle);
          }
        });
      });
    };

    const drawShapes = () => {
      // Draw connections
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 107, 0, 0.3)`;
      ctx.lineWidth = 1;

      particles.current.forEach((particle) => {
        particle.connections.forEach((connected) => {
          const distance = Math.hypot(
            particle.x - connected.x,
            particle.y - connected.y
          );
          const opacity = 1 - distance / 150;

          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(connected.x, connected.y);
        });
      });
      ctx.stroke();

      // Draw triangles
      particles.current.forEach((p1) => {
        p1.connections.forEach((p2) => {
          p2.connections.forEach((p3) => {
            if (p3.connections.includes(p1)) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.closePath();
              ctx.fillStyle = `rgba(255, 107, 0, 0.05)`;
              ctx.fill();
            }
          });
        });
      });

      // Draw particles
      particles.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();

        if (particle.connections.length > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size + 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 107, 0, 0.2)`;
          ctx.fill();
        }
      });
    };

    const animate = () => {
      time++;
      drawBackground();
      updateParticles();
      findConnections();
      drawShapes();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Handle mouse movement
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mouse.current.x = (e.clientX - rect.left) * dpr;
      mouse.current.y = (e.clientY - rect.top) * dpr;
    };

    setCanvasSize();
    createParticles();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", setCanvasSize);
    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "black",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
