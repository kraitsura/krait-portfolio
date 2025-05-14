import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from '@/utils/projectList';
import { iconMap } from '@/utils/iconMap';
import { Playfair_Display, Roboto_Mono } from 'next/font/google';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}

const playfair = Playfair_Display({ subsets: ['latin'] });
const robotoMono = Roboto_Mono({ subsets: ['latin'] });

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick, isSelected }) => {
  return (
    <motion.div
      layoutId={`project-container-${project.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative aspect-video cursor-pointer group border-2 border-[var(--theme-primary)] project-card-border ${
        isSelected ? 'z-30' : ''
      }`}
    >
      <motion.div 
        layoutId={`project-image-${project.id}`}
        className="absolute inset-0 overflow-hidden"
      >
        <Image 
          src={project.image} 
          alt={project.title} 
          layout="fill" 
          objectFit="cover"
          className=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
      </motion.div>
      
      <motion.div 
        className="absolute top-2 right-2 flex flex-col items-end space-y-2 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: isSelected ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {project.tags.map((tag, tagIndex) => {
          const IconComponent = iconMap[tag];
          return IconComponent ? (
            <div key={tagIndex} className="bg-white bg-opacity-75 rounded-full p-1">
              <IconComponent size={20} />
            </div>
          ) : null;
        })}
      </motion.div>

      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent theme-text p-4"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: isSelected ? 0 : 1, y: isSelected ? 20 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 right-0 bg-[var(--theme-primary)] h-[2px] my-auto" />
          <h3 className={`${playfair.className} text-black text-lg font-semibold relative bg-[var(--theme-primary)] inline-block pr-2`}>
            {project.title}
          </h3>
        </div>
        <p className={`${robotoMono.className} theme-body text-sm`}>{project.description}</p>
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;