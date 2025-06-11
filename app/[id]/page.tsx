'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../page.module.css';
import GameInput from '../components/GameInput';
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

  const { isLoading, joinGame } = useGame();

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
    );
  }

  if (step === 'result') {
    const getScoreReasonClass = (reason: string) => {
      if (reason.includes('Different')) return styles.unique;
      if (reason.includes('Same')) return styles.same;
      if (reason.includes('empty') || reason.includes('Only')) return styles.noAnswer;
      return '';
    };

    const getScoreReasonText = (reason: string) => {
      if (reason.includes('Different')) return 'unique';
      if (reason.includes('Same')) return 'same';
      if (reason.includes('empty')) return 'no answer';
      if (reason.includes('Only Player 1')) return 'only you';
      if (reason.includes('Only Player 2')) return 'only friend';
      return reason.toLowerCase();
    };

    return (
      <main className={styles.main}>
        <div className={styles.resultsContainer}>
          {error && <p className={styles.error}>{error}</p>}
          
          <div className={styles.scoreHeader}>
            {(() => {
              const player1Score = gameData?.results?.player1Score || 0;
              const player2Score = gameData?.results?.player2Score || 0;
              
              if (player1Score > player2Score) {
                return (
                  <h1 className={styles.scoreTitle}>
                    {gameData?.player1.name} Wins! {player1Score} points
                  </h1>
                );
              } else if (player2Score > player1Score) {
                return (
                  <h1 className={styles.scoreTitle}>
                    {friendName} Wins! {player2Score} points
                  </h1>
                );
              } else {
                return (
                  <h1 className={styles.scoreTitle}>
                    It's a Tie! {player1Score} points each
                  </h1>
                );
              }
            })()}
            <p className={styles.scoreSubtitle}>
              {gameData?.player1.name}: {gameData?.results?.player1Score || 0} pts • {friendName}: {gameData?.results?.player2Score || 0} pts
            </p>
          </div>
          
          <div className={styles.resultsGrid}>
            {gameData?.results?.breakdown.map((item, index) => {
              const categories = [
                { name: 'Boy Name', field: 'boyName' as keyof PlayerAnswers },
                { name: 'Girl Name', field: 'girlName' as keyof PlayerAnswers },
                { name: 'Animal', field: 'animal' as keyof PlayerAnswers },
                { name: 'Place', field: 'place' as keyof PlayerAnswers },
                { name: 'Thing', field: 'thing' as keyof PlayerAnswers },
                { name: 'Movie', field: 'movie' as keyof PlayerAnswers }
              ];
              
              const category = categories[index];
              const player1Answer = gameData?.player1.answers[category.field] || '—';
              const player2Answer = friendAnswers[category.field] || '—';
              
              return (
                <div key={index} className={styles.resultRow}>
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryName}>{item.category}</h3>
                    <p className={styles.answersComparison}>
                      {gameData?.player1.name}: {player1Answer} • {friendName}: {player2Answer}
                    </p>
                  </div>
                  <div className={styles.scoreInfo}>
                    <p className={`${styles.scoreReason} ${getScoreReasonClass(item.reason)}`}>
                      {getScoreReasonText(item.reason)} {item.player2Points} pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className={styles.shareButton}>
            📤 Share your Score
          </button>
          
          <p className={styles.nextPuzzle}>
            Next puzzle in: 7h 24m 2s
          </p>
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
          buttonText={isLastQuestion ? (isLoading ? "Submitting..." : "Submit Answers") : "Continue"}
          disabled={!currentAnswer.trim() || isLoading}
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return null;
}
