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
    if (currentQuestion) {
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

    // Calculate player's total score (assuming 10 points for each answer for now)
    const playerScore = Object.values(answers).filter(answer => answer.trim()).length * 10;

    return (
      <div className={styles.resultsPage}>
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
                      +10
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
            onClick={copyToClipboard}
          >
            CHALLENGE YOUR FRIEND
          </button>
          
          <div className={styles.urlContainer}>
            <input
              type="text"
              value={gameUrl}
              readOnly
              className={styles.urlInput}
            />
            <button
              onClick={copyToClipboard}
              className={styles.copyButton}
            >
              Copy
            </button>
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
      buttonText = isLoading ? "Creating..." : "Create Game";
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
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return null;
}
