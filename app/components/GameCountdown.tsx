'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';

interface GameCountdownProps {
  onTimeout: () => void;
  duration?: number; // in seconds
}

export default function GameCountdown({ onTimeout, duration = 30 }: GameCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onTimeout();
    }
  }, [timeLeft, onTimeout]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.gameCountdown}>
      <div className={styles.countdownTimer}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}
