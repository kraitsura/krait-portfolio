"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProjectsIndex from "@/components/custom/ProjectsIndex";
import SocialsIndex from "@/components/custom/SocialsIndex";
import { projects } from "@/utils/projectList";

type TabType = "about" | "projects" | "socials";
type FocusArea = "menu" | "content";

const socialLinks = [
  { name: "github", url: "https://github.com/kraitsura" },
  { name: "linkedin", url: "https://linkedin.com/in/baaryareddy" },
  { name: "x", url: "https://x.com/kraitsura" },
];

const tabs: TabType[] = ["about", "projects", "socials"];

function SummarizeContent() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);
  const [focusArea, setFocusArea] = useState<FocusArea>("menu");

  // Initialize active tab from URL param or default to "about"
  const tabParam = searchParams.get("tab");
  const initialTab: TabType =
    tabParam === "projects" || tabParam === "socials" ? tabParam : "about";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Reset selected index and focus when tab changes
  useEffect(() => {
    setSelectedIndex(0);
    // Reset focus to menu when switching tabs
    setFocusArea("menu");
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
        // If focus is on content, go back to menu
        if (focusArea === "content") {
          setFocusArea("menu");
          return;
        }
        // If on projects or socials, go back to about
        if (activeTab === "projects" || activeTab === "socials") {
          setActiveTab("about");
        } else {
          // If on about, go back to home
          router.push("/");
        }
        return;
      }

      // h/l for horizontal navigation
      if (e.key === "h" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeTab === "projects") {
          // Switch focus to menu (content -> menu)
          if (focusArea === "content") {
            setFocusArea("menu");
          }
        } else if (activeTab === "socials" && focusArea === "content") {
          // Navigate socials horizontally
          setIsKeyboardNav(true);
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        }
        return;
      }

      if (e.key === "l" || e.key === "ArrowRight") {
        e.preventDefault();
        if (activeTab === "projects") {
          // Switch focus to content (menu -> content)
          if (focusArea === "menu") {
            setFocusArea("content");
          }
        } else if (activeTab === "socials" && focusArea === "content") {
          // Navigate socials horizontally
          setIsKeyboardNav(true);
          setSelectedIndex((prev) => Math.min(prev + 1, socialLinks.length - 1));
        }
        return;
      }

      // j/k for vertical navigation (menu items or content depending on focus)
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        if (focusArea === "menu") {
          // Navigate menu items
          const currentIndex = tabs.indexOf(activeTab);
          const nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
          setActiveTab(tabs[nextIndex]);
        }
        // Note: j/k in content area for projects is handled by ProjectsIndex
        return;
      }

      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        if (focusArea === "menu") {
          // Navigate menu items
          const currentIndex = tabs.indexOf(activeTab);
          const prevIndex = Math.max(currentIndex - 1, 0);
          setActiveTab(tabs[prevIndex]);
        }
        // Note: j/k in content area for projects is handled by ProjectsIndex
        return;
      }

      // Enter handling
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (focusArea === "menu") {
          // If on a tab that has content, focus into it
          if (activeTab === "projects" || activeTab === "socials") {
            setFocusArea("content");
          }
        } else if (focusArea === "content") {
          if (activeTab === "projects") {
            router.push(`/projects/${projects[selectedIndex].id}?from=summarize`);
          } else if (activeTab === "socials") {
            window.open(socialLinks[selectedIndex].url, "_blank");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, activeTab, selectedIndex, focusArea]);

  return (
    <div className="h-screen overflow-y-auto bg-[#FFFBF0] px-4 sm:px-6 py-16 sm:py-20">
      {/* Sidebar Navigation - Mobile: sticky at top, Desktop: fixed to viewport */}
      <nav
        suppressHydrationWarning
        className={`sticky top-0 z-10 bg-[#FFFBF0] pb-4 flex flex-col gap-2 mb-8 lg:mb-0 lg:pb-0 lg:bg-transparent lg:static lg:fixed lg:top-1/2 lg:-translate-y-1/2 lg:left-[calc(50%-325px-100px)] transition-all duration-700 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        } ${focusArea === "menu" ? "lg:border-l-2 lg:border-[#1a1a1a] lg:pl-2" : ""}`}
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setFocusArea("menu");
            }}
            className={`text-left text-sm text-[#1a1a1a] hover:opacity-60 transition-all duration-200 ${
              activeTab === tab ? "underline underline-offset-[3px]" : ""
            } ${activeTab === tab && focusArea === "menu" ? "translate-x-1" : ""}`}
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
                  planning systems to high-performance tools. Most of my time
                  goes into production apps like Colosseum (an agentic CRM
                  I&apos;m building with TanStack Start) and Delphi (group chat
                  event coordination with stateful agents over Cloudflare
                  Durable Objects).
                </p>

                <p className="mb-6">
                  I also make tools I actually use: CLIs for day logging and
                  deep work tracking, desktop apps for AI workflows, and
                  utilities like pastebins. I like projects where performance
                  matters, where the interface disappears, and where I&apos;m solving
                  problems I have myself. Right now I&apos;m particularly interested
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
              </div>
            </>
          )}

          {activeTab === "projects" && (
            <>
              <div
                className="text-base sm:text-lg text-[#1a1a1a] leading-[1.7]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <ProjectsIndex
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                  isKeyboardNav={isKeyboardNav}
                  setIsKeyboardNav={setIsKeyboardNav}
                  isFocused={focusArea === "content"}
                />
              </div>
              <div
                className="text-sm opacity-60 mt-8 text-center"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <p>
                  j/k nav menu, h/l switch focus, ↵ select, backspace back
                </p>
              </div>
            </>
          )}

          {activeTab === "socials" && (
            <>
              <div
                className="text-base sm:text-lg text-[#1a1a1a] leading-[1.7]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <SocialsIndex
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                  isKeyboardNav={isKeyboardNav}
                  setIsKeyboardNav={setIsKeyboardNav}
                  isFocused={focusArea === "content"}
                />
              </div>
              <div
                className="text-sm opacity-60 mt-8 text-center"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <p>
                  j/k nav menu, h/l nav socials, ↵ open, backspace back
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummarizePage() {
  return (
    <Suspense fallback={<div className="h-screen overflow-hidden bg-[#FFFBF0]" />}>
      <SummarizeContent />
    </Suspense>
  );
}
