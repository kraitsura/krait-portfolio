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
}

const Pipboy: React.FC<PipboyProps> = ({
  isActive = true,
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
      const tabs = ["items", "stats", "quests", "projects", "misc"];
      const currentIndex = tabs.indexOf(activeTab);

      // j/k for menu navigation (works on all tabs)
      if (e.key === "j") {
        e.preventDefault();
        const nextIndex =
          currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        setActiveTab(tabs[nextIndex]);
      } else if (e.key === "k") {
        e.preventDefault();
        const prevIndex =
          currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        setActiveTab(tabs[prevIndex]);
      }

      // h/l for scrolling content
      if (e.key === "l" && activeTab !== "items") {
        e.preventDefault();
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
      } else if (e.key === "h" && activeTab !== "items") {
        e.preventDefault();
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

      // Settings tab - use j/k for color selection (handled above for nav)
      if (activeTab === "misc" && e.key === "Enter") {
        e.preventDefault();
        setColor(colorOptions[selectedColorIndex] as ThemeColor);
      }

      // Projects tab - Enter to navigate
      if (activeTab === "projects" && e.key === "Enter") {
        e.preventDefault();
        router.push("/projects");
      }

      // Direct shortcuts (r/s/q/p/c)
      if (e.key === "r") {
        e.preventDefault();
        setActiveTab("items");
      } else if (e.key === "s") {
        e.preventDefault();
        setActiveTab("stats");
      } else if (e.key === "q") {
        e.preventDefault();
        setActiveTab("quests");
      } else if (e.key === "p") {
        e.preventDefault();
        setActiveTab("projects");
      } else if (e.key === "c") {
        e.preventDefault();
        setActiveTab("misc");
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

  const handleColorLabelClick = useCallback(
    (index: number, colorOption: ThemeColor) => () => {
      setSelectedColorIndex(index);
      if (isTouchDevice) {
        setColor(colorOption);
      }
    },
    [isTouchDevice, setColor],
  );


  return (
    <div
      className={`${styles["pipboy-global"]} ${styles[color]} ${styles[browser]} ${isTouchDevice ? "touch-device" : ""}`}
    >
      <div ref={frameRef} className={`${styles.frame} ${styles.noclick}`}>
        <div className={`${styles.piece} ${styles.output} ${styles.filter}`}>
          <div className={styles.pipboy}>
            {/* Keybind Bar - Top horizontal bar with nav info */}
            {!isTouchDevice && (
              <div className={styles["keybind-bar"]}>
                <span className={styles["keybind-item"]}>[j/k] nav</span>
                <span className={styles["keybind-item"]}>[h/l] scroll</span>
              </div>
            )}

            <div className={styles["tab-content"]}>
              <div className={styles["dashboard-layout"]}>
                {/* Left Panel - Dragon Art + Menu (always visible) */}
                <div className={styles["dashboard-left"]}>
                  <div className={styles["dashboard-dragon"]}>
                    <div className="vboy">
                      {dragonArt.split("\n").map((line) => (
                        <pre key={line} className={styles.asciiLine}>
                          {line}
                        </pre>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Menu */}
                  <div className={styles["dashboard-menu"]}>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "items" ? styles.active : ""}`}
                      onClick={() => setActiveTab("items")}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>~</span>
                      <span className={styles["menu-key"]}>[r]</span>
                      <span className={styles["menu-label"]}>Status</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "stats" ? styles.active : ""}`}
                      onClick={() => setActiveTab("stats")}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>★</span>
                      <span className={styles["menu-key"]}>[s]</span>
                      <span className={styles["menu-label"]}>S.P.E.C.I.A.L</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "quests" ? styles.active : ""}`}
                      onClick={() => setActiveTab("quests")}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>◆</span>
                      <span className={styles["menu-key"]}>[q]</span>
                      <span className={styles["menu-label"]}>Skills</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "projects" ? styles.active : ""}`}
                      onClick={() => setActiveTab("projects")}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>▢</span>
                      <span className={styles["menu-key"]}>[p]</span>
                      <span className={styles["menu-label"]}>Projects</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "misc" ? styles.active : ""}`}
                      onClick={() => setActiveTab("misc")}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>⚙</span>
                      <span className={styles["menu-key"]}>[c]</span>
                      <span className={styles["menu-label"]}>Config</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Tab Content */}
                <div
                  ref={tabContentRef}
                  className={styles["dashboard-right"]}
                  style={{ overflowY: "auto" }}
                >
                  {/* Status Tab */}
                  {activeTab === "items" && (
                    <div id="items" className={styles["tab-panel"]}>
                      <div className={styles["about-content"]}>
                        <p>
                          I build software that feels good to use, from agentic event
                          planning systems to high-performance tools.
                        </p>
                        <p>
                          I make tools I actually use: CLIs for day logging and
                          deep work tracking, desktop apps for AI workflows, and
                          utilities like pastebins.
                        </p>
                        <p>
                          Right now I&apos;m interested in agentic systems, real-time
                          data processing, and the next generation frontend interface
                          for the age of intelligence.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === "stats" && (
                    <div id="stats" className={styles["tab-panel"]}>
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
                              <span className={styles["attr-label"]}>Perception</span>
                              <div className={styles["attr-bar"]}>
                                <div
                                  className={styles["attr-fill"]}
                                  style={{ width: "60%" }}
                                ></div>
                                <span className={styles["attr-value"]}>9</span>
                              </div>
                            </div>
                            <div className={styles["attribute"]}>
                              <span className={styles["attr-label"]}>Endurance</span>
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
                              <span className={styles["attr-label"]}>Intelligence</span>
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
                    <div id="skills" className={styles["tab-panel"]}>
                      <h3 className={styles["pip-title"]}>Technical Skills</h3>
                      <div className={styles["pip-body"]}>
                        <div
                          ref={skillsSectionRef}
                          className={styles["skills-section"]}
                        >
                          <h4 className={styles["skill-category"]}>Programming Languages</h4>
                          <ul className={styles["skill-list"]}>
                            {skillDetails.skill1.map((skill) => (
                              <li key={skill.name}>
                                <div className={styles["skill-card"]}>
                                  <div className={styles["skill-name"]}>{skill.name}</div>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <h4 className={styles["skill-category"]}>Frontend Stack</h4>
                          <ul className={styles["skill-list"]}>
                            {skillDetails.skill2.map((skill) => (
                              <li key={skill.name}>
                                <div className={styles["skill-card"]}>
                                  <div className={styles["skill-name"]}>{skill.name}</div>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <h4 className={styles["skill-category"]}>Backend & APIs</h4>
                          <ul className={styles["skill-list"]}>
                            {skillDetails.skill3.map((skill) => (
                              <li key={skill.name}>
                                <div className={styles["skill-card"]}>
                                  <div className={styles["skill-name"]}>{skill.name}</div>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <h4 className={styles["skill-category"]}>Databases & ORMs</h4>
                          <ul className={styles["skill-list"]}>
                            {skillDetails.skill4.map((skill) => (
                              <li key={skill.name}>
                                <div className={styles["skill-card"]}>
                                  <div className={styles["skill-name"]}>{skill.name}</div>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <h4 className={styles["skill-category"]}>Cloud & Infrastructure</h4>
                          <ul className={styles["skill-list"]}>
                            {skillDetails.skill5.map((skill) => (
                              <li key={skill.name}>
                                <div className={styles["skill-card"]}>
                                  <div className={styles["skill-name"]}>{skill.name}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "misc" && (
                    <div id="misc" className={styles["tab-panel"]}>
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
                                className={selectedColorIndex === index ? styles.focused : ""}
                                onClick={handleColorLabelClick(index, colorOption)}
                              >
                                {colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
                              </label>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Projects Tab */}
                  {activeTab === "projects" && (
                    <div id="projects" className={styles["tab-panel"]}>
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
                {/* End dashboard-right */}
              </div>
              {/* End dashboard-layout */}
            </div>
            {/* End tab-content */}

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
