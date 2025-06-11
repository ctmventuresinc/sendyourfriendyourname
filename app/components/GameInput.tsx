import styles from '../page.module.css';
import { PlayerAnswers, GAME_CATEGORIES } from '../types/game';

interface GameInputProps {
  answers: PlayerAnswers;
  onChange: (answers: PlayerAnswers) => void;
  onContinue: () => void;
  buttonText: string;
  disabled?: boolean;
}

export default function GameInput({
  answers,
  onChange,
  onContinue,
  buttonText,
  disabled = false
}: GameInputProps) {
  const handleInputChange = (field: keyof PlayerAnswers, value: string) => {
    onChange({
      ...answers,
      [field]: value
    });
  };

  const questions = [
    { field: 'boyName' as keyof PlayerAnswers, label: 'Name a Boy Name That Starts With B', placeholder: 'e.g., Benjamin' },
    { field: 'girlName' as keyof PlayerAnswers, label: 'Name a Girl Name That Starts With B', placeholder: 'e.g., Bella' },
    { field: 'animal' as keyof PlayerAnswers, label: 'Name an Animal That Starts With B', placeholder: 'e.g., Bear' },
    { field: 'place' as keyof PlayerAnswers, label: 'Name a Place That Starts With B', placeholder: 'e.g., Boston' },
    { field: 'thing' as keyof PlayerAnswers, label: 'Name a Thing That Starts With B', placeholder: 'e.g., Book' },
    { field: 'movie' as keyof PlayerAnswers, label: 'Name a Movie That Starts With B', placeholder: 'e.g., Batman' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {questions.map(({ field, label, placeholder }) => (
          <div key={field} style={{ marginBottom: '20px' }}>
            <label htmlFor={field} className={styles.label}>
              {label}
            </label>
            <input
              id={field}
              type="text"
              value={answers[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={styles.input}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className={styles.submitButton}
        disabled={disabled}
      >
        {buttonText}
      </button>
    </div>
  );
}
