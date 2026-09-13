import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Single element that fades and lifts into view once. */
export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}>
      
      {children}
    </Component>);

}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

/** Parent that reveals its <RevealItem> children in sequence. */
export function Stagger({ children, className, stagger = 0.08, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
      }}
      className={className}>
      
      {children}
    </motion.div>);

}

export const revealItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }
};

export function RevealItem({
  children,
  className



}: {children: ReactNode;className?: string;}) {
  return (
    <motion.div variants={revealItemVariants} className={className}>
      {children}
    </motion.div>);

}