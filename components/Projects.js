/**
 * Projects.js — Cards matching the Skills "FloatTiltCard" design.
 * Float-up entrance → idle float loop, 3D tilt, draw-in top border,
 * glow ring, staggered impact pills + stack tags.
 */
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useAnimate } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiExternalLink, FiStar, FiZap } from 'react-icons/fi';
import styles from './Projects.module.css';

/* ─── Project data ─── */
const PROJECTS = [
  {
    emoji:    '📊',
    tag:      'Enterprise',
    title:    'Predictive Retention & CLV Platform',
    desc:     'End-to-end retention system generating CLV scores, flagging at-risk segments, and surfacing actionable levers for marketing teams.',
    impact:   ['CLV impact quantified', 'Automated KPI pipelines', 'Data-driven segmentation'],
    stack:    ['Snowflake', 'BigQuery', 'Python', 'Power BI', 'Scikit-learn'],
    color:    '#04d06d',
    featured: true,
  },
  {
    emoji:    '💬',
    tag:      'NLP',
    title:    'Sentiment Intelligence Dashboard',
    desc:     'BERT-powered NLP on 10k+ chat records — surfacing complaint clusters and sentiment trends via interactive Power BI dashboard.',
    impact:   ['10k+ records analyzed', 'Proactive CX workflows', 'Automated pipeline'],
    stack:    ['BERT', 'NLTK', 'Python', 'Power BI'],
    color:    '#4add97',
    featured: false,
  },
  {
    emoji:    '🧪',
    tag:      'Marketing Science',
    title:    'A/B Testing & Uplift Framework',
    desc:     'Systematic experiment design → uplift modeling → significance testing. Turned ad-hoc reviews into rigorous measurement.',
    impact:   ['Standardized measurement', 'High-ROI channels identified', 'Faster insights'],
    stack:    ['Python', 'Statsmodels', 'SQL', 'Power BI'],
    color:    '#baf269',
    featured: false,
  },
  {
    emoji:    '🚚',
    tag:      'Supply Chain',
    title:    'Freight Optimization System',
    desc:     'Route optimization + vendor benchmarking + scenario planning tools for a large-scale industrial logistics division.',
    impact:   ['Cycle time reduced', 'Real-time utilization KPIs', 'Scenario models'],
    stack:    ['SQL', 'Python', 'Tableau', 'Excel'],
    color:    '#02b85f',
    featured: false,
  },
];

/* ─── Float durations — different per card for organic feel ─── */
const FLOAT_DUR = [4.2, 3.7, 5.0, 4.5];

