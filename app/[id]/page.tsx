'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../page.module.css';

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
      <div className={styles.container}>
        <div className={styles.content}>
          <label htmlFor="friendName" className={styles.label}>
            enter ur name
          </label>
          <input
            id="friendName"
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className={styles.input}
            placeholder="your name here..."
          />
        </div>
        <button
          type="button"
          onClick={handleNameContinue}
          className={styles.submitButton}
          disabled={!friendName.trim()}
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === 'animal') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <label htmlFor="friendAnimal" className={styles.label}>
            enter an animal that starts with B
          </label>
          <input
            id="friendAnimal"
            type="text"
            value={friendAnimal}
            onChange={(e) => setFriendAnimal(e.target.value)}
            className={styles.input}
            placeholder="bear, bird, butterfly..."
          />
        </div>
        <button
          type="button"
          onClick={handleAnimalContinue}
          className={styles.submitButton}
          disabled={!friendAnimal.trim() || !friendAnimal.toLowerCase().startsWith('b')}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.displayName}>Results!</h1>
        <p className={styles.label}>{gameData.name} said: {gameData.animal}</p>
        <p className={styles.label}>{friendName} said: {friendAnimal}</p>
      </div>
    </div>
  );
}
