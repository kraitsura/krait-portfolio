import { useState, useEffect } from 'react';
import styles from '@/styles/pip.module.scss';

type SkillCategory = 'skill1' | 'skill2' | 'skill3';

const Pipboy = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [color, setColor] = useState('amber');
  const [browser, setBrowser] = useState('chrome');
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [selectedSkill, setSelectedSkill] = useState<SkillCategory>('skill1');

  useEffect(() => {
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setBrowser(isSafari ? 'safari' : 'chrome');
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const frame = document.querySelector(`.${styles.frame}`);
      if (frame) {
        const rect = frame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCursorPosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [color]);

  useEffect(() => {
    document.documentElement.className = color;
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const skillDetails = {
    skill1: [
      { name: 'React', level: 'Master', percentage: 85 },
      { name: 'TypeScript', level: 'Expert', percentage: 90 },
      { name: 'Next.js', level: 'Adept', percentage: 70 },
      { name: 'CSS/SCSS', level: 'Master', percentage: 88 },
    ],
    skill2: [
      { name: 'Node.js', level: 'Adept', percentage: 75 },
      { name: 'Python', level: 'Journeyman', percentage: 65 },
      { name: 'MongoDB', level: 'Apprentice', percentage: 50 },
      { name: 'SQL', level: 'Expert', percentage: 82 },
    ],
    skill3: [
      { name: 'Docker', level: 'Journeyman', percentage: 68 },
      { name: 'AWS', level: 'Apprentice', percentage: 55 },
      { name: 'CI/CD', level: 'Adept', percentage: 72 },
      { name: 'Linux', level: 'Expert', percentage: 85 },
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
    "       ⠻⣿⣿⣿⣿⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⡟⢀⣀⣤⣾⡿⠃     "
  ].join('\n');

  return (
    <div className={`${styles['pipboy-global']} ${styles[color]} ${styles[browser]}`}>
      <div className={`${styles.frame} ${styles.noclick}`}>
        <div className={`${styles.piece} ${styles.output} ${styles.filter}`}>
          <div className={styles.pipboy}>
            {/* Footer Navigation */}
            <ul className={styles['pip-foot']}>
              <li className={activeTab === 'items' ? styles.active : ''}>
                <a onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('items');
                }}>Skills</a>
              </li>
              <li className={activeTab === 'stats' ? styles.active : ''}>
                <a onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('stats');
                }}>Stats</a>
              </li>
              <li className={activeTab === 'quests' ? styles.active : ''}>
                <a onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('quests');
                }}>Projects</a>
              </li>
              <li className={activeTab === 'misc' ? styles.active : ''}>
                <a onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('misc');
                }}>Settings</a>
              </li>
            </ul>

            <div className={styles['tab-content']}>
              {/* Skills Tab */}
              {activeTab === 'items' && (
                <div id="items">
                  <h3 className={styles['pip-title']}>Developer Skills</h3>
                  <ul className={styles['pip-head']}>
                    <li><b>XP</b> 2345/3000</li>
                    <li><b>Level</b> 42</li>
                    <li><b>Commits</b> 1721</li>
                  </ul>
                  <div className={styles['pip-body']}>
                    <ul className={styles.options}>
                      <li>
                        <input 
                          type="radio" 
                          id="skill1" 
                          name="skills" 
                          checked={selectedSkill === 'skill1'}
                          onChange={(e) => setSelectedSkill(e.target.id as SkillCategory)} 
                        />
                        <label htmlFor="skill1">Frontend Development</label>
                      </li>
                      <li>
                        <input 
                          type="radio" 
                          id="skill2" 
                          name="skills" 
                          checked={selectedSkill === 'skill2'}
                          onChange={(e) => setSelectedSkill(e.target.id as SkillCategory)}
                        />
                        <label htmlFor="skill2">Backend Development</label>
                      </li>
                      <li>
                        <input 
                          type="radio" 
                          id="skill3" 
                          name="skills" 
                          checked={selectedSkill === 'skill3'}
                          onChange={(e) => setSelectedSkill(e.target.id as SkillCategory)}
                        />
                        <label htmlFor="skill3">DevOps</label>
                      </li>
                    </ul>
                    <div className={styles.info}>
                      <div className="vboy">
                        {dragonArt.split('\n').map((line, index) => (
                          <pre key={index} className={styles.asciiLine}>{line}</pre>
                        ))}
                      </div>
                      <div className={styles['info-table']}>
                        {skillDetails[selectedSkill].map((skill, index) => (
                          <li key={index}>
                            <b>{skill.name}</b>
                            <span className={`${styles.level} ${styles[`level-${skill.level.toLowerCase()}`]}`}>
                              {skill.level}
                            </span>
                          </li>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'misc' && (
                <div id="misc">
                  <h3 className={styles['pip-title']}>Settings</h3>
                  <div className={styles['pip-body']}>
                    <div className={styles.colors} onChange={handleColorChange}>
                      <input id="b-amber" type="radio" name="colors" value="amber" defaultChecked />
                      <label htmlFor="b-amber">Amber</label>
                      <input id="b-white" type="radio" name="colors" value="white" />
                      <label htmlFor="b-white">White</label>
                      <input id="b-green" type="radio" name="colors" value="green" />
                      <label htmlFor="b-green">Green</label>
                      <input id="b-blue" type="radio" name="colors" value="blue" />
                      <label htmlFor="b-blue">Blue</label>
                      <input id="b-red" type="radio" name="colors" value="red" />
                      <label htmlFor="b-red">Red</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Effects */}
          <div className={`${styles.piece} ${styles.glow} ${styles.noclick}`}></div>
          <div className={`${styles.piece} ${styles.scanlines} ${styles.noclick}`}></div>
          
          {/* Cursor */}
          <div 
            className={`${styles.cursor} ${styles[`cursor-${cursorState}`]}`}
            style={{ 
              left: `${cursorPosition.x}px`, 
              top: `${cursorPosition.y}px` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Pipboy;
