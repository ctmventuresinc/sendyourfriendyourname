'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useGame } from './hooks/useGame';
import { validateName, validateAnswer } from './utils/game';
import { PlayerAnswers } from './types/game';
import GameInput from './components/GameInput';
import ResultsPage from './components/ResultsPage';
import HowToPlay from './components/HowToPlay';

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
        <HowToPlay 
          isVisible={showHowToPlay} 
          onClose={() => setShowHowToPlay(false)} 
        />
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
      <ResultsPage
        player1Name={name}
        player1Score="???"
        player1Answers={answers}
        player2Name="YOUR FRIEND"
        player2Score="???"
        isWaiting={true}
        gameUrl={gameUrl}
      />
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
          showCountdown={true}
          onTimeout={handleSubmitAllAnswers}
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return null;
}
