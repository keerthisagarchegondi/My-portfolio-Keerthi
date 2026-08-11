/**
 * Skills.js — Interactive radar chart with orbiting skill tags.
 * Central animated SVG spider chart + category cards with expandable skill lists.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiBarChart2, FiCode, FiCloud, FiMonitor, FiUsers } from 'react-icons/fi';
import styles from './Skills.module.css';

/* ─── Skill data ─── */
const CATS = [
  {
    icon: FiBarChart2,
    title: 'Machine Learning & AI',
    color: '#04d06d',
    level: 92,
    skills: ['Classification', 'Regression', 'Clustering', 'Feature Engineering', 'A/B Testing', 'NLP', 'BERT'],
  },
  {
    icon: FiCode,
    title: 'Programming & ML',
    color: '#4add97',
    level: 90,
    skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'XGBoost', 'PySpark'],
  },
  {
    icon: FiCloud,
    title: 'Cloud & Data Eng.',
    color: '#baf269',
    level: 88,
    skills: ['GCP', 'Azure', 'Snowflake', 'dbt', 'Airflow', 'Kafka', 'ETL/ELT'],
  },
  {
    icon: FiMonitor,
    title: 'MLOps & DevOps',
    color: '#02b85f',
    level: 85,
    skills: ['Docker', 'Kubernetes', 'MLflow', 'FastAPI', 'Git', 'CI/CD'],
  },
  {
    icon: FiUsers,
    title: 'Deep Learning & CV',
    color: '#4add97',
    level: 80,
    skills: ['TensorFlow', 'Keras', 'OpenCV', 'Hugging Face', 'spaCy', 'NLTK'],
  },
];

const N = CATS.length;

