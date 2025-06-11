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
    const player1Score = gameData?.results?.player1Score || 0;
    const player2Score = gameData?.results?.player2Score || 0;
    const player1Name = gameData?.player1.name || '';
    const player2Name = friendName;

    const categories = [
      { name: 'Boy Name', field: 'boyName' as keyof PlayerAnswers },
      { name: 'Girl Name', field: 'girlName' as keyof PlayerAnswers },
      { name: 'Animal', field: 'animal' as keyof PlayerAnswers },
      { name: 'Place', field: 'place' as keyof PlayerAnswers },
      { name: 'Thing', field: 'thing' as keyof PlayerAnswers },
      { name: 'Movie', field: 'movie' as keyof PlayerAnswers }
    ];

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
              <h2 className={styles.playerName}>{player1Name.toUpperCase()}</h2>
              <p className={styles.playerScore}>Score: {player1Score}</p>
            </div>
            <div className={styles.player}>
              <h2 className={styles.playerName}>{player2Name.toUpperCase()}</h2>
              <p className={styles.playerScore}>Score: {player2Score}</p>
            </div>
          </div>

          <div className={styles.answersContainer}>
            {categories.map((category, index) => {
              const player1Answer = gameData?.player1.answers[category.field] || '';
              const player2Answer = friendAnswers[category.field] || '';
              const breakdown = gameData?.results?.breakdown[index];
              const points = breakdown?.player1Points || 0;
              
              return (
                <div key={category.field} className={styles.answerRow}>
                  <div className={styles.answerLeft}>
                    <div className={styles.answerBox}>
                      {player1Answer.toUpperCase()}
                    </div>
                    <div className={styles.scoreBox}>
                      +{points}
                    </div>
                  </div>
                  <div className={styles.answerRight}>
                    <div className={styles.answerBox}>
                      {player2Answer.toUpperCase()}
                    </div>
                    <div className={styles.scoreBox}>
                      +{breakdown?.player2Points || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className={styles.shareScoreButton}>
            SHARE YOUR SCORE
          </button>
        </div>
      </div>
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
