'use client'
import TransitioningDarkenBg from "./TransitioningDarkenBg";
import React from "react";
import styles from "@/styles/fadeIn.module.css";

interface IntroPageProps {
    images: string[];
}


const IntroPage: React.FC<IntroPageProps> = ({ images }) => {
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
          images={images}
        />
      </div>
    );
};

export default IntroPage;