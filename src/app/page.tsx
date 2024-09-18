// pages/index.tsx
import React, { useEffect, useState } from 'react';
import DarkenBg from '@/components/custom/DarkenBg';
import styles from '@/styles/fadeIn.module.css'; 
import NavBar from '@/components/custom/NavBar';

const ArticlePage = () => {
  const articleTitle = "The Future of Web Development";
  const articleContent = `
    Web development is constantly evolving, with new technologies and frameworks emerging every year. As we look to the future, several trends are shaping the landscape of web development.

    First, the rise of JAMstack architecture is changing how we build and deploy websites. By decoupling the frontend from the backend, JAMstack offers improved performance, better security, and easier scalability.

    Another significant trend is the increasing importance of Progressive Web Apps (PWAs). These web applications provide a native app-like experience, complete with offline functionality and push notifications, blurring the line between web and mobile apps.

    Artificial Intelligence and Machine Learning are also making their way into web development. From chatbots to personalized user experiences, AI is enhancing how we interact with websites and web applications.

    As we move forward, the focus on accessibility and inclusive design will continue to grow. Developers will need to ensure their websites are usable by people with a wide range of abilities and disabilities.

    Lastly, the advent of 5G technology will open up new possibilities for web applications, enabling faster load times and more complex, data-intensive features.

    In conclusion, the future of web development is exciting and full of possibilities. As developers, it's crucial to stay adaptable and continue learning to keep up with these evolving trends.
  `;

  return (
    <div className={styles.fadeIn}>
      <NavBar />
      <DarkenBg title={articleTitle} content={articleContent} />
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <>
      <ArticlePage />
    </>
  );
};

export default Home;
