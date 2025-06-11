'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      console.log('Name submitted:', name);
      // Add your submit logic here
    }
  };

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
        type="submit"
        onClick={handleSubmit}
        className={styles.submitButton}
        disabled={!name.trim()}
      >
        Submit
      </button>
    </div>
  );
}
