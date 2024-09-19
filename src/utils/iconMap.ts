// /utils/iconMap.ts

import { Globe, Cpu, Brain, Leaf, BarChart, Recycle, Star, Database } from 'lucide-react';

// Icon mapping for project tags
export const iconMap: { [key: string]: React.ElementType } = {
  'Quantum': Cpu,
  'AI': Brain,
  'Simulation': Globe,
  'Neuroscience': Brain,
  'Machine Learning': Cpu,
  'Environment': Leaf,
  'Data Science': BarChart,
  'Sustainability': Recycle,
  'Astronomy': Star,
  'Big Data': Database,
};