/* ─── Tag animation variants ─── */
const tagStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};
const tagVariant = {
  hidden:  { opacity: 0, scale: 0.75, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
};
const impactStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.22 } },
};
const impactVariant = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};
const wordV = {
  hidden:  { opacity: 0, y: 28, skewY: 5 },
  visible: (i) => ({
    opacity: 1, y: 0, skewY: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};
const WORDS = ['Work', 'That', 'Moved', 'the', 'Needle'];

/* ─── FloatTiltCard — matches Skills card behaviour exactly ─── */
function FloatTiltCard({ children, ci, gInView, color, className }) {
  const [scope, animCard] = useAnimate();
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const rx  = useTransform(my, [-40, 40], [7, -7]);
  const ry  = useTransform(mx, [-40, 40], [-7, 7]);
  const srx = useSpring(rx, { stiffness: 280, damping: 28 });
  const sry = useSpring(ry, { stiffness: 280, damping: 28 });
  const [hov, setHov] = useState(false);

  useEffect(() => {
    if (!gInView) return;
    let cancelled = false;
    const run = async () => {
      await animCard(scope.current,
        { opacity: 1, y: 0, scale: 1 },
        { delay: ci * 0.12, duration: 0.72, ease: [0.22, 1, 0.36, 1] }
      );
      if (cancelled) return;
      animCard(scope.current,
        { y: [0, -12, 0] },
        { duration: FLOAT_DUR[ci % FLOAT_DUR.length], repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }
      );
    };
    run();
    return () => { cancelled = true; };
  }, [gInView]);

  const onMove  = (e) => {
    const r = scope.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left - r.width  / 2);
    my.set(e.clientY - r.top  - r.height / 2);
  };
  const onLeave = () => { mx.set(0); my.set(0); setHov(false); };

  return (
    <motion.article
      ref={scope}
      className={className}
      initial={{ opacity: 0, y: 64, scale: 0.94 }}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 900 }}
      animate={hov
        ? { boxShadow: `0 28px 64px ${color}30, 0 6px 20px rgba(0,0,0,0.08)`, borderColor: `${color}55` }
        : { boxShadow: '0 4px 14px rgba(0,0,0,0.04)', borderColor: 'var(--color-border)' }
      }
      transition={{ duration: 0.22 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
    >
      {/* Glow ring on hover */}
      <motion.div
        className={styles.glowRing}
        style={{ borderColor: color }}
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {children}
    </motion.article>
  );
}

/* ─── Single project card ─── */
function ProjectCard({ project, ci, gInView }) {
  return (
    <FloatTiltCard
      ci={ci}
      gInView={gInView}
      color={project.color}
      className={`${styles.card} ${project.featured ? styles.featured : ''}`}
    >
      {/* Draw-in top border */}
      <motion.div
        className={styles.topBorder}
        style={{ background: `linear-gradient(90deg, ${project.color}, ${project.color}55)` }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={gInView ? { scaleX: 1 } : {}}
        transition={{ delay: ci * 0.12 + 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className={styles.cardInner}>
        {/* Header row */}
        <div className={styles.cardHeader}>
          {/* Emoji icon box */}
          <motion.div
            className={styles.iconBox}
            style={{ background: `${project.color}12` }}
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={gInView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
            transition={{ delay: ci * 0.12 + 0.2, type: 'spring', stiffness: 320, damping: 16 }}
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1, transition: { duration: 0.4 } }}
          >
            <span className={styles.emoji}>{project.emoji}</span>
          </motion.div>

          {/* Badges right side */}
          <div className={styles.badges}>
            <motion.span
              className={styles.tagChip}
              style={{ background: `${project.color}10`, color: project.color, borderColor: `${project.color}30` }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={gInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: ci * 0.12 + 0.38, type: 'spring', stiffness: 300 }}
            >
              <FiZap size={10} />
              {project.tag}
            </motion.span>
            {project.featured && (
              <motion.span
                className={styles.featBadge}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={gInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: ci * 0.12 + 0.48, type: 'spring', stiffness: 300 }}
              >
                <FiStar size={9} />
                Featured
              </motion.span>
            )}
          </div>
        </div>

        {/* Title */}
        <motion.h3
          className={styles.title}
          initial={{ opacity: 0, x: -12 }}
          animate={gInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: ci * 0.12 + 0.24, duration: 0.42 }}
        >
          {project.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          className={styles.desc}
          initial={{ opacity: 0 }}
          animate={gInView ? { opacity: 1 } : {}}
          transition={{ delay: ci * 0.12 + 0.32, duration: 0.4 }}
        >
          {project.desc}
        </motion.p>

        {/* Impact pills — stagger in */}
        <motion.div
          className={styles.impacts}
          variants={impactStagger}
          initial="hidden"
          animate={gInView ? 'visible' : 'hidden'}
        >
          {project.impact.map(item => (
            <motion.span key={item} className={styles.impactPill} variants={impactVariant}>
              <span className={styles.impactDot} style={{ background: project.color }} />
              {item}
            </motion.span>
          ))}
        </motion.div>

        {/* Stack tags — cascade */}
        <motion.div
          className={styles.stack}
          variants={tagStagger}
          initial="hidden"
          animate={gInView ? 'visible' : 'hidden'}
        >
          {project.stack.map(t => (
            <motion.span
              key={t}
              className={styles.stackTag}
              variants={tagVariant}
              whileHover={{
                scale: 1.08,
                background: `${project.color}0F`,
                borderColor: project.color,
                color: project.color,
                transition: { duration: 0.14 },
              }}
            >
              {t}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </FloatTiltCard>
  );
}

/* ─── Section ─── */
export default function Projects() {
  const [hRef, hInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [gRef, gInView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="projects" className={`section ${styles.section}`} aria-labelledby="proj-heading">
      {/* Ambient shimmer */}
      <motion.div
        className={styles.shimmer}
        initial={{ opacity: 0 }}
        animate={hInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.4 }}
        aria-hidden="true"
      />

      <div className="container">
        {/* ── Header ── */}
        <div ref={hRef} className={styles.header}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -18 }}
            animate={hInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Projects
          </motion.p>

          <h2 id="proj-heading" className={`section-heading ${styles.heading}`}>
            {WORDS.map((w, i) => (
              <motion.span
                key={w + i}
                className={(w === 'Moved' || w === 'Needle') ? `gradient-text ${styles.headWord}` : styles.headWord}
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
              Each project built to answer a real business question.
            </motion.p>
            <motion.div
              className={styles.subLine}
              initial={{ scaleX: 0, originX: 0 }}
              animate={hInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div ref={gRef} className={styles.grid}>
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} ci={i} gInView={gInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
