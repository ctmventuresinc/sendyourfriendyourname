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
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>Results</h1>
            {error && <p className={styles.error}>{error}</p>}
            
            <div style={{ marginBottom: '30px' }}>
              <h2>Answers:</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Boy Name:</h3>
                <p>{gameData?.player1.name}: {gameData?.player1.answers.boyName}</p>
                <p>{friendName}: {friendAnswers.boyName}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Girl Name:</h3>
                <p>{gameData?.player1.name}: {gameData?.player1.answers.girlName}</p>
                <p>{friendName}: {friendAnswers.girlName}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Animal:</h3>
                <p>{gameData?.player1.name}: {gameData?.player1.answers.animal}</p>
                <p>{friendName}: {friendAnswers.animal}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Place:</h3>
                <p>{gameData?.player1.name}: {gameData?.player1.answers.place}</p>
                <p>{friendName}: {friendAnswers.place}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Thing:</h3>
                <p>{gameData?.player1.name}: {gameData?.player1.answers.thing}</p>
                <p>{friendName}: {friendAnswers.thing}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Movie:</h3>
                <p>{gameData?.player1.name}: {gameData?.player1.answers.movie}</p>
                <p>{friendName}: {friendAnswers.movie}</p>
              </div>
            </div>
            
            {gameData?.results && (
              <div>
                <h2>Score:</h2>
                <p>{gameData.player1.name}: {gameData.results.player1Score} points</p>
                <p>{friendName}: {gameData.results.player2Score} points</p>
                
                <h3>Breakdown:</h3>
                {gameData.results.breakdown.map((item, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <strong>{item.category}:</strong> {item.reason} 
                    ({gameData.player1.name}: {item.player1Points}, {friendName}: {item.player2Points})
                  </div>
                ))}
              </div>
            )}
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
          buttonText={isLastQuestion ? (isLoading ? "Submitting..." : "Submit Answers") : "Continue"}
          disabled={!currentAnswer.trim() || isLoading}
        />
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return null;
}
