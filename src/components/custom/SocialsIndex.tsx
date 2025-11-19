"use client";

const socialLinks = [
  {
    name: "github",
    url: "https://github.com/kraitsura",
  },
  {
    name: "linkedin",
    url: "https://linkedin.com/in/baaryareddy",
  },
  {
    name: "x",
    url: "https://x.com/kraitsura",
  },
];

interface SocialsIndexProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  isKeyboardNav: boolean;
  setIsKeyboardNav: (value: boolean) => void;
}

export default function SocialsIndex({
  selectedIndex,
  setSelectedIndex,
  isKeyboardNav,
  setIsKeyboardNav,
}: SocialsIndexProps) {
  const handleMouseEnter = (index: number) => {
    if (!isKeyboardNav) {
      setSelectedIndex(index);
    }
  };

  const handleMouseMove = () => {
    if (isKeyboardNav) {
      setIsKeyboardNav(false);
    }
  };

  return (
    <div className="flex justify-center pt-[30vh] lg:pt-[40vh]" onMouseMove={handleMouseMove}>
      <div className="flex gap-6">
        {socialLinks.map((social, index) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => handleMouseEnter(index)}
            className={`transition-all ${
              index === selectedIndex
                ? "opacity-100 underline underline-offset-4"
                : "opacity-50"
            }`}
          >
            {social.name}
          </a>
        ))}
      </div>
    </div>
  );
}
