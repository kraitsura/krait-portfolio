import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


const About: React.FC = () => {
  return (
    <main className="flex-1 text-white">
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-transparent to-black/30">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-shadow">John Doe</h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8 text-shadow">Web Developer & Designer</p>
          <Button className="bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
            View My Work
          </Button>
        </div>
      </section>

      <section id="about" className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="max-w-2xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-shadow">About Me</h2>
          <p className="text-lg mb-4 text-gray-300">
            I'm a passionate web developer with expertise in React, Node.js, and modern web technologies. I love
            creating beautiful and functional websites that provide great user experiences.
          </p>
          <p className="text-lg text-gray-300">
            When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or
            enjoying a good cup of coffee.
          </p>
        </div>
      </section>

      <section id="projects" className="min-h-screen py-16 bg-gradient-to-b from-black/40 to-black/60">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-shadow">My Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((project) => (
              <div key={project} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 transition-all duration-300 hover:bg-white/10">
                <h3 className="text-xl font-semibold mb-2">Project {project}</h3>
                <p className="mb-4 text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">View Project</Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;