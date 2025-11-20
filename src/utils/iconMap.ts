// /utils/iconMap.ts

import {
  Globe, Cpu, Brain, Leaf, BarChart, Recycle, Star, Database,
  Code2, Box, Wrench, Server, Zap, Shield, Cloud,
  Layers, Terminal, Gamepad2, Coffee, Activity, Mail, Webhook,
  Flame, Network, Search
} from 'lucide-react';

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
  'Automaton': Activity,

  // Frontend Frameworks
  'Next.js': Code2,
  'React': Code2,
  'TanStack Start': Layers,
  'Three.js': Gamepad2,
  'Tailwind CSS': Wrench,

  // Backend & Languages
  'Rust': Wrench,
  'Go': Terminal,
  'Python': Terminal,
  'FastAPI': Zap,
  'Hono': Server,

  // Databases & Storage
  'Redis': Database,
  'Supabase': Database,
  'Convex': Database,
  'S3': Cloud,

  // Infrastructure
  'Nginx': Server,
  'Tauri': Box,
  'Cloudflare Workers': Cloud,
  'Durable Objects': Network,

  // Auth & Services
  'Clerk': Shield,
  'Nylas': Mail,
  'Gumloop': Webhook,
  'Firecrawl': Search,

  // CLI & Tools
  'Bubble Tea': Coffee,
  'CLI': Terminal,
};
