"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SummarizePage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Trigger fade-in after flash bang completes (500ms delay)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Handle backspace key to navigate back to home
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        router.push("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
      <div
        className={`max-w-[650px] w-full transition-all duration-700 ease-out ${
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
        `}</style>

        <h1 className="bear-heading text-3xl sm:text-4xl mb-2">hello,</h1>
        <h2 className="bear-heading text-xl sm:text-2xl mb-6 sm:mb-8">
          here I am on paper;
        </h2>

        <div className="bear-text text-base sm:text-lg space-y-4 sm:space-y-6">
          <p className="bear-paragraph">
            I&apos;m a software engineer who builds things for the web. I care deeply
            about craft, simplicity, and making tools that feel good to use.
          </p>

          <p className="bear-paragraph">
            My work spans the entire development cycle, from designing intuitive
            interfaces to architecting scalable backend systems. What I enjoy
            building the most are things I can use with my hands.
          </p>

          <p className="bear-paragraph">
            Feel free to <a href="mailto:b.aarya.reddy@gmail.com">reach out</a>{" "}
            if you want to chat about projects, ideas, or anything interesting.
          </p>

          <p className="text-sm opacity-60 mt-12">
            You can go back by clicking the header links above, or just pressing
            backspace.
          </p>
        </div>
      </div>
    </div>
  );
}