/* ─── Radar chart helpers ─── */
function polarToXY(angleDeg, radius, cx, cy) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function radarPoints(levels, maxR, cx, cy) {
  const step = 360 / levels.length;
  return levels
    .map((lv, i) => {
      const r = (lv / 100) * maxR;
      const p = polarToXY(i * step, r, cx, cy);
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

/* ─── SVG radar chart ─── */
function RadarChart({ active, setActive, inView }) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 130;
  const rings = [0.25, 0.5, 0.75, 1.0];
  const step = 360 / N;

  const [hoveredNode, setHoveredNode] = useState(null);

  const levels = CATS.map((c) => c.level);
  const pts = radarPoints(levels, maxR, cx, cy);

  return (
    <div className={styles.radarWrap}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={styles.radarSvg}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#04d06d" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#4add97" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#baf269" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#04d06d" />
            <stop offset="100%" stopColor="#baf269" />
          </linearGradient>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {rings.map((r) => {
          const rr = r * maxR;
          const ringPts = Array.from({ length: N }, (_, i) => {
            const p = polarToXY(i * step, rr, cx, cy);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={r}
              points={ringPts}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {CATS.map((_, i) => {
          const end = polarToXY(i * step, maxR, cx, cy);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon — animated */}
        <motion.polygon
          points={radarPoints(Array(N).fill(0), maxR, cx, cy)}
          animate={inView ? { points: pts } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          fill="url(#radarFill)"
          stroke="url(#radarStroke)"
          strokeWidth="2"
          filter="url(#radarGlow)"
          strokeLinejoin="round"
          style={{ pointerEvents: 'none' }}
        />

        {/* Interactive Data points on vertices */}
        {CATS.map((cat, i) => {
          const r = (cat.level / 100) * maxR;
          const p = polarToXY(i * step, r, cx, cy);
          const isHovered = hoveredNode === i;
          const isActive = active === i;
          const isDimmed = hoveredNode !== null && !isHovered;

          return (
            <g 
              key={cat.title}
              onMouseEnter={() => setHoveredNode(i)}
              onClick={() => setActive(i)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible hit area for easier hovering */}
              <circle cx={p.x} cy={p.y} r={24} fill="transparent" />
              
              <motion.circle
                cx={cx}
                cy={cy}
                r={isHovered || isActive ? 7 : 4.5}
                fill={cat.color}
                initial={{ cx: cx, cy: cy, opacity: 0 }}
                animate={inView ? { cx: p.x, cy: p.y, opacity: isDimmed ? 0.3 : 1 } : {}}
                transition={{ 
                  opacity: { duration: 0.2 },
                  r: { duration: 0.2 },
                  default: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 + i * 0.08 }
                }}
                style={{ filter: (isHovered || isActive) && !isDimmed ? `drop-shadow(0 0 10px ${cat.color})` : 'none' }}
              />

              {/* Pulsing ring on hover/active */}
              {(isHovered || isActive) && !isDimmed && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={12}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth={1.5}
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}

        {/* Labels at the end of each axis */}
        {CATS.map((cat, i) => {
          const labelR = maxR + 24;
          const p = polarToXY(i * step, labelR, cx, cy);
          const isLeft = p.x < cx - 10;
          const isRight = p.x > cx + 10;
          const isHovered = hoveredNode === i;
          const isActive = active === i;
          const isDimmed = hoveredNode !== null && !isHovered;

          return (
            <motion.text
              key={cat.title + '-label'}
              x={p.x}
              y={p.y}
              textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
              dominantBaseline="central"
              fill={isActive || isHovered ? cat.color : 'rgba(255,255,255,0.5)'}
              fontSize="10"
              fontWeight={isActive || isHovered ? '700' : '500'}
              fontFamily="var(--font-heading)"
              className={styles.radarLabel}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: isDimmed ? 0.2 : 1 } : {}}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
              style={{ cursor: 'pointer', transition: 'fill 0.2s, opacity 0.2s' }}
              onClick={() => setActive(i)}
              onMouseEnter={() => setHoveredNode(i)}
            >
              {cat.title}
            </motion.text>
          );
        })}
      </svg>
      
      {/* Central interactive tooltip */}
      <AnimatePresence>
        {(hoveredNode !== null || active !== null) && (
          <motion.div 
            className={styles.radarTooltipCenter}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ pointerEvents: 'none' }}
          >
            <span className={styles.ttCenterLabel}>
              {CATS[hoveredNode !== null ? hoveredNode : active].title}
            </span>
            <span 
              className={styles.ttCenterVal} 
              style={{ color: CATS[hoveredNode !== null ? hoveredNode : active].color }}
            >
              {CATS[hoveredNode !== null ? hoveredNode : active].level}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Category selector button ─── */
function CatButton({ cat, index, isActive, onClick, inView }) {
  const Icon = cat.icon;
  return (
    <motion.button
      className={`${styles.catBtn} ${isActive ? styles.catBtnActive : ''}`}
      onClick={onClick}
      style={{
        '--cat-color': cat.color,
        borderColor: isActive ? cat.color : 'rgba(255,255,255,0.08)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, borderColor: cat.color }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className={styles.catGlow}
          style={{ background: `${cat.color}15` }}
          layoutId="catGlow"
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        />
      )}
      <span className={styles.catIcon} style={{ color: isActive ? cat.color : 'var(--color-text-muted)' }}>
        <Icon size={18} />
      </span>
      <span className={styles.catTitle} style={{ color: isActive ? '#fff' : 'var(--color-text-muted)' }}>
        {cat.title}
      </span>
      <span className={styles.catPct} style={{ color: cat.color }}>
        {cat.level}%
      </span>
    </motion.button>
  );
}

/* ─── Skill tags panel ─── */
function SkillPanel({ cat }) {
  return (
    <motion.div
      key={cat.title}
      className={styles.skillPanel}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle} style={{ color: cat.color }}>{cat.title}</h3>
        <span className={styles.panelCount}>{cat.skills.length} skills</span>
      </div>
      <div className={styles.pillGrid}>
        {cat.skills.map((skill, si) => (
          <motion.div
            key={skill}
            className={styles.pill}
            style={{ '--pill-color': cat.color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: si * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              scale: 1.06,
              borderColor: cat.color,
              boxShadow: `0 0 20px ${cat.color}30`,
            }}
          >
            <span className={styles.pillDot} style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
            <span>{skill}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Word heading ─── */
const wordV = {
  hidden: { opacity: 0, y: 28, skewY: 5 },
  visible: (i) => ({
    opacity: 1, y: 0, skewY: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};
const WORDS = ['The', 'Toolkit', 'I', 'Bring'];

/* ─── Main component ─── */
export default function Skills() {
  const [hRef, hInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [gRef, gInView] = useInView({ triggerOnce: true, threshold: 0.06 });
  const [active, setActive] = useState(0);

  return (
    <section id="skills" className={`section ${styles.section}`} aria-labelledby="skills-heading">
      <div className="container">
        {/* ── Header ── */}
        <div ref={hRef} className={styles.header}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -18 }}
            animate={hInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Skills
          </motion.p>

          <h2 id="skills-heading" className={`section-heading ${styles.heading}`}>
            {WORDS.map((w, i) => (
              <motion.span
                key={w + i}
                className={w === 'Toolkit' ? `gradient-text ${styles.headWord}` : styles.headWord}
                custom={i}
                variants={wordV}
                initial="hidden"
                animate={hInView ? 'visible' : 'hidden'}
              >
                {w}
              </motion.span>
            ))}
          </h2>

          <div className={styles.subWrap}>
            <motion.p
              className={`section-sub ${styles.sub}`}
              initial={{ opacity: 0, y: 10 }}
              animate={hInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              Full-stack data science — from raw data to production ML systems.
            </motion.p>
            <motion.div
              className={styles.subLine}
              initial={{ scaleX: 0, originX: 0 }}
              animate={hInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* ── Main content: radar + controls ── */}
        <div ref={gRef} className={styles.layout}>
          {/* Left: category selector buttons */}
          <div className={styles.sidebar}>
            {CATS.map((cat, i) => (
              <CatButton
                key={cat.title}
                cat={cat}
                index={i}
                isActive={active === i}
                onClick={() => setActive(i)}
                inView={gInView}
              />
            ))}
          </div>

          {/* Center: radar chart */}
          <div className={styles.center}>
            <RadarChart active={active} setActive={setActive} inView={gInView} />
          </div>

          {/* Right: active skill panel */}
          <div className={styles.rightPanel}>
            <AnimatePresence mode="wait">
              <SkillPanel cat={CATS[active]} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
