import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from '@/utils/projectList';
import { iconMap } from '@/utils/iconMap';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick, isSelected }) => {
  return (
    <motion.div
      layoutId={`project-container-${project.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative aspect-video cursor-pointer group ${isSelected ? 'z-30' : ''}`}
    >
      <motion.div 
        layoutId={`project-image-${project.id}`}
        className="absolute inset-0 rounded-lg overflow-hidden"
      >
        <Image 
          src={project.image} 
          alt={project.title} 
          layout="fill" 
          objectFit="cover" 
          className="rounded-lg"
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
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-4"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: isSelected ? 0 : 1, y: isSelected ? 20 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="text-sm">{project.description}</p>
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;