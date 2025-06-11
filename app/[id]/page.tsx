'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../page.module.css';

export default function NamePage() {
  const params = useParams();
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      const id = params.id as string;
      if (id) {
        try {
          const response = await fetch(`/api/get-name/${id}`);
          if (response.ok) {
            const data = await response.json();
            setName(data.name);
          } else {
            setName(null);
          }
        } catch (error) {
          console.error('Error fetching name:', error);
          setName(null);
        }
        setLoading(false);
      }
    };

    fetchName();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!name) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Name not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.displayName}>{name}</h1>
      </div>
    </div>
  );
}
