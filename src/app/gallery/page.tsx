// app/gallery/page.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';
import { GalleryPage } from '@/components/custom/GalleryPage';
import { ImageData } from '@/components/custom/GalleryImage';
import styles from '@/styles/fadeIn.module.css';

interface ImageInfo extends Omit<ImageData, 'src'> {
  id: number;
  filename: string;
}

const imageInfoList: ImageInfo[] = [
  { 
    id: 1,
    filename: 'friends',
    title: 'We use design and technology to create brands and products', 
    subtitle: 'that perform, delight, and scale.',
    position: 'left',
    textPosition: 'bottom'
  },
  { 
    id: 2,
    filename: 'rocks',
    title: 'Luxury stretch knitwear, now available online', 
    subtitle: 'High Sport',
    position: 'right',
    textPosition: 'top'
  },
  { 
    id: 3,
    filename: 'bridge',
    title: 'Two studios, one mindset', 
    subtitle: 'Automatik VFX / Post Republic',
    position: 'center-left',
    textPosition: 'right'
  },
  { 
    id: 4,
    filename: 'desert',
    title: 'Telling the story of a life-altering disease through data', 
    subtitle: '1,574 Days: My Life With Long Covid',
    position: 'left',
    textPosition: 'right'
  },
];

function getGalleryImages(): ImageData[] {
  const imageFolder = path.join(process.cwd(), 'public', 'gallery_img');
  const files = fs.readdirSync(imageFolder);
  
  const images = files
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .map(file => {
      const baseName = path.basename(file, path.extname(file));
      const matchingInfo = imageInfoList.find(info => info.filename === baseName);
      return matchingInfo ? {
        ...matchingInfo,
        src: `/gallery_img/${file}`
      } : null;
    })
    .filter((image): image is ImageInfo & { src: string } => image !== null)
    .sort((a, b) => (a as ImageInfo).id - (b as ImageInfo).id);  // Sort by id

  return images;
}

export default function Gallery() {
  const images = getGalleryImages();
  return (
    <div className={styles.fadeIn}>
      < GalleryPage images={images} />
    </div>
  );  
};