// /utils/projects.ts
import projectImagesData from "@/data/project-images.json";

// Define project categories
export type ProjectCategory =
  | "Production Apps"
  | "Productivity Tools"
  | "Creative/Experimental"
  | "Client Projects";

// Define the structure of a project
export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: ProjectCategory;
  date?: string;
  status?: string;
  github?: string;
  content: string;
  link?: string;
}

// Sample project data
export const projects: Project[] = [
  {
    id: "md-pastebin",
    title: "MD Pastebin",
    description: "Markdown pastebin with link generation",
    images: projectImagesData["md-pastebin"],
    tags: ["Next.js", "Rust", "Nginx", "Redis"],
    category: "Productivity Tools",
    status: "Completed",
    github: "https://github.com/kraitsura/md-pastebin",
    content:
      "High-performance markdown pastebin optimized for AI prompts. Rust/Actix backend delivers sub-20ms response times, Next.js frontend provides real-time markdown review, and Redis enables sliding-window TTL expiry. Containerized microservices architecture with Nginx reverse proxy, horizontal scaling, rate limiting, and production-ready security.",
  },
  {
    id: "atoms-tech",
    title: "Atoms",
    description:
      "Requirements management dashboard for req engineers with AI workflows",
    images: projectImagesData["atoms-tech"],
    tags: ["Next.js", "Supabase", "Gumloop"],
    category: "Client Projects",
    status: "Completed",
    link: "https://atoms.tech",
    content:
      "Enterprise requirements management dashboard designed for requirements engineers. Integrates AI workflows via Gumloop to automate documentation tasks, analyze requirements consistency, and generate test scenarios. Built with Next.js and Supabase for a scalable, real-time collaborative environment.",
  },
  {
    id: "colosseum-tech",
    title: "Colosseum",
    description: "Sports CRM purpose built for client",
    images: projectImagesData["colosseum-tech"],
    tags: ["TanStack Start", "Convex", "Clerk", "S3", "Nylas", "Hono"],
    category: "Production Apps",
    status: "In Progress",
    link: "https://thecolosseum.tech",
    content:
      "Custom-built CRM system tailored for sports organizations. Features include athlete management, scheduling, email integration via Nylas, file storage with S3, and authentication through Clerk. Built with modern stack using TanStack Start and Convex for real-time data synchronization.",
  },
  {
    id: "moviewebsite",
    title: "Movie Website",
    description: "Movie library website",
    images: projectImagesData["moviewebsite"],
    tags: ["React"],
    category: "Creative/Experimental",
    date: "2023-09-01",
    status: "Completed",
    link: "https://films.kraitsura.com",
    github: "https://github.com/kraitsura/MovieHub",
    content:
      "A dynamic movie library website built with React. Browse, search, and discover movies with a clean and intuitive interface. Features movie details, ratings, and recommendations powered by external APIs.",
  },
  {
    id: "gameoflife",
    title: "Game of Life Particle Sim",
    description: "Particle simulator with multi-species interaction",
    images: projectImagesData["gameoflife"],
    tags: ["React", "FastAPI", "Nginx"],
    category: "Creative/Experimental",
    date: "2024-05-01",
    status: "In Progress",
    github: "https://github.com/kraitsura/gameOfLife",
    content:
      "An advanced particle simulation system featuring multi-species interactions and emergent behaviors. Built with React for visualization and FastAPI backend for high-performance calculations. Watch as particles interact, reproduce, and evolve based on customizable rules.",
  },
  {
    id: "log-cli",
    title: "Log CLI Tool",
    description: "Simple daylog for personal accountability",
    images: projectImagesData["log-cli"],
    tags: ["Go", "Bubble Tea", "CLI"],
    category: "Productivity Tools",
    status: "In Progress",
    github: "https://github.com/kraitsura/log_cli",
    content:
      "A beautiful command-line day logging tool for personal accountability and reflection. Built with Go and Bubble Tea for an elegant terminal UI. Track daily activities, set goals, and review progress - all from your terminal.",
  },
  {
    id: "glutton-cli",
    title: "Glutton CLI Tool",
    description: "Simple wishlist app to quick store items into wishlist",
    images: projectImagesData["glutton-cli"],
    tags: ["Go", "Bubble Tea", "CLI"],
    category: "Creative/Experimental",
    status: "Coming Soon",
    content:
      "A quick and easy wishlist manager for the command line. Store items you want to buy, track prices, and organize your shopping lists. Built with Go and Bubble Tea for a smooth terminal experience.",
  },
  {
    id: "pomo-cli",
    title: "Pomo CLI Tool",
    description: "First CLI I ever built, simple pomodoro clock",
    images: projectImagesData["pomo-cli"],
    tags: ["Python", "CLI"],
    category: "Productivity Tools",
    status: "Coming Soon",
    content:
      "My first ever CLI tool - a simple but effective Pomodoro timer built with Python. Helps maintain focus and productivity using the Pomodoro Technique with work sessions and breaks tracked right in your terminal.",
  },
  {
    id: "wiin-website",
    title: "Wiin Website",
    description: "Client work, landing page for nicotine pouch",
    images: projectImagesData["wiin-website"],
    tags: ["Next.js"],
    category: "Client Projects",
    status: "Completed",
    link: "https://wiinday.com",
    content:
      "Professional landing page designed and developed for Wiin, a nicotine pouch brand. Features modern design, smooth animations, product showcases, and optimized user experience. Built with Next.js for fast loading and SEO optimization.",
  },
  {
    id: "conduit",
    title: "Conduit",
    description: "Deep session assistant with AI workflows",
    images: projectImagesData["conduit"],
    tags: ["React", "Tauri", "Rust"],
    category: "Productivity Tools",
    status: "In Progress",
    github: "https://github.com/kraitsura/conduit",
    content:
      "A desktop application for deep work sessions enhanced by AI workflows. Built with Tauri and React for a native experience with web technologies. Features AI-powered note-taking, task management, and focus tracking to help you achieve flow state.",
  },
  {
    id: "grimoire",
    title: "Grimoire",
    description: "Prompting library and workspace",
    images: projectImagesData["grimoire"],
    tags: ["React", "Tauri", "Rust"],
    category: "Productivity Tools",
    status: "Coming Soon",
    content:
      "A comprehensive library and workspace for organizing and managing AI prompts. Store, categorize, and quickly access your favorite prompts. Built as a desktop app with Tauri for speed and privacy, keeping your prompts local and secure.",
  },
  {
    id: "delphi",
    title: "Delphi",
    description: "Agentic Event Planning Group Chat",
    images: projectImagesData["delphi"],
    tags: [
      "TanStack Start",
      "Convex",
      "Cloudflare Workers",
      "Durable Objects",
      "Firecrawl",
      "AI",
    ],
    category: "Production Apps",
    link: "https://delphi.kraitsura.com",
    github: "https://github.com/kraitsura/delphi",
    status: "In Progress",
    content:
      "Agentic event planning platform with stateful agents running on Cloudflare Durable Objects. Features a fluid UI system that generates interfaces on-demand by agents, web search agents powered by Firecrawl for finding vendors and venues, and intelligent event coordination. Events are collections of group chats with collaborators, workers, and vendors/venues, where agents plan according to the conversation context.",
  },
  {
    id: "soccer-stats",
    title: "Soccer Stats",
    description:
      "Soccer stats scraped and analyzed live with nice frontend displaying custom analysis",
    images: projectImagesData["soccer-stats"],
    tags: ["Data Science"],
    category: "Production Apps",
    status: "Coming Soon",
    content:
      "Real-time soccer statistics scraper and analyzer with custom visualizations. Live data collection, advanced analytics, and beautiful charts to help understand player and team performance. Currently in development with plans for predictive modeling.",
  },
  {
    id: "rocket-game",
    title: "Rocket Game",
    description: "Three.js rocket game for fun",
    images: projectImagesData["rocket-game"],
    tags: ["Three.js", "Next.js"],
    category: "Creative/Experimental",
    status: "Completed",
    content:
      "A fun 3D rocket game built with Three.js and Next.js. Navigate through space, avoid obstacles, and test your piloting skills. Features physics-based movement, particle effects, and immersive 3D graphics.",
  },
];

// Group projects by category
export const projectsByCategory: Record<ProjectCategory, Project[]> = {
  "Production Apps": projects.filter((p) => p.category === "Production Apps"),
  "Productivity Tools": projects.filter(
    (p) => p.category === "Productivity Tools",
  ),
  "Creative/Experimental": projects.filter(
    (p) => p.category === "Creative/Experimental",
  ),
  "Client Projects": projects.filter((p) => p.category === "Client Projects"),
};

// Order of categories for display
export const categoryOrder: ProjectCategory[] = [
  "Production Apps",
  "Productivity Tools",
  "Creative/Experimental",
  "Client Projects",
];
