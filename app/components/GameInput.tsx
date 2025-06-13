import styles from '../page.module.css';
import GameCountdown from './GameCountdown';

function formatLabelWithPurpleCategory(label: string): string {
  // Extract category (first part before "That Starts With")
  const match = label.match(/^([^T]+)\s*That Starts With/);
  if (match) {
    const category = match[1].trim();
    const rest = label.replace(match[0], 'That Starts With');
    return `<span style="color: #8b5cf6;">${category}</span> ${rest}`;
  }
  return label;
}

interface GameInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  buttonText: string;
  disabled?: boolean;
  buttonVariant?: 'continue' | 'skip';
  showCountdown?: boolean;
  onTimeout?: () => void;
}

export default function GameInput({
  label,
  value,
  onChange,
  onContinue,
  buttonText,
  disabled = false,
  buttonVariant = 'continue',
  showCountdown = false,
  onTimeout
}: GameInputProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {showCountdown && onTimeout && (
          <div className={styles.countdownContainer}>
            <GameCountdown onTimeout={onTimeout} />
          </div>
        )}
        <label htmlFor="input" className={styles.label}>
          <span dangerouslySetInnerHTML={{ __html: formatLabelWithPurpleCategory(label) }} />
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
