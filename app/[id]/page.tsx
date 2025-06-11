'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../page.module.css';
import GameInput from '../components/GameInput';
import { useGame } from '../hooks/useGame';
import { validateName, validateAllAnswers } from '../utils/game';
import { GameData, PlayerAnswers } from '../types/game';

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
  const [step, setStep] = useState<'input' | 'answers' | 'result'>('input');

  const { isLoading, error, joinGame } = useGame();

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
    if (validation.isValid) {
      setStep('answers');
    }
  };

  const handleAnswersContinue = async () => {
    const validation = validateAllAnswers(friendAnswers);
    if (validation.isValid && gameData) {
      try {
        const updatedGame = await joinGame(gameData.id, friendName, friendAnswers);
        setGameData(updatedGame);
        setStep('result');
      } catch (error) {
        console.error('Failed to join game:', error);
      }
    }
  };

  const allAnswersFilled = Object.values(friendAnswers).every(answer => answer.trim() !== '');

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
        <div className={styles.container}>
          <div className={styles.content}>
            <label htmlFor="name" className={styles.label}>
              What's your name?
            </label>
            <input
              id="name"
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className={styles.input}
              placeholder="Enter your name"
            />
          </div>
          <button
            type="button"
            onClick={handleNameContinue}
            className={styles.submitButton}
            disabled={!friendName.trim() || isLoading}
          >
            Continue
          </button>
        </div>
      </main>
    );
  }

  if (step === 'answers') {
    return (
      <main className={styles.main}>
        <GameInput
          answers={friendAnswers}
          onChange={setFriendAnswers}
          onContinue={handleAnswersContinue}
          buttonText="Submit Answers"
          disabled={!allAnswersFilled || isLoading}
        />
      </main>
    );
  }

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
