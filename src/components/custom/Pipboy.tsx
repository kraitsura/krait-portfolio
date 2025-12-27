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
import { useAppTheme } from "@/contexts/AppThemeContext";
import { dragonArt } from "@/data/pipboy-data";

interface ActivityEntry {
  id: string;
  type: 'commit' | 'tweet';
  message: string;
  date: string;
  timestamp: string;
  source: string;
  url: string | null;
  isPrivate?: boolean;
  shortHash?: string;
}

interface GithubStats {
  commitsThisWeek: number;
  activeRepos: number;
  currentStreak: number;
}

interface PipboyProps {
  isActive?: boolean;
}

type ConfigSection = 'main' | 'colors' | 'theme';

const Pipboy: React.FC<PipboyProps> = ({
  isActive = true,
}) => {
  const { isTouchDevice } = useTouchDevice();
  const { color, setColor } = useThemeColor();
  const { theme, setTheme } = useAppTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("logs");
  const [browser, setBrowser] = useState("chrome");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [configMode, setConfigMode] = useState(false);
  const [configSection, setConfigSection] = useState<ConfigSection>('main');
  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(theme === 'dark' ? 0 : 1);
  const [activityLogs, setActivityLogs] = useState<ActivityEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsMode, setLogsMode] = useState(false); // Whether we're navigating within logs
  const [showVideoBg, setShowVideoBg] = useState(false); // Video background toggle
  const [selectedLogIndex, setSelectedLogIndex] = useState(0);
  const [githubStats, setGithubStats] = useState<GithubStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const logsListRef = useRef<HTMLDivElement>(null);

  const colorOptions = useMemo(
    () => ["amber", "white", "green", "blue", "red"] as const,
    [],
  );

  const themeOptions = useMemo(
    () => ["dark", "light"] as const,
    [],
  );

  const configMenuItems = useMemo(
    () => [
      { label: "Colors", section: "colors" as ConfigSection },
      { label: "Theme", section: "theme" as ConfigSection },
    ],
    [],
  );

  useEffect(() => {
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setBrowser(isSafari ? "safari" : "chrome");
  }, []);

  // Fetch activity logs (git commits + tweets) on mount
  useEffect(() => {
    fetch('/api/git-logs')
      .then(res => res.json())
      .then(data => {
        setActivityLogs(data.activity || []);
        setLogsLoading(false);
      })
      .catch(() => setLogsLoading(false));
  }, []);

  // Fetch GitHub stats on mount
  useEffect(() => {
    fetch('/api/github-stats')
      .then(res => res.json())
      .then(data => {
        setGithubStats(data);
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
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

  // Scroll selected log into view
  useEffect(() => {
    if (logsMode && logsListRef.current) {
      const selectedElement = logsListRef.current.children[selectedLogIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [logsMode, selectedLogIndex]);

  // Keyboard navigation
  useEffect(() => {
    // Only attach keyboard listener when Pipboy is active
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if shift key is pressed (to allow Shift+J/K for page scrolling)
      if (e.shiftKey) return;

      const tabs = ["logs", "stats", "about", "projects", "blogs", "misc"];
      const currentIndex = tabs.indexOf(activeTab);

      // Logs mode handling (navigating within activity logs)
      if (logsMode) {
        if (e.key === "j") {
          e.preventDefault();
          setSelectedLogIndex(prev =>
            prev === activityLogs.length - 1 ? 0 : prev + 1
          );
        } else if (e.key === "k") {
          e.preventDefault();
          setSelectedLogIndex(prev =>
            prev === 0 ? activityLogs.length - 1 : prev - 1
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          const selectedEntry = activityLogs[selectedLogIndex];
          if (selectedEntry?.url) {
            window.open(selectedEntry.url, '_blank', 'noopener,noreferrer');
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setLogsMode(false);
        }
        return; // Don't process other keys in logs mode
      }

      // Config mode handling
      if (configMode) {
        if (configSection === 'main') {
          // Main config menu navigation
          if (e.key === "j") {
            e.preventDefault();
            setSelectedConfigIndex(prev =>
              prev === configMenuItems.length - 1 ? 0 : prev + 1
            );
          } else if (e.key === "k") {
            e.preventDefault();
            setSelectedConfigIndex(prev =>
              prev === 0 ? configMenuItems.length - 1 : prev - 1
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            setConfigSection(configMenuItems[selectedConfigIndex].section);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setConfigMode(false);
            setConfigSection('main');
          }
        } else if (configSection === 'colors') {
          // Color selection
          if (e.key === "j") {
            e.preventDefault();
            setSelectedColorIndex(prev =>
              prev === colorOptions.length - 1 ? 0 : prev + 1
            );
          } else if (e.key === "k") {
            e.preventDefault();
            setSelectedColorIndex(prev =>
              prev === 0 ? colorOptions.length - 1 : prev - 1
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            setColor(colorOptions[selectedColorIndex] as ThemeColor);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setConfigSection('main');
          }
        } else if (configSection === 'theme') {
          // Theme selection
          if (e.key === "j" || e.key === "k") {
            e.preventDefault();
            setSelectedThemeIndex(prev => prev === 0 ? 1 : 0);
          } else if (e.key === "Enter") {
            e.preventDefault();
            setTheme(themeOptions[selectedThemeIndex]);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setConfigSection('main');
          }
        }
        return; // Don't process other keys in config mode
      }

      // Normal mode: j/k for menu navigation
      if (e.key === "j") {
        e.preventDefault();
        const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        setActiveTab(tabs[nextIndex]);
      } else if (e.key === "k") {
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        setActiveTab(tabs[prevIndex]);
      }

      // Enter handling for different tabs
      if (e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "logs" && activityLogs.length > 0) {
          setLogsMode(true);
          setSelectedLogIndex(0);
        } else if (activeTab === "misc") {
          setConfigMode(true);
        } else if (activeTab === "projects") {
          router.push("/projects");
        } else if (activeTab === "about") {
          router.push("/about");
        } else if (activeTab === "blogs") {
          router.push("/blog");
        }
      }

      // Direct shortcuts (l/s/a/p/b/c/t)
      if (e.key === "l") {
        e.preventDefault();
        setActiveTab("logs");
        setLogsMode(false); // Exit logs mode when switching tabs
      } else if (e.key === "s") {
        e.preventDefault();
        setActiveTab("stats");
      } else if (e.key === "a") {
        e.preventDefault();
        setActiveTab("about");
      } else if (e.key === "p") {
        e.preventDefault();
        setActiveTab("projects");
      } else if (e.key === "b") {
        e.preventDefault();
        setActiveTab("blogs");
      } else if (e.key === "m") {
        e.preventDefault();
        setActiveTab("misc");
      } else if (e.key === "v" && theme === "dark") {
        e.preventDefault();
        setShowVideoBg(prev => !prev);
      }
      // Note: 't' (theme toggle) and 'c' (cycle colors) are now global keybinds
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, activeTab, configMode, configSection, logsMode, selectedLogIndex, activityLogs, selectedColorIndex, selectedConfigIndex, selectedThemeIndex, colorOptions, themeOptions, configMenuItems, setColor, setTheme, router, theme]);

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
            {/* Keybind Bar - Dynamic based on mode */}
            {!isTouchDevice && (
              <div className={styles["keybind-bar"]}>
                {logsMode ? (
                  <>
                    <span className={styles["keybind-item"]}>[j/k] select</span>
                    <span className={styles["keybind-item"]}>[enter] open</span>
                    <span className={styles["keybind-item"]}>[esc] back</span>
                  </>
                ) : configMode ? (
                  <>
                    <span className={styles["keybind-item"]}>[j/k] select</span>
                    <span className={styles["keybind-item"]}>[enter] apply</span>
                    <span className={styles["keybind-item"]}>[esc] back</span>
                  </>
                ) : (
                  <>
                    <span className={styles["keybind-item"]}>[j/k] nav</span>
                    <span className={styles["keybind-item"]}>[enter] select</span>
                    <span className={styles["keybind-item"]}>[t] theme [c] color</span>
                    {theme === "dark" && <span className={styles["keybind-item"]}>[v] video</span>}
                  </>
                )}
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
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "logs" ? styles.active : ""}`}
                      onClick={() => setActiveTab("logs")}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>~</span>
                      <span className={styles["menu-key"]}>[l]</span>
                      <span className={styles["menu-label"]}>Logs</span>
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
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "about" ? styles.active : ""}`}
                      onClick={() => {
                        if (isTouchDevice) {
                          router.push("/about");
                        } else {
                          setActiveTab("about");
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>◈</span>
                      <span className={styles["menu-key"]}>[a]</span>
                      <span className={styles["menu-label"]}>About</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "projects" ? styles.active : ""}`}
                      onClick={() => {
                        if (isTouchDevice) {
                          router.push("/projects");
                        } else {
                          setActiveTab("projects");
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>▢</span>
                      <span className={styles["menu-key"]}>[p]</span>
                      <span className={styles["menu-label"]}>Projects</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "blogs" ? styles.active : ""}`}
                      onClick={() => {
                        if (isTouchDevice) {
                          router.push("/blog");
                        } else {
                          setActiveTab("blogs");
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>✎</span>
                      <span className={styles["menu-key"]}>[b]</span>
                      <span className={styles["menu-label"]}>Blogs</span>
                    </div>
                    <div
                      className={`${styles["dashboard-menu-item"]} ${activeTab === "misc" ? styles.active : ""}`}
                      onClick={() => {
                        setActiveTab("misc");
                        if (isTouchDevice) {
                          setConfigMode(true);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className={styles["menu-icon"]}>⚙</span>
                      <span className={styles["menu-key"]}>[m]</span>
                      <span className={styles["menu-label"]}>Config</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Tab Content */}
                <div
                  ref={tabContentRef}
                  className={styles["dashboard-right"]}
                >
                  {/* Logs Tab */}
                  {activeTab === "logs" && (
                    <div id="logs" className={styles["tab-panel"]}>
                      <h3 className={styles["pip-title"]}>
                        Activity
                        {!logsMode && !logsLoading && activityLogs.length > 0 && !isTouchDevice && (
                          <span className={styles["pip-title-hint"]}> - press enter</span>
                        )}
                      </h3>
                      <div className={styles["pip-body"]}>
                        {logsLoading ? (
                          <div className={styles["logs-loading"]}>Loading activity...</div>
                        ) : (
                          <>
                            {/* Desktop: Standard list view */}
                            <div ref={logsListRef} className={styles["logs-list"]}>
                              {activityLogs.map((entry, index) => (
                                <div
                                  key={entry.id}
                                  className={`${styles["log-entry"]} ${logsMode && selectedLogIndex === index ? styles.focused : ""} ${entry.isPrivate ? styles.private : ""} ${entry.url ? styles.clickable : ""} ${entry.type === 'tweet' ? styles.tweet : ''}`}
                                  onClick={() => {
                                    if (entry.url) {
                                      window.open(entry.url, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  role={entry.url ? "link" : undefined}
                                  tabIndex={entry.url ? 0 : undefined}
                                >
                                  <span className={styles["log-hash"]}>
                                    {entry.type === 'commit' ? entry.shortHash : '𝕏'}
                                  </span>
                                  <span className={styles["log-repo"]}>{entry.source}</span>
                                  <span className={styles["log-message"]}>{entry.message}</span>
                                  <span className={styles["log-date"]}>{entry.date}</span>
                                </div>
                              ))}
                            </div>

                            {/* Mobile: Stacked ribbons with marquee text */}
                            <div className={styles["logs-ribbons"]}>
                              {activityLogs.map((entry) => (
                                <div
                                  key={entry.id}
                                  className={`${styles["ribbon-entry"]} ${entry.url ? styles.clickable : ""}`}
                                  onClick={() => {
                                    if (entry.url) {
                                      window.open(entry.url, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                >
                                  <span className={styles["ribbon-hash"]}>
                                    {entry.type === 'commit' ? entry.shortHash : '𝕏'}
                                  </span>
                                  <span className={styles["ribbon-content"]}>
                                    <span className={styles["ribbon-text"]}>
                                      <span className={styles["ribbon-repo"]}>{entry.source}</span>
                                      <span className={styles["ribbon-message"]}>{entry.message}</span>
                                    </span>
                                  </span>
                                  <span className={styles["ribbon-date"]}>{entry.date}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
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

                        {/* Terminal Stats */}
                        <div className={styles["terminal-stats"]}>
                          {statsLoading ? (
                            <div className={styles["terminal-loading"]}>...</div>
                          ) : githubStats ? (
                            <div className={styles["terminal-grid"]}>
                              <div className={styles["terminal-stat"]}>
                                <span className={styles["stat-label"]}>Commits/Week</span>
                                <span className={styles["stat-value"]}>{githubStats.commitsThisWeek}</span>
                              </div>
                              <div className={styles["terminal-stat"]}>
                                <span className={styles["stat-label"]}>Streak</span>
                                <span className={styles["stat-value"]}>{githubStats.currentStreak}d</span>
                              </div>
                              <div className={styles["terminal-stat"]}>
                                <span className={styles["stat-label"]}>Active Repos</span>
                                <span className={styles["stat-value"]}>{githubStats.activeRepos}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* About Tab */}
                  {activeTab === "about" && (
                    <div id="about" className={styles["tab-panel"]}>
                      <h3 className={styles["pip-title"]}>About</h3>
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
                            View about page
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

                  {/* Settings Tab */}
                  {activeTab === "misc" && (
                    <div id="misc" className={styles["tab-panel"]}>
                      <h3 className={styles["pip-title"]}>Config</h3>
                      <div className={styles["pip-body"]}>
                        {!configMode ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '200px',
                            gap: '24px'
                          }}>
                            <p style={{ opacity: 0.7, fontSize: '14px' }}>
                              Configure appearance
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
                        ) : configSection === 'main' ? (
                          <div className={styles["config-menu"]}>
                            {configMenuItems.map((item, index) => (
                              <div
                                key={item.section}
                                className={`${styles["config-menu-item"]} ${selectedConfigIndex === index ? styles.focused : ""}`}
                                onClick={() => {
                                  setSelectedConfigIndex(index);
                                  setConfigSection(item.section);
                                }}
                                role="button"
                                tabIndex={0}
                              >
                                <span className={styles["config-icon"]}>{item.section === 'colors' ? '◆' : '◐'}</span>
                                <span className={styles["config-label"]}>{item.label}</span>
                              </div>
                            ))}
                          </div>
                        ) : configSection === 'colors' ? (
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
                        ) : configSection === 'theme' ? (
                          <div className={styles["theme-options"]}>
                            {themeOptions.map((themeOption, index) => (
                              <div
                                key={themeOption}
                                className={`${styles["theme-option"]} ${selectedThemeIndex === index ? styles.focused : ""} ${theme === themeOption ? styles.active : ""}`}
                                onClick={() => {
                                  setSelectedThemeIndex(index);
                                  if (isTouchDevice) {
                                    setTheme(themeOption);
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                              >
                                <span className={styles["theme-icon"]}>{themeOption === 'dark' ? '☾' : '☀'}</span>
                                <span className={styles["theme-label"]}>{themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
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

                  {/* Blogs Tab */}
                  {activeTab === "blogs" && (
                    <div id="blogs" className={styles["tab-panel"]}>
                      <h3 className={styles["pip-title"]}>Blog</h3>
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
                            View blog posts
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

          {/* Video Background */}
          {theme === "dark" && showVideoBg && (
            <div className={`${styles.piece} ${styles.noclick}`} style={{ zIndex: -2 }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.4,
                }}
              >
                <source src="/gifs/skyscrape.webm" type="video/webm" />
                <source src="/gifs/skyscrape.mp4" type="video/mp4" />
              </video>
            </div>
          )}

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
