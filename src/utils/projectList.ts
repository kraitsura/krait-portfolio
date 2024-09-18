// /utils/projects.ts
import { StaticImageData } from 'next/image';
import quantumImage from '@/assets/public/images/SEI_150779771.jpg';

// Define the structure of a project
export interface Project {
    id: string;
    title: string;
    description: string;
    image: StaticImageData;
    tags: string[];
  }
  
  // Sample project data
  export const projects: Project[] = [
    {
      id: 'quantam',
      title: 'Quantum Resonance',
      description: 'Exploring the frontiers of quantum computing with advanced algorithms and simulations.',
      image: quantumImage,
      tags: ['Quantum', 'AI', 'Simulation'],
    },
    {
      id: 'nueral',
      title: 'Neural Nexus',
      description: 'Revolutionizing AI with biomimetic neural networks inspired by the human brain.',
      image: quantumImage,
      tags: ['AI', 'Neuroscience', 'Machine Learning'],
    },
    {
      id: 'eco',
      title: 'Eco Sphere',
      description: 'Pioneering sustainable ecosystem modeling for predictive environmental science.',
      image: quantumImage,
      tags: ['Environment', 'Data Science', 'Sustainability'],
    },
    {
      id: 'stellar',
      title: 'Stellar Cartography',
      description: 'Mapping the cosmos with unprecedented detail using advanced space telescopes and AI.',
      image: quantumImage,
      tags: ['Astronomy', 'AI', 'Big Data'],
    },
  ];
  