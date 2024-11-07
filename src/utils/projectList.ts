// /utils/projects.ts
import { StaticImageData } from 'next/image';
import gameoflifeImage from '../../public/project_img/gameoflife.png';
import moviewebsiteImage from '../../public/project_img/moviewebsite.png';

// Define the structure of a project
export interface Project {
  id: string;
  title: string;
  description: string;
  image: StaticImageData;
  tags: string[];
  contentPath: string;
  date?: string;
  status?: string;
  github?: string;
  content?: string;
  link?: string;
}

// Sample project data
export const projects: Project[] = [
  {
    id: 'gameoflife',
    title: 'Game of Life',
    description: `Interactive, real-time particle simulation that reimagines Conway's Game of Life through the lens of species evolution and emergent behavior.`,
    image: gameoflifeImage,
    tags: ['Automaton', 'Simulation'],
    contentPath: '/projects/gameoflife',
    date: '2024-05-01',
    status: 'Completed',
    github: 'https://github.com/kraitsura/gameOfLife',
  },
  {
    id: 'moviewebsite',
    title: 'Movie Library',
    description: 'A website that allows users to browse and search for movies.',
    image: moviewebsiteImage,
    tags: ['React', 'Next.js', 'Tailwind CSS'],
    contentPath: '/projects/moviewebsite',
    date: '2023-09-01',
    status: 'Completed',
    github: 'https://github.com/kraitsura/MovieHub',
  },
];
