import styles from '../page.module.css';

interface GameInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onContinue: () => void;
  buttonText: string;
  disabled?: boolean;
}

export default function GameInput({
  label,
  value,
  onChange,
  placeholder,
  onContinue,
  buttonText,
  disabled = false
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
          className={styles.input}
          placeholder={placeholder}
        />
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
