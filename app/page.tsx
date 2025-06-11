'use client';

import { useState } from 'react';
import styles from './page.module.css';
import GameInput from './components/GameInput';

export default function Home() {
  const [name, setName] = useState('');
  const [animal, setAnimal] = useState('');
  const [step, setStep] = useState<'input' | 'animal' | 'generated'>('input');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleContinue = () => {
    if (name.trim()) {
      setStep('animal');
    }
  };

  const handleAnimalContinue = () => {
    if (animal.trim() && animal.toLowerCase().startsWith('b')) {
      generateUrl();
    }
  };

  const generateUrl = async () => {
    setIsGenerating(true);
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const url = `${window.location.origin}/${uniqueId}`;
    setGeneratedUrl(url);
    
    try {
      // Store the name for this URL in the database
      const response = await fetch('/api/store-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: uniqueId, name, animal }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to store name');
      }
      
      setStep('generated');
    } catch (error) {
      console.error('Error storing name:', error);
      alert('Failed to generate URL. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Challenge me!',
          url: generatedUrl,
        });
      } catch (err: any) {
        // Ignore if user cancels share sheet
        if (err.name !== 'AbortError') {
          console.error('Failed to share:', err);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(generatedUrl);
        alert('URL copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  if (step === 'input') {
    return (
      <GameInput
        label="enter ur name"
        value={name}
        onChange={setName}
        placeholder="your name here..."
        onContinue={handleContinue}
        buttonText="Continue"
        disabled={!name.trim()}
      />
    );
  }

  if (step === 'animal') {
    return (
      <GameInput
        label="enter an animal that starts with B"
        value={animal}
        onChange={setAnimal}
        placeholder="type here..."
        onContinue={handleAnimalContinue}
        buttonText="Continue"
        disabled={!animal.trim() || !animal.toLowerCase().startsWith('b')}
      />
    );
  }



  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.displayName}>challenge your friend</h1>
      </div>
      <button
        type="button"
        onClick={shareUrl}
        className={styles.submitButton}
      >
        send to friend
      </button>
    </div>
  );
}
