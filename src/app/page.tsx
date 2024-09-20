import React from 'react';
import fs from 'fs';
import path from 'path';
import NavBar from '@/components/custom/NavBar';
import IntroPage from '@/components/custom/IntroPage';

function getGifPaths(): string[] {
  const gifsDirectory = path.join(process.cwd(), 'public', 'gifs');
  
  try {
    // Read the contents of the directory
    const files = fs.readdirSync(gifsDirectory);
    
    // Filter for .gif files and create full paths
    const gifPaths = files
      .filter(file => path.extname(file).toLowerCase() === '.gif')
      .map(file => `/gifs/${file}`);
    
    return gifPaths;
  } catch (error) {
    console.error('Error reading gifs directory:', error);
    return [];
  }
}

const gifPaths = getGifPaths();

const Home: React.FC = () => {
  return (
    <>
      <NavBar />
      <IntroPage images={gifPaths}/>
    </>
  );
};

export default Home;