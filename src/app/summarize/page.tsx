"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProjectsIndex from "@/components/custom/ProjectsIndex";
import SocialsIndex from "@/components/custom/SocialsIndex";
import { projects } from "@/utils/projectList";

type TabType = "about" | "projects" | "socials";

const socialLinks = [
  { name: "github", url: "https://github.com/kraitsura" },
  { name: "linkedin", url: "https://linkedin.com/in/baaryareddy" },
  { name: "x", url: "https://x.com/kraitsura" },
];

export default function SummarizePage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  // Initialize active tab from URL param or default to "about"
  const tabParam = searchParams.get("tab");
  const initialTab: TabType =
    tabParam === "projects" || tabParam === "socials" ? tabParam : "about";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const tabs: TabType[] = ["about", "projects", "socials"];

  // Reset selected index when tab changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [activeTab]);

  useEffect(() => {
    // Trigger fade-in after flash bang completes (500ms delay)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        // If on projects or socials, go back to about
        if (activeTab === "projects" || activeTab === "socials") {
          setActiveTab("about");
        } else {
          // If on about, go back to home
          router.push("/");
        }
        return;
      }

      // Shift+j/k for tab navigation
      if (e.shiftKey && (e.key === "J" || e.key === "K")) {
        e.preventDefault();
        const currentIndex = tabs.indexOf(activeTab);
        if (e.key === "J") {
          const nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
          setActiveTab(tabs[nextIndex]);
        } else if (e.key === "K") {
          const prevIndex = Math.max(currentIndex - 1, 0);
          setActiveTab(tabs[prevIndex]);
        }
        return;
      }

      // j/k navigation only works in projects and socials tabs
      if (activeTab === "about") return;

      const maxIndex =
        activeTab === "projects" ? projects.length - 1 : socialLinks.length - 1;

      if (e.key === "j") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === "k") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Only regular Enter (not Shift+Enter) opens projects/socials
        e.preventDefault();
        if (activeTab === "projects") {
          router.push(`/projects/${projects[selectedIndex].id}?from=summarize`);
        } else if (activeTab === "socials") {
          window.open(socialLinks[selectedIndex].url, "_blank");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, activeTab, selectedIndex]);

  return (
    <div className="h-screen overflow-hidden bg-[#FFFBF0] px-4 sm:px-6 py-16 sm:py-20">
      {/* Sidebar Navigation - Mobile: in flow, Desktop: fixed to viewport */}
      <nav
        suppressHydrationWarning
        className={`flex flex-col gap-2 mb-8 lg:mb-0 lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:left-[calc(50%-325px-100px)] transition-all duration-700 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left text-sm text-[#1a1a1a] hover:opacity-60 transition-opacity ${
              activeTab === tab ? "underline underline-offset-[3px]" : ""
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex justify-center">
        <div
          suppressHydrationWarning
          className={`w-full max-w-[650px] transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {/* Main Content */}
          {activeTab === "about" && (
            <>
              <h1
                className="text-3xl sm:text-4xl mb-2 text-[#1a1a1a] leading-[1.3]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                hello,
              </h1>
              <h2
                className="text-xl sm:text-2xl mb-6 sm:mb-8 text-[#1a1a1a] leading-[1.3]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                here I am on paper;
              </h2>

              <div
                className="text-base sm:text-lg space-y-4 sm:space-y-6 text-[#1a1a1a] leading-[1.7]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <p className="mb-6">
                  I build software that feels good to use, from agentic event
                  planning systems to high-performance tools that respond in
                  under 20ms. Most of my time goes into production apps like
                  Colosseum (an agentic CRM I'm building with TanStack Start)
                  and Delphi (group chat event coordination with stateful agents
                  over Cloudflare Durable Objects).
                </p>

                <p className="mb-6">
                  I also make tools I actually use: CLIs for day logging and
                  deep work tracking, desktop apps for AI workflows, and
                  utilities like pastebins. I like projects where performance
                  matters, where the interface disappears, and where I'm solving
                  problems I have myself. Right now I'm particularly interested
                  in agentic systems, real-time data processing, and tinkering
                  on the next generation frontend interface for the age of
                  intelligence.
                </p>

                <p className="mb-6">
                  Feel free to{" "}
                  <a
                    href="mailto:b.aarya.reddy@gmail.com"
                    className="text-[#1a1a1a] underline underline-offset-[2px] hover:opacity-70 transition-opacity"
                  >
                    reach out
                  </a>{" "}
                  if you want to chat about projects, ideas, or work
                  opportunites.
                </p>

                <p className="text-sm opacity-60 mt-12">
                  ⇧j/k to navigate tabs, j/k/↑↓ for projects, h/l/←→ for sections, ↵ to open, backspace to go back.
                </p>
              </div>
            </>
          )}

          {activeTab === "projects" && (
            <div
              className="text-base sm:text-lg text-[#1a1a1a] leading-[1.7]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <ProjectsIndex
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                isKeyboardNav={isKeyboardNav}
                setIsKeyboardNav={setIsKeyboardNav}
              />
            </div>
          )}

          {activeTab === "socials" && (
            <div
              className="text-base sm:text-lg text-[#1a1a1a] leading-[1.7]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <SocialsIndex
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                isKeyboardNav={isKeyboardNav}
                setIsKeyboardNav={setIsKeyboardNav}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
