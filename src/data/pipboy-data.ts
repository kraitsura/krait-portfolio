export interface SkillItem {
  name: string;
  level: string;
  percentage: number;
}

export interface SkillDetails {
  skill1: SkillItem[];
  skill2: SkillItem[];
  skill3: SkillItem[];
  skill4: SkillItem[];
  skill5: SkillItem[];
}

export const skillDetails: SkillDetails = {
  skill1: [
    { name: "JavaScript/TypeScript", level: "Proficient", percentage: 70 },
    { name: "Python", level: "Intermediate", percentage: 55 },
    { name: "Java", level: "Intermediate", percentage: 50 },
    { name: "Go", level: "Learning", percentage: 40 },
    { name: "SQL", level: "Intermediate", percentage: 60 },
    { name: "Rust", level: "Learning", percentage: 30 },
  ],
  skill2: [
    { name: "React & Next.js", level: "Proficient", percentage: 75 },
    { name: "Tailwind CSS", level: "Proficient", percentage: 70 },
    { name: "Zustand/Redux", level: "Intermediate", percentage: 60 },
    { name: "TanStack Tools", level: "Intermediate", percentage: 55 },
    { name: "Vue.js", level: "Learning", percentage: 45 },
    { name: "Tauri", level: "Learning", percentage: 40 },
  ],
  skill3: [
    { name: "Node.js/Express", level: "Proficient", percentage: 70 },
    { name: "REST & GraphQL APIs", level: "Proficient", percentage: 65 },
    { name: "FastAPI", level: "Intermediate", percentage: 55 },
    { name: "tRPC", level: "Intermediate", percentage: 50 },
    { name: "Spring Boot", level: "Learning", percentage: 40 },
    { name: "WebSockets", level: "Intermediate", percentage: 50 },
  ],
  skill4: [
    { name: "PostgreSQL", level: "Intermediate", percentage: 65 },
    { name: "MongoDB", level: "Intermediate", percentage: 60 },
    { name: "Redis", level: "Intermediate", percentage: 55 },
    { name: "Supabase", level: "Intermediate", percentage: 60 },
    { name: "Drizzle ORM", level: "Intermediate", percentage: 65 },
    { name: "Elasticsearch", level: "Learning", percentage: 35 },
  ],
  skill5: [
    { name: "AWS (S3, Lambda, EC2)", level: "Intermediate", percentage: 55 },
    { name: "Docker & Kubernetes", level: "Intermediate", percentage: 50 },
    { name: "Vercel & Netlify", level: "Proficient", percentage: 70 },
    { name: "GitHub Actions", level: "Intermediate", percentage: 60 },
    { name: "Nginx", level: "Learning", percentage: 45 },
    { name: "Cloudflare", level: "Intermediate", percentage: 50 },
  ],
};

export const dragonArt = [
  "   ⣴⣶⣤⡤⠦⣤⣀⣤⠆     ⣈⣭⣿⣶⣿⣦⣼⣆          ",
  "    ⠉⠻⢿⣿⠿⣿⣿⣶⣦⠤⠄⡠⢾⣿⣿⡿⠋⠉⠉⠻⣿⣿⡛⣦       ",
  "          ⠈⢿⣿⣟⠦ ⣾⣿⣿⣷     ⠻⠿⢿⣿⣧⣄     ",
  "           ⣸⣿⣿⢧ ⢻⠻⣿⣿⣷⣄⣀⠄⠢⣀⡀⠈⠙⠿⠄    ",
  "          ⢠⣿⣿⣿⠈    ⣻⣿⣿⣿⣿⣿⣿⣿⣛⣳⣤⣀⣀   ",
  "   ⢠⣧⣶⣥⡤⢄ ⣸⣿⣿⠘  ⢀⣴⣿⣿⡿⠛⣿⣿⣧⠈⢿⠿⠟⠛⠻⠿⠄  ",
  "  ⣰⣿⣿⠛⠻⣿⣿⡦⢹⣿⣷   ⢊⣿⣿⡏  ⢸⣿⣿⡇ ⢀⣠⣄⣾⠄   ",
  " ⣠⣿⠿⠛ ⢀⣿⣿⣷⠘⢿⣿⣦⡀ ⢸⢿⣿⣿⣄ ⣸⣿⣿⡇⣪⣿⡿⠿⣿⣷⡄  ",
  " ⠙⠃   ⣼⣿⡟  ⠈⠻⣿⣿⣦⣌⡇⠻⣿⣿⣷⣿⣿⣿ ⣿⣿⡇ ⠛⠻⢷⣄ ",
  "      ⢻⣿⣿⣄   ⠈⠻⣿⣿⣿⣷⣿⣿⣿⣿⣿⡟ ⠫⢿⣿⡆     ",
  "       ⠻⣿⣿⣿⣿⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⡟⢀⣀⣤⣾⡿⠃     ",
].join("\n");
