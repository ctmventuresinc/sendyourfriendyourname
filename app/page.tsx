'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useGame } from './hooks/useGame';
import { validateName, validateAllAnswers } from './utils/game';
import { PlayerAnswers } from './types/game';
import GameInput from './components/GameInput';

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
  const [step, setStep] = useState<'input' | 'answers' | 'generated'>('input');
  const [gameUrl, setGameUrl] = useState('');
  const [error, setError] = useState('');

  const { createGame, isLoading } = useGame();

  const handleNameSubmit = async () => {
    const validation = validateName(name);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid name');
      return;
    }
    setError('');
    setStep('answers');
  };

  const handleAnswersSubmit = async () => {
    const answersValidation = validateAllAnswers(answers);
    
    if (!answersValidation.isValid) {
      setError(answersValidation.error || 'Invalid answers');
      return;
    }
    
    const result = await createGame(name, answers);
    
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

  const allAnswersFilled = Object.values(answers).every(answer => answer.trim() !== '');

  if (step === 'input') {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.content}>
            <label htmlFor="name" className={styles.label}>
              What's your name?
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Enter your name"
            />
          </div>
          <button
            type="button"
            onClick={handleNameSubmit}
            className={styles.submitButton}
            disabled={!name.trim() || isLoading}
          >
            Continue
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  if (step === 'answers') {
    return (
      <main className={styles.main}>
        <GameInput
          answers={answers}
          onChange={setAnswers}
          onContinue={handleAnswersSubmit}
          buttonText="Create Game"
          disabled={!allAnswersFilled || isLoading}
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

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
