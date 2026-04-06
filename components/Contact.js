/**
 * Contact.js — Info cards only: LinkedIn, Email, Phone, Location.
 */
import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiMail, FiLinkedin, FiMapPin, FiPhone } from 'react-icons/fi';
import styles from './Contact.module.css';

const INFO = [
  { icon: FiLinkedin, label: 'LinkedIn',  value: 'keerthisagarch',            href: 'https://www.linkedin.com/in/keerthisagarch', color: '#04d06d' },
  { icon: FiMail,     label: 'Email',     value: 'keerthisagarchegondi@gmail.com', href: 'mailto:keerthisagarchegondi@gmail.com',           color: '#4add97' },
  { icon: FiPhone,    label: 'Phone',     value: '(602) 580-3684',            href: 'tel:+16025803684',                           color: '#baf269' },
  { icon: FiMapPin,   label: 'Location',  value: 'Cincinnati, OH',            href: null,                                         color: '#02b85f' },
];

/* ── Tilt card ── */
function TiltInfoCard({ children, color, delay, inView }) {
  const mx  = useMotionValue(0);
  const my  = useMotionValue(0);
  const rx  = useTransform(my, [-30, 30], [6, -6]);
  const ry  = useTransform(mx, [-30, 30], [-6, 6]);
  const srx = useSpring(rx, { stiffness: 280, damping: 28 });
  const sry = useSpring(ry, { stiffness: 280, damping: 28 });
  const [hov, setHov] = useState(false);

  const onMove  = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width  / 2);
    my.set(e.clientY - r.top  - r.height / 2);
  };
  const onLeave = () => { mx.set(0); my.set(0); setHov(false); };

  return (
    <motion.div
      className={styles.infoCard}
      initial={{ opacity: 0, y: 40, scale: 0.93 }}
      animate={hov
        ? { opacity: 1, y: 0, scale: 1, boxShadow: `0 20px 48px ${color}26, 0 4px 16px rgba(0,0,0,0.07)`, borderColor: `${color}50` }
        : inView
          ? { opacity: 1, y: 0, scale: 1, boxShadow: '0 4px 14px rgba(0,0,0,0.04)', borderColor: 'var(--color-border)' }
          : { opacity: 0, y: 40, scale: 0.93 }
      }
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
    >
      {/* Glow ring */}
      <motion.div
        className={styles.glowRing}
        style={{ borderColor: color }}
        animate={{ opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.18 }}
      />
      {/* Top border draw-in */}
      <motion.div
        className={styles.topBorder}
        style={{ background: `linear-gradient(90deg, ${color}, ${color}55)` }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ delay: delay + 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {children}
    </motion.div>
  );
}

export default function Contact() {
  const [hRef, hInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [gRef, gInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="contact" className={`section ${styles.section}`} aria-labelledby="contact-heading">
      <div className="container">

        {/* Header */}
        <div ref={hRef}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, x: -18 }}
            animate={hInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Contact
          </motion.p>
          <motion.h2
            id="contact-heading"
            className="section-heading"
            initial={{ opacity: 0, y: 22 }}
            animate={hInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Let&apos;s <span className="gradient-text">Connect</span>
          </motion.h2>
          <motion.p
            className="section-sub"
            initial={{ opacity: 0, y: 12 }}
            animate={hInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Open to analytics leadership roles and advisory engagements.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div ref={gRef} className={styles.grid}>
          {INFO.map(({ icon: Icon, label, value, href, color }, i) => (
            <TiltInfoCard key={label} color={color} delay={i * 0.1} inView={gInView}>
              <div className={styles.cardInner}>
                <motion.div
                  className={styles.iconBox}
                  style={{ background: `${color}12`, color }}
                  initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                  animate={gInView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
                  transition={{ delay: i * 0.1 + 0.22, type: 'spring', stiffness: 320, damping: 16 }}
                  whileHover={{ rotate: [0, -12, 12, 0], scale: 1.1, transition: { duration: 0.4 } }}
                >
                  <Icon size={20} />
                </motion.div>
                <div className={styles.cardText}>
                  <motion.p
                    className={styles.infoLabel}
                    initial={{ opacity: 0 }}
                    animate={gInView ? { opacity: 1 } : {}}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    {label}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={gInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: i * 0.1 + 0.36, duration: 0.38 }}
                  >
                    {href ? (
                      <a
                        href={href}
                        className={styles.infoValue}
                        style={{ '--hover-color': color }}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className={styles.infoValue}>{value}</p>
                    )}
                  </motion.div>
                </div>
              </div>
            </TiltInfoCard>
          ))}
        </div>

        {/* Availability */}
        <motion.div
          className={styles.availCard}
          initial={{ opacity: 0, y: 16 }}
          animate={gInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <span className={styles.availDot} />
          <span className={styles.availText}>Currently open to new opportunities</span>
        </motion.div>

      </div>
    </section>
  );
}
