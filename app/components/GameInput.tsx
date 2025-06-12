import styles from '../page.module.css';

interface GameInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  buttonText: string;
  disabled?: boolean;
  buttonVariant?: 'continue' | 'skip';
}

export default function GameInput({
  label,
  value,
  onChange,
  onContinue,
  buttonText,
  disabled = false,
  buttonVariant = 'continue'
}: GameInputProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <label htmlFor="input" className={styles.label}>
          {label}
        </label>
        <input
          id="input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) {
              onContinue();
            }
          }}
          className={styles.input}
          placeholder="type here..."
          enterKeyHint="done"
        />
        <button
          type="button"
          onClick={onContinue}
          className={`${styles.inlineButton} ${buttonVariant === 'skip' ? styles.inlineSkipButton : styles.inlineContinueButton}`}
          disabled={disabled}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
