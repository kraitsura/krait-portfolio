'use client'

import React, { useEffect, useRef } from 'react';
import styles from '@/styles/fadeIn.module.css';

interface ParticleProps {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

class Particle implements ParticleProps {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
  }

  update(canvasWidth: number, canvasHeight: number): void {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.size > 0.2) this.size -= 0.1;

    if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1;
    if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const About: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const particles: Particle[] = [];
    const particleCount = 100;

    const createParticles = (): void => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animateParticles = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw(ctx);

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.2;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        if (particles[i].size <= 0.2) {
          particles[i] = new Particle(canvas.width, canvas.height);
        }
      }

      requestAnimationFrame(animateParticles);
    };

    createParticles();
    animateParticles();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <main className="flex-1 text-white bg-black relative overflow-hidden">
      <div className={styles.fadeIn}>
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <section id="about" className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-2xl bg-black/60 backdrop-blur-md rounded-lg p-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-shadow">About Me</h2>
              <p className="text-lg mb-4 text-gray-300">
                I&apos;m a Software Developer by profession. I love building useful products, and have a passion for using technology to make a difference.
              </p>
              <p className="text-lg mb-4 text-gray-300">
                My goal is to create a space where knowledge is celebrated and shared, across borders, and beyond restrictive boundaries. To allow people from all walks of life to have access to high-quality papers.
              </p>
              <p className="text-lg text-gray-300">
                Away from the screen, you can find me in the woods, the kitchen, a good book, or nowhere at all, lost in thought.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default About;