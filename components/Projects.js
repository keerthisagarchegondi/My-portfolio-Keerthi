/**
 * Projects.js — Interactive project showcase.
 * Large featured display on the left with project selector tabs on the right.
 * Animated transitions between projects with tech stack visualization.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiArrowRight, FiStar, FiZap } from 'react-icons/fi';
import styles from './Projects.module.css';

/* ─── Project data ─── */
const PROJECTS = [
  {
    emoji: '🤖',
    tag: 'AI & Algorithms',
    title: 'Dijkstra vs ML vs DL',
    desc: 'A visual comparison and analysis of pathfinding algorithms (Dijkstra) versus Machine Learning and Deep Learning approaches for solving navigation and routing problems.',
    impact: ['Algorithm comparison', 'Performance analysis', 'Visual representation'],
    stack: ['Python', 'Algorithms', 'Machine Learning', 'Deep Learning'],
    color: '#f2994a',
    featured: true,
    video: '/dijkstra_vs_ml_vs_dl.mp4',
  },
  {
    emoji: '💬',
    tag: 'NLP',
    title: 'NLP-Based Sentiment Analysis Pipeline',
    desc: 'Built an end-to-end NLP pipeline using Hugging Face Transformers (BERT) and spaCy to analyze and cluster customer support conversations at scale, extracting sentiment scores and topic patterns from unstructured chat data.',
    impact: ['Sentiment scores extracted', 'Topic patterns identified', 'Power BI integration'],
    stack: ['Hugging Face', 'BERT', 'spaCy', 'Python', 'Power BI'],
    color: '#04d06d',
    featured: true,
  },
  {
    emoji: '📊',
    tag: 'Sentiment Analysis',
    title: 'Customer Service Sentiment Analysis',
    desc: 'Sentiment analysis pipeline on unstructured chat data using NLTK, BERT, and clustering techniques to identify service quality discrepancies across customer interactions.',
    impact: ['Quality discrepancies flagged', 'Data-driven insights', 'Cluster visualization'],
    stack: ['NLTK', 'BERT', 'Clustering', 'Power BI'],
    color: '#4add97',
    featured: false,
  },
  {
    emoji: '🚗',
    tag: 'Computer Vision',
    title: 'Real-Time Traffic Object Detection',
    desc: 'Real-time vehicle and pedestrian detection system using ResNet50 pretrained on the COCO dataset, processed through OpenCV for frame extraction and detection visualization.',
    impact: ['Real-time detection', 'Frame extraction', 'Live visualization'],
    stack: ['TensorFlow', 'Keras', 'OpenCV', 'Python'],
    color: '#baf269',
    featured: false,
  },
  {
    emoji: '🏀',
    tag: 'Topic Modeling',
    title: 'NBA Topic Modeling (LDA)',
    desc: 'Applied LDA topic modeling to NBA game data to uncover thematic patterns in player performance narratives, identifying distinct playing styles and game strategy patterns.',
    impact: ['Thematic patterns uncovered', 'Performance clusters', 'Strategy insights'],
    stack: ['Python', 'NLP', 'LDA', 'Text Preprocessing'],
    color: '#02b85f',
    featured: false,
  },
];

/* ─── Word heading variants ─── */
const wordV = {
  hidden: { opacity: 0, y: 28, skewY: 5 },
  visible: (i) => ({
    opacity: 1, y: 0, skewY: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};
const WORDS = ['Work', 'That', 'Moved', 'the', 'Needle'];

/* ─── Main project display ─── */
function ProjectDisplay({ project }) {
  return (
    <motion.div
      key={project.title}
      className={styles.display}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top accent line */}
      <motion.div
        className={styles.accentLine}
        style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Emoji + tag row */}
      <div className={styles.displayTop}>
        <motion.div
          className={styles.emojiBox}
          style={{ background: `${project.color}12` }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        >
          <span className={styles.emoji}>{project.emoji}</span>
        </motion.div>
        <div className={styles.badgeRow}>
          <span className={styles.tagBadge} style={{ color: project.color, borderColor: `${project.color}40`, background: `${project.color}10` }}>
            <FiZap size={10} />
            {project.tag}
          </span>
          {project.featured && (
            <span className={styles.featBadge}>
              <FiStar size={9} />
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <motion.h3
        className={styles.displayTitle}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {project.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        className={styles.displayDesc}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.4 }}
      >
        {project.desc}
      </motion.p>

      {/* Video */}
      {project.video && (
        <motion.div
          className={styles.videoWrapper}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <video
            src={project.video}
            controls
            autoPlay
            loop
            muted
            playsInline
            className={styles.projectVideo}
          />
        </motion.div>
      )}

      {/* Impact metrics */}
      <div className={styles.impactSection}>
        <span className={styles.impactLabel}>Key Impact</span>
        <div className={styles.impactList}>
          {project.impact.map((item, i) => (
            <motion.div
              key={item}
              className={styles.impactItem}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.35 }}
            >
              <span className={styles.impactDot} style={{ background: project.color, boxShadow: `0 0 8px ${project.color}` }} />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className={styles.stackSection}>
        <span className={styles.stackLabel}>Tech Stack</span>
        <div className={styles.stackList}>
          {project.stack.map((tech, i) => (
            <motion.span
              key={tech}
              className={styles.stackPill}
              style={{ '--pill-color': project.color }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
              whileHover={{
                scale: 1.06,
                borderColor: project.color,
                color: project.color,
                boxShadow: `0 0 16px ${project.color}25`,
              }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Project selector tab ─── */
function ProjectTab({ project, index, isActive, onClick, inView }) {
  return (
    <motion.button
      className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
      style={{ '--tab-color': project.color }}
      onClick={onClick}
      initial={{ opacity: 0, x: 20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className={styles.tabIndicator}
          style={{ background: project.color }}
          layoutId="projectIndicator"
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        />
      )}
      <span className={styles.tabEmoji}>{project.emoji}</span>
      <div className={styles.tabContent}>
        <span className={styles.tabTitle} style={{ color: isActive ? '#fff' : 'var(--color-text-secondary)' }}>
          {project.title}
        </span>
        <span className={styles.tabTag} style={{ color: isActive ? project.color : 'var(--color-text-muted)' }}>
          {project.tag}
        </span>
      </div>
      <FiArrowRight
        size={14}
        className={styles.tabArrow}
        style={{ color: isActive ? project.color : 'var(--color-text-muted)' }}
      />
    </motion.button>
  );
}

/* ─── Section ─── */
export default function Projects() {
  const [hRef, hInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [gRef, gInView] = useInView({ triggerOnce: true, threshold: 0.05 });
  const [active, setActive] = useState(0);

  return (
    <section id="projects" className={`section ${styles.section}`} aria-labelledby="proj-heading">
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

        {/* ── Showcase layout ── */}
        <div ref={gRef} className={styles.showcase}>
          {/* Left: project display */}
          <div className={styles.displayWrap}>
            <AnimatePresence mode="wait">
              <ProjectDisplay project={PROJECTS[active]} />
            </AnimatePresence>
          </div>

          {/* Right: project selector tabs */}
          <div className={styles.tabs}>
            <p className={styles.tabsLabel}>Select a project</p>
            {PROJECTS.map((p, i) => (
              <ProjectTab
                key={p.title}
                project={p}
                index={i}
                isActive={active === i}
                onClick={() => setActive(i)}
                inView={gInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
