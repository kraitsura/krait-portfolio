'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Playfair_Display, Roboto_Mono } from 'next/font/google'
import FuturisticOverlay from './components/FuturisticOverlay'
import DataDisplay from './components/DataDisplay'
import SystemStatus from './components/SystemStatus'

const playfair = Playfair_Display({ subsets: ['latin'] })
const robotoMono = Roboto_Mono({ subsets: ['latin'] })

export default function Home() {
  const { scrollYProgress } = useScroll()
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 1],
    ['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)']
  )

  return (
    <motion.main 
      className="bg-black min-h-screen text-[#d4af37] overflow-hidden relative"
      style={{ backgroundColor }}
    >
      <div className="p-8">
        <FuturisticOverlay />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Header />
          <Hero />
          <About />
          <Portfolio />
          <Contact />
        </div>
        <DataDisplay />
        <SystemStatus />
      </div>
    </motion.main>
  )
}

function Header() {
  return (
    <header className="fixed top-8 right-8 z-50">
      <nav className={`${robotoMono.className} text-sm`}>
        <ul className="flex space-x-8">
          <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
          <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a></li>
          <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className={`${playfair.className} text-6xl mb-4`}>John Doe</h1>
        <p className={`${robotoMono.className} text-xl`}>Web Developer & Designer</p>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl">
        <h2 className={`${playfair.className} text-4xl mb-6`}>About Me</h2>
        <p className={`${robotoMono.className} text-lg mb-4`}>
          With a passion for blending classic elegance with cutting-edge technology, 
          I create web experiences that are both timeless and innovative.
        </p>
        <p className={`${robotoMono.className} text-lg`}>
          My approach combines the refined aesthetics of old-world craftsmanship 
          with the limitless possibilities of modern web development.
        </p>
      </div>
    </section>
  )
}

function Portfolio() {
  const projects = [
    { title: "Project 1", description: "A blend of tradition and innovation" },
    { title: "Project 2", description: "Elegance meets functionality" },
    { title: "Project 3", description: "Pushing the boundaries of web design" },
  ]

  return (
    <section id="portfolio" className="min-h-screen flex flex-col justify-center">
      <h2 className={`${playfair.className} text-4xl mb-12 text-center`}>Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div key={index} className="border border-[#d4af37] p-6 hover:bg-[#d4af37] hover:text-black transition-all">
            <h3 className={`${playfair.className} text-2xl mb-2`}>{project.title}</h3>
            <p className={`${robotoMono.className}`}>{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <h2 className={`${playfair.className} text-4xl mb-6 text-center`}>Contact</h2>
        <form className="space-y-4">
          <input 
            type="text" 
            placeholder="Name" 
            className="w-full p-2 bg-transparent border border-[#d4af37] text-white"
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-2 bg-transparent border border-[#d4af37] text-white"
          />
          <textarea 
            placeholder="Message" 
            rows={4}
            className="w-full p-2 bg-transparent border border-[#d4af37] text-white"
          ></textarea>
          <button 
            type="submit" 
            className="w-full p-2 bg-[#d4af37] text-black hover:bg-white transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  )
}

