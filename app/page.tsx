'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useGame } from './hooks/useGame';
import { validateName, validateAnswer } from './utils/game';
import { PlayerAnswers } from './types/game';
import GameInput from './components/GameInput';

type Step = 'input' | 'boyName' | 'girlName' | 'animal' | 'place' | 'thing' | 'movie' | 'generated';

export default function Home() {
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<PlayerAnswers>({
    boyName: '',
    girlName: '',
    animal: '',
    place: '',
    thing: '',
    movie: ''
  });
  const [step, setStep] = useState<Step>('input');
  const [gameUrl, setGameUrl] = useState('');
  const [error, setError] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { createGame, isLoading } = useGame();

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setStep('boyName');
      setCountdown(3); // Reset for next time
    }
  }, [showCountdown, countdown]);

  const questions = [
    { step: 'boyName', label: 'Name a Boy Name That Starts With B', field: 'boyName' as keyof PlayerAnswers },
    { step: 'girlName', label: 'Name a Girl Name That Starts With B', field: 'girlName' as keyof PlayerAnswers },
    { step: 'animal', label: 'Name an Animal That Starts With B', field: 'animal' as keyof PlayerAnswers },
    { step: 'place', label: 'Name a Place That Starts With B', field: 'place' as keyof PlayerAnswers },
    { step: 'thing', label: 'Name a Thing That Starts With B', field: 'thing' as keyof PlayerAnswers },
    { step: 'movie', label: 'Name a Movie That Starts With B', field: 'movie' as keyof PlayerAnswers }
  ];

  const handleNameSubmit = () => {
    const validation = validateName(name);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid name');
      return;
    }
    setError('');
    setShowCountdown(true);
    setCurrentAnswer('');
  };

  const handleAnswerSubmit = () => {
    // If there's no current answer, treat as skip
    if (!currentAnswer.trim()) {
      const currentQuestion = questions.find(q => q.step === step);
      if (currentQuestion) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.field]: ''
        }));
      }
      
      setError('');
      setCurrentAnswer('');
      
      const currentIndex = questions.findIndex(q => q.step === step);
      if (currentIndex < questions.length - 1) {
        setStep(questions[currentIndex + 1].step as Step);
      } else {
        handleSubmitAllAnswers();
      }
      return;
    }

    const validation = validateAnswer(currentAnswer);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid answer');
      return;
    }
    
    const currentQuestion = questions.find(q => q.step === step);
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.field]: currentAnswer
      }));
    }
    
    setError('');
    setCurrentAnswer('');
    
    const currentIndex = questions.findIndex(q => q.step === step);
    if (currentIndex < questions.length - 1) {
      setStep(questions[currentIndex + 1].step as Step);
    } else {
      handleSubmitAllAnswers();
    }
  };

  const handleSubmitAllAnswers = async () => {
    const finalAnswers = { ...answers };
    const currentQuestion = questions.find(q => q.step === step);
    if (currentQuestion && currentAnswer.trim()) {
      finalAnswers[currentQuestion.field] = currentAnswer;
    }
    
    const result = await createGame(name, finalAnswers);
    
    if (result.success) {
      const url = `${window.location.origin}/${result.gameId}`;
      setGameUrl(url);
      setStep('generated');
      setError('');
    } else {
      setError(result.error || 'Failed to create game');
    }
  };

  const isDesktop = () => {
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const challengeFriend = async () => {
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
            text: `Play against ${name} - can you beat their score?`,
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
      const hasAnswer = answers[category.field] && answers[category.field].trim() !== '';
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (step === 'input') {
    return (
      <>
        {showToast && (
          <div className={styles.toast}>
            {toastMessage}
          </div>
        )}
        {showCountdown && (
          <div 
            className={styles.countdownOverlay}
            style={{
              backdropFilter: countdown <= 2 ? `blur(${6 - (2 - countdown) * 3}px)` : `blur(10px)`,
              background: `rgba(0, 0, 0, ${0.8 - (5 - countdown) * 0.1})`
            }}
          >
            <div className={styles.countdownContent}>
              <div className={styles.countdownText}>GAME STARTING</div>
              <div className={styles.countdownIn}>IN</div>
              <div 
                className={`${styles.countdownNumber} ${styles[`countdown${countdown}`]}`}
                style={{
                  color: countdown <= 2 ? '#ff0000' : '#ffffff'
                }}
              >
                {countdown}
              </div>
            </div>
          </div>
        )}
        {showHowToPlay && (
          <div 
            className={styles.overlay}
            onClick={() => setShowHowToPlay(false)}
          >
            <div 
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>How to Play</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowHowToPlay(false)}
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
                  onClick={() => setShowHowToPlay(false)}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}
        <main className={styles.main}>
          <GameInput
            label="What's your name?"
            value={name}
            onChange={setName}
            onContinue={handleNameSubmit}
            buttonText="Continue"
            disabled={!name.trim() || isLoading}
          />
          {error && <p className={styles.error}>{error}</p>}
        </main>
      </>
    );
  }

  if (step === 'generated') {
    const categories = [
      { name: 'Boy Name', field: 'boyName' as keyof PlayerAnswers },
      { name: 'Girl Name', field: 'girlName' as keyof PlayerAnswers },
      { name: 'Animal', field: 'animal' as keyof PlayerAnswers },
      { name: 'Place', field: 'place' as keyof PlayerAnswers },
      { name: 'Thing', field: 'thing' as keyof PlayerAnswers },
      { name: 'Movie', field: 'movie' as keyof PlayerAnswers }
    ];

    // Can't calculate actual score until friend answers - scoring depends on comparison
    const playerScore = "???";

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
          <div className={styles.playersContainer}>
            <div className={styles.player}>
              <h2 className={styles.playerName}>{name.toUpperCase()}</h2>
              <p className={styles.playerScore}>Score: {playerScore}</p>
            </div>
            <div className={styles.player}>
              <h2 className={styles.playerName}>YOUR FRIEND</h2>
              <p className={styles.playerScore}>Score: ???</p>
            </div>
          </div>

          <div className={styles.waitingIndicator}>
            <div className={styles.waitingDot}></div>
            <span>Waiting for opponent</span>
          </div>

          <div className={styles.answersContainer}>
            {categories.map((category) => {
              const playerAnswer = answers[category.field] || '';
              
              return (
                <div key={category.field} className={styles.answerRow}>
                  <div className={styles.answerLeft}>
                    <div className={styles.answerBox}>
                      {playerAnswer.toUpperCase()}
                    </div>
                    <div className={styles.scoreBox}>
                      {playerAnswer ? '+?' : '0'}
                    </div>
                  </div>
                  <div className={styles.answerRight}>
                    <div className={`${styles.answerBox} ${styles.unknownAnswer}`}>
                      ???
                    </div>
                    <div className={`${styles.scoreBox} ${styles.unknownScore}`}>
                      +?
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            className={styles.shareScoreButton}
            onClick={challengeFriend}
          >
            CHALLENGE YOUR FRIEND
          </button>
          
          <button 
            className={styles.shareScoreButton}
            onClick={shareScore}
            style={{ marginTop: '12px' }}
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

  const currentQuestion = questions.find(q => q.step === step);
  if (currentQuestion) {
    const isLastQuestion = questions.findIndex(q => q.step === step) === questions.length - 1;
    const hasAnswer = currentAnswer.trim();
    
    let buttonText;
    if (isLastQuestion) {
      buttonText = isLoading ? "Loading..." : (hasAnswer ? "Continue" : "Skip");
    } else {
      buttonText = hasAnswer ? "Continue" : "Skip";
    }
    
    return (
      <main className={styles.main}>
        <GameInput
          label={currentQuestion.label}
          value={currentAnswer}
          onChange={setCurrentAnswer}
          onContinue={handleAnswerSubmit}
          buttonText={buttonText}
          disabled={isLoading}
          buttonVariant={hasAnswer ? 'continue' : 'skip'}
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return null;
}
