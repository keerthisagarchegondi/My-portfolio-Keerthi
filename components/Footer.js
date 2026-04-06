/**
 * Footer.js — Minimal light-mode footer
 */
import { motion } from 'framer-motion';
import { FiLinkedin, FiMail, FiArrowUp } from 'react-icons/fi';
import styles from './Footer.module.css';

const LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Contact',    href: '#contact' },
];

const go = (href) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.divider} />
      <div className={`container ${styles.inner}`}>

        {/* Brand */}
        <div className={styles.brand}>
          <button className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
            <span className="gradient-text">KS</span>
          </button>
          <p className={styles.tagline}>Data → Decisions → Impact.</p>
        </div>

        {/* Nav */}
        <nav className={styles.nav} aria-label="Footer navigation">
          {LINKS.map(l => (
            <button key={l.href} className={styles.navLink} onClick={() => go(l.href)}>{l.label}</button>
          ))}
        </nav>

        {/* Social */}
        <div className={styles.social}>
          <a href="https://www.linkedin.com/in/keerthisagarch" target="_blank" rel="noopener noreferrer" className={styles.sLink} aria-label="LinkedIn"><FiLinkedin size={16} /></a>
          <a href="mailto:keerthisagarchegondi@gmail.com" className={styles.sLink} aria-label="Email"><FiMail size={16} /></a>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className={styles.copy}>© {new Date().getFullYear()} Keerthi Sagar Chegondi</p>
        <motion.button className={styles.topBtn} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} whileHover={{ y: -2 }} aria-label="Scroll to top">
          <FiArrowUp size={14} />
        </motion.button>
      </div>
    </footer>
  );
}
