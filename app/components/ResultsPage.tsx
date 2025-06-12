'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { PlayerAnswers } from '../types/game';

interface ResultsPageProps {
  // Player data
  player1Name: string;
  player1Score: number | string;
  player1Answers: PlayerAnswers;
  player2Name: string;
  player2Score: number | string;
  player2Answers?: PlayerAnswers;
  
  // Game state
  isWaiting?: boolean;  // true for waiting state, false for final results
  gameUrl?: string;     // only needed for challenge friend functionality
  
  // Results data (for final results)
  breakdown?: Array<{
    player1Points: number;
    player2Points: number;
  }>;
}

export default function ResultsPage({
  player1Name,
  player1Score,
  player1Answers,
  player2Name,
  player2Score,
  player2Answers,
  isWaiting = false,
  gameUrl,
  breakdown
}: ResultsPageProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isDesktop = () => {
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const challengeFriend = async () => {
    if (!gameUrl) return;
    
    if (isDesktop()) {
      try {
        await navigator.clipboard.writeText(gameUrl);
        showToastNotification('Link copied');
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    } else {
      // Native iOS share sheet
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Challenge me in this name game!',
            text: `Play against ${player1Name} - can you beat their score?`,
            url: gameUrl,
          });
        } catch (err) {
          console.error('Failed to share:', err);
        }
      } else {
        // Fallback for older mobile browsers
        try {
          await navigator.clipboard.writeText(gameUrl);
          showToastNotification('Link copied');
        } catch (err) {
          console.error('Failed to copy URL:', err);
        }
      }
    }
  };

  const shareScore = async () => {
    const homeUrl = window.location.origin;
    
    // Generate emoji grid based on answers
    const categories = [
      { name: 'Boy Name', field: 'boyName' as keyof PlayerAnswers },
      { name: 'Girl Name', field: 'girlName' as keyof PlayerAnswers },
      { name: 'Animal', field: 'animal' as keyof PlayerAnswers },
      { name: 'Place', field: 'place' as keyof PlayerAnswers },
      { name: 'Thing', field: 'thing' as keyof PlayerAnswers },
      { name: 'Movie', field: 'movie' as keyof PlayerAnswers }
    ];

    const emojiGrid = categories.map(category => {
      const hasAnswer = player1Answers[category.field] && player1Answers[category.field].trim() !== '';
      const emoji = hasAnswer ? '🟩' : '🟥';
      return `${emoji} ${category.name}`;
    }).join('\n');

    const shareText = `Kategorie Day 1\n\n${emojiGrid}\n${homeUrl}`;
    
    if (isDesktop()) {
      try {
        await navigator.clipboard.writeText(shareText);
        showToastNotification('Copied');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else {
      // Native iOS share sheet
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Check out my score!',
            text: shareText,
          });
        } catch (err) {
          console.error('Failed to share:', err);
        }
      } else {
        // Fallback for older mobile browsers
        try {
          await navigator.clipboard.writeText(shareText);
          showToastNotification('Copied');
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      }
    }
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const [timeUntilNext, setTimeUntilNext] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilNext(getTimeUntilMidnight());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'Boy Name', field: 'boyName' as keyof PlayerAnswers },
    { name: 'Girl Name', field: 'girlName' as keyof PlayerAnswers },
    { name: 'Animal', field: 'animal' as keyof PlayerAnswers },
    { name: 'Place', field: 'place' as keyof PlayerAnswers },
    { name: 'Thing', field: 'thing' as keyof PlayerAnswers },
    { name: 'Movie', field: 'movie' as keyof PlayerAnswers }
  ];

  // Determine winner and score difference
  const numericScore1 = typeof player1Score === 'string' ? parseInt(player1Score) || 0 : player1Score;
  const numericScore2 = typeof player2Score === 'string' ? parseInt(player2Score) || 0 : player2Score;
  const isPlayer1Winner = numericScore1 > numericScore2;
  const isTie = numericScore1 === numericScore2;

  return (
    <div className={styles.resultsPage}>
      {showToast && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}
      <div className={styles.starsContainer}>
        <div className={styles.star1}>⭐</div>
        <div className={styles.star2}>⭐</div>
        <div className={styles.star3}>⭐</div>
        <div className={styles.star4}>⭐</div>
        <div className={styles.star5}>⭐</div>
      </div>
      
      <div className={styles.resultsContent}>
        <div className={styles.headToHeadContainer}>
          <div className={`${styles.playerColumn} ${isPlayer1Winner && !isTie ? styles.winner : ''}`}>
            <div className={styles.playerHeader}>
              {isPlayer1Winner && !isTie && <div className={styles.crown}>👑</div>}
              <h2 className={styles.playerName}>{player1Name.toUpperCase()}</h2>
              <div className={styles.finalScore}>{player1Score}</div>
            </div>
          </div>
          
          <div className={styles.vsSection}>
            <div className={styles.vsText}>VS</div>
          </div>
          
          <div className={`${styles.playerColumn} ${!isPlayer1Winner && !isTie ? styles.winner : ''}`}>
            <div className={styles.playerHeader}>
              {!isPlayer1Winner && !isTie && <div className={styles.crown}>👑</div>}
              <h2 className={styles.playerName}>{player2Name.toUpperCase()}</h2>
              <div className={styles.finalScore}>{player2Score}</div>
            </div>
          </div>
        </div>

        {isWaiting && (
          <div className={styles.waitingIndicator}>
            <div className={styles.waitingDot}></div>
            <span>Waiting for opponent</span>
          </div>
        )}

        <div className={styles.roundsContainer}>
          {categories.map((category, index) => {
            const player1Answer = player1Answers[category.field] || '';
            const player2Answer = player2Answers?.[category.field] || '';
            const points1 = breakdown?.[index]?.player1Points || (isWaiting ? (player1Answer ? '?' : '0') : '0');
            const points2 = breakdown?.[index]?.player2Points || (isWaiting ? '?' : '0');
            
            // Determine round winner
            const numericPoints1 = typeof points1 === 'string' ? (points1 === '?' ? 0 : parseInt(points1) || 0) : points1;
            const numericPoints2 = typeof points2 === 'string' ? (points2 === '?' ? 0 : parseInt(points2) || 0) : points2;
            const isRoundTie = numericPoints1 === numericPoints2;
            const isPlayer1RoundWinner = numericPoints1 > numericPoints2;
            
            return (
              <div key={category.field} className={styles.roundRow}>
                <div className={`${styles.roundResult} ${isPlayer1RoundWinner && !isRoundTie ? styles.roundWinner : isRoundTie ? styles.roundTie : styles.roundLoser}`}>
                  <div className={styles.answerText}>
                    {player1Answer.trim() === '' ? 'NO ANSWER' : player1Answer.toUpperCase()}
                  </div>
                  <div className={styles.scoreText}>
                    {typeof points1 === 'string' ? points1 : `+${points1}`}
                  </div>
                  <div className={styles.roundIndicator}>
                    {!isWaiting && (isPlayer1RoundWinner && !isRoundTie ? '🟢' : isRoundTie ? '🟡' : '🔴')}
                  </div>
                </div>
                
                <div className={`${styles.roundResult} ${!isPlayer1RoundWinner && !isRoundTie ? styles.roundWinner : isRoundTie ? styles.roundTie : styles.roundLoser}`}>
                  <div className={styles.roundIndicator}>
                    {!isWaiting && (!isPlayer1RoundWinner && !isRoundTie ? '🟢' : isRoundTie ? '🟡' : '🔴')}
                  </div>
                  <div className={styles.answerText}>
                    {isWaiting ? '???' : (player2Answer?.trim() === '' ? 'NO ANSWER' : player2Answer.toUpperCase())}
                  </div>
                  <div className={styles.scoreText}>
                    {typeof points2 === 'string' ? `+${points2}` : `+${points2}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isWaiting && gameUrl && (
          <button 
            className={styles.shareScoreButton}
            onClick={challengeFriend}
          >
            CHALLENGE YOUR FRIEND
          </button>
        )}
        
        <button 
          className={styles.shareScoreButton}
          onClick={shareScore}
          style={isWaiting && gameUrl ? { marginTop: '12px' } : {}}
        >
          SHARE YOUR SCORE
        </button>
        
        <div className={styles.nextPuzzleTimer}>
          Next puzzle in: {timeUntilNext.hours}h {timeUntilNext.minutes}m {timeUntilNext.seconds}s
        </div>
      </div>
    </div>
  );
}
