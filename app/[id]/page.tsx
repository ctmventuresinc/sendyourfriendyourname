'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../page.module.css';
import GameInput from '../components/GameInput';
import ResultsPage from '../components/ResultsPage';
import { useGame } from '../hooks/useGame';
import { validateName, validateAnswer } from '../utils/game';
import { GameData, PlayerAnswers } from '../types/game';

type Step = 'input' | 'boyName' | 'girlName' | 'animal' | 'place' | 'thing' | 'movie' | 'result';

export default function NamePage() {
  const params = useParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [friendName, setFriendName] = useState('');
  const [friendAnswers, setFriendAnswers] = useState<PlayerAnswers>({
    boyName: '',
    girlName: '',
    animal: '',
    place: '',
    thing: '',
    movie: ''
  });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('input');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [error, setError] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const { isLoading, joinGame } = useGame();

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

  useEffect(() => {
    const fetchGameData = async () => {
      const id = params.id as string;
      if (id) {
        try {
          const response = await fetch(`/api/get-game/${id}`);
          if (response.ok) {
            const data = await response.json();
            setGameData(data);
          } else {
            setGameData(null);
          }
        } catch (error) {
          console.error('Error fetching game data:', error);
          setGameData(null);
        }
        setLoading(false);
      }
    };

    fetchGameData();
  }, [params.id]);

  const handleNameContinue = () => {
    const validation = validateName(friendName);
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
        setFriendAnswers(prev => ({
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
      setFriendAnswers(prev => ({
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
    if (!gameData) return;
    
    const finalAnswers = { ...friendAnswers };
    const currentQuestion = questions.find(q => q.step === step);
    if (currentQuestion) {
      finalAnswers[currentQuestion.field] = currentAnswer;
    }
    
    try {
      const updatedGame = await joinGame(gameData.id, friendName, finalAnswers);
      setGameData(updatedGame);
      setStep('result');
    } catch (error) {
      console.error('Failed to join game:', error);
      setError('Failed to submit answers');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Game not found</p>
        </div>
      </div>
    );
  }

  if (step === 'input') {
    return (
      <>
        {showCountdown && (
          <div 
            className={styles.countdownOverlay}
            style={{
              backdropFilter: countdown <= 2 ? `blur(${6 - (2 - countdown) * 3}px)` : `blur(10px)`,
              background: `rgba(0, 0, 0, ${0.8 - (3 - countdown) * 0.1})`
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
        <main className={styles.main}>
          <GameInput
            label="What's your name?"
            value={friendName}
            onChange={setFriendName}
            onContinue={handleNameContinue}
            buttonText="Continue"
            disabled={!friendName.trim() || isLoading}
          />
          {error && <p className={styles.error}>{error}</p>}
        </main>
      </>
    );
  }

  if (step === 'result') {
    const player1Score = gameData?.results?.player1Score || 0;
    const player2Score = gameData?.results?.player2Score || 0;
    const player1Name = gameData?.player1.name || '';
    const player2Name = friendName;

    return (
      <ResultsPage
        player1Name={player1Name}
        player1Score={player1Score}
        player1Answers={gameData?.player1.answers || {
          boyName: '',
          girlName: '',
          animal: '',
          place: '',
          thing: '',
          movie: ''
        }}
        player2Name={player2Name}
        player2Score={player2Score}
        player2Answers={friendAnswers}
        isWaiting={false}
        breakdown={gameData?.results?.breakdown}
      />
    );
  }

  const currentQuestion = questions.find(q => q.step === step);
  if (currentQuestion) {
    const isLastQuestion = questions.findIndex(q => q.step === step) === questions.length - 1;
    const hasAnswer = currentAnswer.trim();
    
    let buttonText;
    if (isLastQuestion) {
      buttonText = isLoading ? "Submitting..." : "Submit Answers";
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
