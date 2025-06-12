'use client';

import styles from '../page.module.css';

interface HowToPlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function HowToPlay({ isVisible, onClose }: HowToPlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={styles.overlay}
      onClick={onClose}
    >
      <div 
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>How to Play</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className={styles.modalContent}>
          <ul>
            <li><strong>Answer 6 Questions:</strong> You'll be asked to name things that start with the letter "B" - like a boy's name, girl's name, animal, place, thing, and movie.</li>
          </ul>
          <div className={styles.scoring}>
            <h3>Scoring:</h3>
            <div className={styles.scoreItem}>
              <span className={styles.uniqueScore}>+10 points</span> for unique answers (you both thought of different things)
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.matchScore}>+5 points</span> for matching answers (great minds think alike!)
            </div>
            <div className={styles.scoreItem}>
              <span className={styles.noScore}>0 points</span> for blank answers
            </div>
          </div>
          <button 
            className={styles.startButton}
            onClick={onClose}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
