import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
// Toggle between old and new modular styles:
// OLD VERSION (monolithic): import styles from "@/styles/pip.module.scss";
// NEW VERSION (modular):    import styles from "@/styles/pip-new.module.scss";
import styles from "@/styles/pip-new.module.scss";
import { useTouchDevice } from "@/contexts/TouchContext";
import { useThemeColor, type ThemeColor } from "@/contexts/ThemeColorContext";
import { skillDetails, dragonArt } from "@/data/pipboy-data";

interface PipboyProps {
  isActive?: boolean;
  onScrollToSocials?: () => void;
}

const Pipboy: React.FC<PipboyProps> = ({
  isActive = true,
  onScrollToSocials,
}) => {
  const { isTouchDevice } = useTouchDevice();
  const { color, setColor } = useThemeColor();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("items");
  const [browser, setBrowser] = useState("chrome");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const skillsSectionRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const colorOptions = useMemo(
    () => ["amber", "white", "green", "blue", "red"] as const,
    [],
  );

  useEffect(() => {
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setBrowser(isSafari ? "safari" : "chrome");
  }, []);

  // Track cursor position (only on non-touch devices when active)
  useEffect(() => {
    if (!isActive || isTouchDevice) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        if (frameRef.current) {
          const rect = frameRef.current.getBoundingClientRect();
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
  }, [isActive, isTouchDevice]);

  // Keyboard navigation with j/k for scrolling and h/l for tabs
  useEffect(() => {
    // Only attach keyboard listener when Pipboy is active (not when Dashboard is showing)
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if shift key is pressed (to allow Shift+J/K for page scrolling)
      if (e.shiftKey) return;

      const scrollAmount = 50;
      const tabs = ["items", "stats", "projects", "quests", "misc"];
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
          setColor(colorOptions[selectedColorIndex] as ThemeColor);
        }
      }
      // Projects tab - Enter to navigate
      else if (activeTab === "projects") {
        if (e.key === "Enter") {
          e.preventDefault();
          router.push("/projects");
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
  }, [isActive, activeTab, selectedColorIndex, colorOptions, setColor, router]);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value as ThemeColor);
      // Update selectedColorIndex to match clicked color
      const index = colorOptions.indexOf(e.target.value as ThemeColor);
      if (index !== -1) {
        setSelectedColorIndex(index);
      }
    },
    [colorOptions, setColor],
  );

  const handleTabChange = useCallback(
    (tab: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setActiveTab(tab);
    },
    [],
  );

  const handleSocialsClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setActiveTab("socials");
      onScrollToSocials?.();
      // Reset to Status tab after scrolling to socials
      setTimeout(() => {
        setActiveTab("items");
      }, 800);
    },
    [onScrollToSocials],
  );

  const handleColorLabelClick = useCallback(
    (index: number, colorOption: ThemeColor) => () => {
      setSelectedColorIndex(index);
      if (isTouchDevice) {
        setColor(colorOption);
      }
    },
    [isTouchDevice, setColor],
  );

  const handleProjectsClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push("/projects");
    },
    [router],
  );

  // Get keystroke info based on active tab
  const keystrokeInfo = useMemo(() => {
    switch (activeTab) {
      case "items":
        return "h/l: Tabs";
      case "stats":
        return "h/l: Tabs | j/k: Scroll";
      case "quests":
        return "h/l: Tabs | j/k: Scroll";
      case "misc":
        return "h/l: Tabs | j/k: Nav | ⏎: Select";
      case "projects":
        return "h/l: Tabs | ⏎: Open";
      default:
        return "h/l: Tabs";
    }
  }, [activeTab]);

  return (
    <div
      className={`${styles["pipboy-global"]} ${styles[color]} ${styles[browser]} ${isTouchDevice ? "touch-device" : ""}`}
    >
      <div ref={frameRef} className={`${styles.frame} ${styles.noclick}`}>
        <div className={`${styles.piece} ${styles.output} ${styles.filter}`}>
          <div className={styles.pipboy}>
            {/* Footer Navigation */}
            <ul className={styles["pip-foot"]}>
              <li className={activeTab === "items" ? styles.active : ""}>
                <a onClick={handleTabChange("items")}>Status</a>
              </li>
              <li className={activeTab === "stats" ? styles.active : ""}>
                <a onClick={handleTabChange("stats")}>Stats</a>
              </li>
              <li className={activeTab === "projects" ? styles.active : ""}>
                <a onClick={handleProjectsClick}>Projects</a>
              </li>
              <li className={activeTab === "quests" ? styles.active : ""}>
                <a onClick={handleTabChange("quests")}>Skills</a>
              </li>
              <li className={activeTab === "misc" ? styles.active : ""}>
                <a onClick={handleTabChange("misc")}>Settings</a>
              </li>
              {isTouchDevice && (
                <li className={activeTab === "socials" ? styles.active : ""}>
                  <a onClick={handleSocialsClick}>Socials</a>
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
                        {dragonArt.split("\n").map((line) => (
                          <pre key={line} className={styles.asciiLine}>
                            {line}
                          </pre>
                        ))}
                      </div>
                      <div className={styles["dragon-text"]}>
                        <p>builder</p>
                        <p>tinkering...</p>
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
                        Programming Languages
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill1.map((skill) => {
                          return (
                            <li key={skill.name}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        Frontend Stack
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill2.map((skill) => {
                          return (
                            <li key={skill.name}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        Backend & APIs
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill3.map((skill) => {
                          return (
                            <li key={skill.name}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        Databases & ORMs
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill4.map((skill) => {
                          return (
                            <li key={skill.name}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <h4 className={styles["skill-category"]}>
                        Cloud & Infrastructure
                      </h4>
                      <ul className={styles["skill-list"]}>
                        {skillDetails.skill5.map((skill) => {
                          return (
                            <li key={skill.name}>
                              <div className={styles["skill-card"]}>
                                <div className={styles["skill-name"]}>
                                  {skill.name}
                                </div>
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
                            onClick={handleColorLabelClick(index, colorOption)}
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

              {/* Projects Tab */}
              {activeTab === "projects" && (
                <div id="projects">
                  <h3 className={styles["pip-title"]}>Projects</h3>
                  <div className={styles["pip-body"]}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '200px',
                      gap: '24px'
                    }}>
                      <p style={{ opacity: 0.7, fontSize: '14px' }}>
                        View all projects
                      </p>
                      <span
                        className="retro-flash-text"
                        style={{
                          fontSize: '12px',
                          letterSpacing: '2px',
                          textTransform: 'uppercase'
                        }}
                      >
                        press enter
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Keystroke Info - Fixed Top Right */}
            {!isTouchDevice && (
              <div className={styles["keystroke-info"]}>{keystrokeInfo}</div>
            )}
          </div>

          {/* Effects */}
          <div
            className={`${styles.piece} ${styles.glow} ${styles.noclick}`}
          ></div>
          <div
            className={`${styles.piece} ${styles.scanlines} ${styles.noclick}`}
          ></div>

          {/* Custom Cursor (non-touch devices only) */}
          {!isTouchDevice && (
            <div
              className={`${styles.cursor} ${styles["cursor-default"]}`}
              style={{
                left: `${cursorPosition.x}px`,
                top: `${cursorPosition.y}px`,
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pipboy;
