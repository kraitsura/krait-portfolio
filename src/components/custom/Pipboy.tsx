import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "@/styles/pip.module.scss";
import { useTouchDevice } from "@/contexts/TouchContext";

interface PipboyProps {
  isActive?: boolean;
  onScrollToSocials?: () => void;
}

const Pipboy: React.FC<PipboyProps> = ({ isActive = true, onScrollToSocials }) => {
  const { isTouchDevice } = useTouchDevice();
  const [activeTab, setActiveTab] = useState("items");
  const [color, setColor] = useState("amber");
  const [browser, setBrowser] = useState("chrome");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const skillsSectionRef = useRef<HTMLDivElement>(null);

  const colorOptions = useMemo(
    () => ["amber", "white", "green", "blue", "red"],
    [],
  );

  useEffect(() => {
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setBrowser(isSafari ? "safari" : "chrome");
  }, []);

  useEffect(() => {
    // Only attach mouse listener when Pipboy is active (not when Dashboard is showing)
    if (!isActive) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const frame = document.querySelector(`.${styles.frame}`);
        if (frame) {
          const rect = frame.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setCursorPosition({ x, y });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, color]);

  useEffect(() => {
    // Remove all color classes from html element
    const htmlElement = document.documentElement;
    const colorClasses = ["amber", "white", "green", "blue", "red"];
    colorClasses.forEach((c) => htmlElement.classList.remove(c));

    // Add the new color class
    htmlElement.classList.add(color);
  }, [color]);

  // Keyboard navigation with j/k for scrolling and h/l for tabs
  useEffect(() => {
    // Only attach keyboard listener when Pipboy is active (not when Dashboard is showing)
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if shift key is pressed (to allow Shift+J/K for page scrolling)
      if (e.shiftKey) return;

      const scrollAmount = 50;
      const tabs = ["items", "stats", "quests", "misc"];
      const currentIndex = tabs.indexOf(activeTab);

      // Settings tab - j/k for navigation, Enter to select
      if (activeTab === "misc") {
        if (e.key === "j") {
          e.preventDefault();
          setSelectedColorIndex((prev) => (prev + 1) % colorOptions.length);
        } else if (e.key === "k") {
          e.preventDefault();
          setSelectedColorIndex(
            (prev) => (prev - 1 + colorOptions.length) % colorOptions.length,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          setColor(colorOptions[selectedColorIndex]);
        }
      }
      // Other tabs - j/k for scrolling
      else if (e.key === "j" && activeTab !== "items") {
        e.preventDefault();
        // Scroll skills section if on quests tab, otherwise scroll main content
        if (activeTab === "quests" && skillsSectionRef.current) {
          skillsSectionRef.current.scrollBy({
            top: scrollAmount,
            behavior: "smooth",
          });
        } else if (tabContentRef.current) {
          tabContentRef.current.scrollBy({
            top: scrollAmount,
            behavior: "smooth",
          });
        }
      } else if (e.key === "k" && activeTab !== "items") {
        e.preventDefault();
        // Scroll skills section if on quests tab, otherwise scroll main content
        if (activeTab === "quests" && skillsSectionRef.current) {
          skillsSectionRef.current.scrollBy({
            top: -scrollAmount,
            behavior: "smooth",
          });
        } else if (tabContentRef.current) {
          tabContentRef.current.scrollBy({
            top: -scrollAmount,
            behavior: "smooth",
          });
        }
      }

      // h/l for tab navigation (works on all tabs)
      if (e.key === "h") {
        e.preventDefault();
        const prevIndex =
          currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        setActiveTab(tabs[prevIndex]);
      } else if (e.key === "l") {
        e.preventDefault();
        const nextIndex =
          currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        setActiveTab(tabs[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, activeTab, selectedColorIndex, colorOptions]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    // Update selectedColorIndex to match clicked color
    const index = colorOptions.indexOf(e.target.value);
    if (index !== -1) {
      setSelectedColorIndex(index);
    }
  };

  // Get keystroke info based on active tab
  const getKeystrokeInfo = () => {
    switch (activeTab) {
      case "items":
        return "h/l: Tabs";
      case "stats":
        return "h/l: Tabs | j/k: Scroll";
      case "quests":
        return "h/l: Tabs | j/k: Scroll";
      case "misc":
        return "h/l: Tabs | j/k: Nav | ⏎: Select";
      default:
        return "h/l: Tabs";
    }
  };

  const skillDetails = {
    skill1: [
      { name: "React", level: "Journeyman", percentage: 25 },
      { name: "TypeScript", level: "Journeyman", percentage: 28 },
      { name: "Next.js", level: "Apprentice", percentage: 18 },
      { name: "Vue", level: "Apprentice", percentage: 15 },
      { name: "TanStack Start", level: "Apprentice", percentage: 12 },
      { name: "Tauri", level: "Apprentice", percentage: 20 },
    ],
    skill2: [
      { name: "Python", level: "Apprentice", percentage: 22 },
      { name: "FastAPI", level: "Apprentice", percentage: 17 },
      { name: "Java", level: "Apprentice", percentage: 19 },
      { name: "Spring Boot", level: "Apprentice", percentage: 14 },
      { name: "Go", level: "Apprentice", percentage: 16 },
      { name: "Rust", level: "Apprentice", percentage: 11 },
    ],
    skill3: [
      { name: "Supabase", level: "Apprentice", percentage: 24 },
      { name: "Convex", level: "Apprentice", percentage: 21 },
      { name: "Elasticsearch", level: "Apprentice", percentage: 13 },
      { name: "Redis", level: "Apprentice", percentage: 18 },
      { name: "S3", level: "Apprentice", percentage: 26 },
    ],
    skill4: [
      { name: "Docker", level: "Apprentice", percentage: 23 },
      { name: "Nginx", level: "Apprentice", percentage: 15 },
      { name: "CloudFront", level: "Apprentice", percentage: 19 },
      { name: "Hetzner VPS", level: "Apprentice", percentage: 12 },
    ],
  };

  const dragonArt = [
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

  return (
    <div
      className={`${styles["pipboy-global"]} ${styles[color]} ${styles[browser]}`}
    >
      <div className={`${styles.frame} ${styles.noclick}`}>
        <div className={`${styles.piece} ${styles.output} ${styles.filter}`}>
          <div className={styles.pipboy}>
            {/* Footer Navigation */}
            <ul className={styles["pip-foot"]}>
              <li className={activeTab === "items" ? styles.active : ""}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("items");
                  }}
                >
                  Status
                </a>
              </li>
              <li className={activeTab === "stats" ? styles.active : ""}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("stats");
                  }}
                >
                  Stats
                </a>
              </li>
              <li className={activeTab === "quests" ? styles.active : ""}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("quests");
                  }}
                >
                  Skills
                </a>
              </li>
              <li className={activeTab === "misc" ? styles.active : ""}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("misc");
                  }}
                >
                  Settings
                </a>
              </li>
              {isTouchDevice && (
                <li className={activeTab === "socials" ? styles.active : ""}>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("socials");
                      onScrollToSocials?.();
                    }}
                  >
                    Socials
                  </a>
                </li>
              )}
            </ul>

            <div
              ref={tabContentRef}
              className={styles["tab-content"]}
              style={{
                overflowY: activeTab === "items" ? "hidden" : "auto",
              }}
            >
              {/* Main View Tab */}
              {activeTab === "items" && (
                <div id="items">
                  <div className={styles["pip-body"]}>
                    <div className={styles["dragon-container"]}>
                      <div className="vboy">
                        {dragonArt.split("\n").map((line, index) => (
                          <pre key={index} className={styles.asciiLine}>
                            {line}
                          </pre>
                        ))}
                      </div>
                      <div className={styles["dragon-text"]}>
                        <p>Engineer</p>
                        <p>the tinkering kind</p>
                      </div>
                    </div>

                    <div className={styles["status-info"]}>
                      <div className={styles["level-display"]}>
                        <span className={styles["level-label"]}>Level</span>
                        <span className={styles["level-value"]}>I</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === "stats" && (
                <div id="stats">
                  <h3 className={styles["pip-title"]}>S.P.E.C.I.A.L</h3>
                  <div className={styles["pip-body"]}>
                    <div className={styles["status-info"]}>
                      <div className={styles["attributes-grid"]}>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>Strength</span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "50%" }}
                            ></div>
                            <span className={styles["attr-value"]}>5</span>
                          </div>
                        </div>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>
                            Perception
                          </span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "60%" }}
                            ></div>
                            <span className={styles["attr-value"]}>9</span>
                          </div>
                        </div>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>
                            Endurance
                          </span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "50%" }}
                            ></div>
                            <span className={styles["attr-value"]}>5</span>
                          </div>
                        </div>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>Charisma</span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "70%" }}
                            ></div>
                            <span className={styles["attr-value"]}>10</span>
                          </div>
                        </div>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>
                            Intelligence
                          </span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "80%" }}
                            ></div>
                            <span className={styles["attr-value"]}>8</span>
                          </div>
                        </div>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>Agility</span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "60%" }}
                            ></div>
                            <span className={styles["attr-value"]}>6</span>
                          </div>
                        </div>
                        <div className={styles["attribute"]}>
                          <span className={styles["attr-label"]}>Luck</span>
                          <div className={styles["attr-bar"]}>
                            <div
                              className={styles["attr-fill"]}
                              style={{ width: "70%" }}
                            ></div>
                            <span className={styles["attr-value"]}>20</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === "quests" && (
                <div id="skills">
                  <h3 className={styles["pip-title"]}>Technical Skills</h3>
                  <div className={styles["pip-body"]}>
                    <div
                      ref={skillsSectionRef}
                      className={styles["skills-section"]}
                    >
                      <h4 className={styles["skill-category"]}>
                        Frontend Development
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill1.map((skill, index) => {
                          return (
                            <li key={index}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                                <span
                                  className={`${styles["skill-level-badge"]} ${styles[`level-${skill.level.toLowerCase()}`]}`}
                                >
                                  {skill.level}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        Backend Development
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill2.map((skill, index) => {
                          return (
                            <li key={index}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                                <span
                                  className={`${styles["skill-level-badge"]} ${styles[`level-${skill.level.toLowerCase()}`]}`}
                                >
                                  {skill.level}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        Database & Storage
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill3.map((skill, index) => {
                          return (
                            <li key={index}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                                <span
                                  className={`${styles["skill-level-badge"]} ${styles[`level-${skill.level.toLowerCase()}`]}`}
                                >
                                  {skill.level}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        DevOps & Infrastructure
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill4.map((skill, index) => {
                          return (
                            <li key={index}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                                <span
                                  className={`${styles["skill-level-badge"]} ${styles[`level-${skill.level.toLowerCase()}`]}`}
                                >
                                  {skill.level}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "misc" && (
                <div id="misc">
                  <h3 className={styles["pip-title"]}>Settings</h3>
                  <div className={styles["pip-body"]}>
                    <div className={styles.colors} onChange={handleColorChange}>
                      {colorOptions.map((colorOption, index) => (
                        <React.Fragment key={colorOption}>
                          <input
                            id={`b-${colorOption}`}
                            type="radio"
                            name="colors"
                            value={colorOption}
                            checked={color === colorOption}
                            readOnly
                          />
                          <label
                            htmlFor={`b-${colorOption}`}
                            className={
                              selectedColorIndex === index ? styles.focused : ""
                            }
                            onClick={() => {
                              setSelectedColorIndex(index);
                              if (isTouchDevice) {
                                setColor(colorOption);
                              }
                            }}
                          >
                            {colorOption.charAt(0).toUpperCase() +
                              colorOption.slice(1)}
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Keystroke Info - Fixed Top Right */}
            {!isTouchDevice && (
              <div className={styles["keystroke-info"]}>
                {getKeystrokeInfo()}
              </div>
            )}
          </div>

          {/* Effects */}
          <div
            className={`${styles.piece} ${styles.glow} ${styles.noclick}`}
          ></div>
          <div
            className={`${styles.piece} ${styles.scanlines} ${styles.noclick}`}
          ></div>

          {/* Cursor */}
          <div
            className={`${styles.cursor} ${styles[`cursor-default`]}`}
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Pipboy;
