'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [name, setName] = useState('');
  const [step, setStep] = useState<'input' | 'display' | 'generated'>('input');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      setStep('display');
    }
  };

  const generateUrl = () => {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const url = `${window.location.origin}/${uniqueId}`;
    setGeneratedUrl(url);
    
    // Store the name for this URL in localStorage
    localStorage.setItem(`name_${uniqueId}`, name);
    
    setStep('generated');
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (step === 'input') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <label htmlFor="name" className={styles.label}>
            enter ur name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="your name here..."
          />
        </div>
        <button
          type="button"
          onClick={handleContinue}
          className={styles.submitButton}
          disabled={!name.trim()}
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === 'display') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.displayName}>{name}</h1>
        </div>
        <button
          type="button"
          onClick={generateUrl}
          className={styles.submitButton}
        >
          Generate URL
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.displayName}>{name}</h1>
        <p className={styles.urlText}>Your URL:</p>
        <div className={styles.urlContainer}>
          <input
            type="text"
            value={generatedUrl}
            readOnly
            className={styles.urlInput}
          />
          <button
            type="button"
            onClick={copyUrl}
            className={styles.copyButton}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
