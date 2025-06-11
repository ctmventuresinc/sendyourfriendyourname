'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../page.module.css';
import GameInput from '../components/GameInput';

export default function NamePage() {
  const params = useParams();
  const [gameData, setGameData] = useState<{name: string, animal: string} | null>(null);
  const [friendName, setFriendName] = useState('');
  const [friendAnimal, setFriendAnimal] = useState('');
  const [step, setStep] = useState<'input' | 'animal' | 'result'>('input');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      const id = params.id as string;
      if (id) {
        try {
          const response = await fetch(`/api/get-name/${id}`);
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
    if (friendName.trim()) {
      setStep('animal');
    }
  };

  const handleAnimalContinue = () => {
    if (friendAnimal.trim() && friendAnimal.toLowerCase().startsWith('b')) {
      setStep('result');
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
      <GameInput
        label="enter ur name"
        value={friendName}
        onChange={setFriendName}
        placeholder="your name here..."
        onContinue={handleNameContinue}
        buttonText="Continue"
        disabled={!friendName.trim()}
      />
    );
  }

  if (step === 'animal') {
    return (
      <GameInput
        label="enter an animal that starts with B"
        value={friendAnimal}
        onChange={setFriendAnimal}
        placeholder="type here..."
        onContinue={handleAnimalContinue}
        buttonText="Continue"
        disabled={!friendAnimal.trim() || !friendAnimal.toLowerCase().startsWith('b')}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.displayName}>Results</h1>
        <p className={styles.label}>{gameData.name} said: {gameData.animal}</p>
        <p className={styles.label}>{friendName} said: {friendAnimal}</p>
      </div>
      <button
        type="button"
        className={styles.submitButton}
      >
        send to {friendName}
      </button>
    </div>
  );
}
