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
        router.push("/");
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

      const maxIndex = activeTab === "projects"
        ? projects.length - 1
        : socialLinks.length - 1;

      if (e.key === "j") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === "k") {
        e.preventDefault();
        setIsKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
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
          className={`w-full max-w-[650px] transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <style jsx>{`
            .bear-text {
              font-family: Georgia, "Times New Roman", serif;
              color: #1a1a1a;
              line-height: 1.7;
            }
            .bear-heading {
              font-family: Georgia, "Times New Roman", serif;
              color: #1a1a1a;
              line-height: 1.3;
              margin-bottom: 0.5rem;
            }
            .bear-paragraph {
              margin-bottom: 1.5rem;
            }
            a {
              color: #1a1a1a;
              text-decoration: underline;
              text-underline-offset: 2px;
            }
            a:hover {
              opacity: 0.7;
            }
            .nav-item {
              font-family: Georgia, "Times New Roman", serif;
              color: #1a1a1a;
              cursor: pointer;
              transition: opacity 0.2s ease;
            }
            .nav-item:hover {
              opacity: 0.6;
            }
            .nav-item.active {
              text-decoration: underline;
              text-underline-offset: 3px;
            }
          `}</style>

          {/* Main Content */}
          {activeTab === "about" && (
            <>
              <h1 className="bear-heading text-3xl sm:text-4xl mb-2">hello,</h1>
              <h2 className="bear-heading text-xl sm:text-2xl mb-6 sm:mb-8">
                here I am on paper;
              </h2>

              <div className="bear-text text-base sm:text-lg space-y-4 sm:space-y-6">
                <p className="bear-paragraph">
                  I&apos;m a software engineer who builds things for the web. I
                  care deeply about craft, simplicity, and making tools that
                  feel good to use.
                </p>

                <p className="bear-paragraph">
                  My work spans the entire development cycle, from designing
                  intuitive interfaces to architecting scalable backend systems.
                  What I enjoy building the most are things I can use with my
                  hands.
                </p>

                <p className="bear-paragraph">
                  Feel free to{" "}
                  <a href="mailto:b.aarya.reddy@gmail.com">reach out</a> if you
                  want to chat about projects, ideas, or anything interesting.
                </p>

                <p className="text-sm opacity-60 mt-12">
                  ⇧j/k to navigate, backspace to go back.
                </p>
              </div>
            </>
          )}

          {activeTab === "projects" && (
            <div className="bear-text text-base sm:text-lg">
              <ProjectsIndex
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                isKeyboardNav={isKeyboardNav}
                setIsKeyboardNav={setIsKeyboardNav}
              />
            </div>
          )}

          {activeTab === "socials" && (
            <div className="bear-text text-base sm:text-lg">
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
