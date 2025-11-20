"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import IntroPage from "@/components/custom/IntroPage";

const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        // Prevent default only if not in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && !target.isContentEditable) {
          e.preventDefault();
          router.push("/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      <IntroPage image="/gifs/skyscrape.webm" />
    </>
  );
};

export default Home;