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
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    console.log('Canvas initialized:', canvas.width, canvas.height);

    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const particles: Particle[] = [];
    const particleCount = 50;

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

    const handleMouseMove = (event: MouseEvent): void => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      for (let i = 0; i < 5; i++) {
        const particle = new Particle(canvas.width, canvas.height);
        particle.x = mouseRef.current.x;
        particle.y = mouseRef.current.y;
        particle.size = Math.random() * 5 + 3;
        particle.speedX = (Math.random() - 0.5) * 10;
        particle.speedY = (Math.random() - 0.5) * 10;
        particles.push(particle);
      }

      if (particles.length > 200) {
        particles.splice(0, 5);
      }
    };

    createParticles();
    animateParticles();

    canvas.addEventListener('mousemove', handleMouseMove);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <main className="flex-1 text-white bg-black relative overflow-hidden">
      <div className={styles.fadeIn}>
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          <section id="about" className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-2xl bg-black/60 backdrop-blur-md rounded-lg p-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-shadow">About Me</h2>
              <p className="text-lg mb-4 text-gray-300">
                I&apos;m a recent graduate and Software Developer who loves exploring different technologies and frameworks through hands-on projects. In my free time, you&apos;ll often find me tinkering with new programming languages or diving into various coding challenges - not because I have to, but simply because I enjoy it.
              </p>
              <p className="text-lg mb-4 text-gray-300">
                I&apos;m particularly interested in how AI could enhance the way we learn and share knowledge. While I haven&apos;t built anything in this space yet, it&apos;s a direction that fascinates me and influences what I read about and study in my spare time.
              </p>
              <p className="text-lg text-gray-300">
                Away from the screen, you can find me in the woods, the kitchen, a good book, or nowhere at all, lost in thought. These different contexts help keep my mind fresh and creativity flowing. Most importantly, I thrive under contextual pressure - it&apos;s where my problem-solving abilities truly shine.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default About;