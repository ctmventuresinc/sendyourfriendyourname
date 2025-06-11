'use client';

import { useState } from 'react';
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

  const { createGame, isLoading } = useGame();

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
    setStep('boyName');
    setCurrentAnswer('');
  };

  const handleAnswerSubmit = () => {
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
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>Game Created!</h1>
            <p className={styles.description}>
              Send this link to your friend:
            </p>
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
      </main>
    );
  }

  const currentQuestion = questions.find(q => q.step === step);
  if (currentQuestion) {
    const isLastQuestion = questions.findIndex(q => q.step === step) === questions.length - 1;
    
    return (
      <main className={styles.main}>
        <GameInput
          label={currentQuestion.label}
          value={currentAnswer}
          onChange={setCurrentAnswer}
          onContinue={handleAnswerSubmit}
          buttonText={isLastQuestion ? (isLoading ? "Creating..." : "Create Game") : "Continue"}
          disabled={!currentAnswer.trim() || isLoading}
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return null;
}
