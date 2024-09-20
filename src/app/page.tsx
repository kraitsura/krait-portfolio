'use client'
import React, { useEffect, useState } from 'react';
import TransitioningDarkenBg from '@/components/custom/TransitioningDarkenBg';
import styles from '@/styles/fadeIn.module.css';
import NavBar from '@/components/custom/NavBar';
import { getFileNames } from '@/utils/getFileNames';

const IntroPage = () => {
  const [gifs, setGifs] = useState<string[]>([]);

  useEffect(() => {
    const fetchGifs = async () => {
      const fetchedGifs = await getFileNames("public/gifs");
      setGifs(fetchedGifs.map(gif => `/gifs/${gif}`));
    };
    fetchGifs();
  }, []);

  const articleTitle = "the Starving Cat";
  const articleContent = `
    I only recently found out how interesting even the seemingly boring things in life can be.
    This space is a melting pot of all my interests. Something I'm doing to hold myself accountable for my learning journey.
    This repository becomes not only a record of my time on Earth, but of all of the living, even what you and I have faced.
  `;

  return (
    <div className={styles.fadeIn}>
      <TransitioningDarkenBg 
        opener={"Welcome Back"} 
        title={articleTitle} 
        content={articleContent} 
        images={gifs}
        transitionInterval={60000}
      />
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <>
      <NavBar />
      <IntroPage />
    </>
  );
};

export default Home;