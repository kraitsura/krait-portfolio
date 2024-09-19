// pages/index.tsx
'use client'
import React, { useEffect, useState } from 'react';
import DarkenBg from '@/components/custom/DarkenBg';
import styles from '@/styles/fadeIn.module.css'; 
import NavBar from '@/components/custom/NavBar';
import waterfall from '@/assets/public/gifs/waterfall.gif';
import ray from '@/assets/public/gifs/ray.gif';
import dragon from '@/assets/public/gifs/dragon.gif';

const IntroPage = () => {
  const articleTitle = "the Starving Cat";
  const articleContent = `
  I only recently found out how interesting even the seemingly boring things in life can be.   
  
  This space is a melting pot of all my interests. Something I'm doing to hold myself accountable for my learning journey. 
  
  This repository becomes not merely a record of my time on Earth, but of all the living you and I face. 
  `;

  const gifs = [waterfall, ray, dragon];

  const [currentGif, setCurrentGif] = useState(gifs[2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGif((prevGif) => {
        const currentIndex = gifs.indexOf(prevGif);
        const nextIndex = (currentIndex + 1) % gifs.length;
        return gifs[nextIndex];
      });
    }, 300000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.fadeIn}>
      <NavBar />
      <DarkenBg opener={"Welcome Back"} title={articleTitle} content={articleContent} image={currentGif} />
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <>
      <IntroPage />
    </>
  );
};

export default Home;
