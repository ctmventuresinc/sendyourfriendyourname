import { ValidationResult, GameConfig, PlayerAnswers, GAME_CATEGORIES } from '../types/game';

export const DEFAULT_GAME_CONFIG: GameConfig = {
  requiredLetter: 'b',
  categories: GAME_CATEGORIES,
  timeLimit: undefined,
  scoringEnabled: true
};

export function validateAnswer(
  entry: string, 
  requiredLetter: string = DEFAULT_GAME_CONFIG.requiredLetter
): ValidationResult {
  const trimmed = entry.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Entry cannot be empty' };
  }
  
  if (!trimmed.toLowerCase().startsWith(requiredLetter.toLowerCase())) {
    return { 
      isValid: false, 
      error: `Entry must start with "${requiredLetter.toUpperCase()}"` 
    };
  }
  
  return { isValid: true };
}

export function validateAllAnswers(answers: PlayerAnswers): ValidationResult {
  const answerValues = Object.values(answers);
  
  for (const answer of answerValues) {
    const validation = validateAnswer(answer);
    if (!validation.isValid) {
      return validation;
    }
  }
  
  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Name cannot be empty' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  return { isValid: true };
}

export function generateGameId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function generateGameUrl(gameId: string, baseUrl: string): string {
  return `${baseUrl}/${gameId}`;
}

export function calculateScore(
  player1Answers: PlayerAnswers, 
  player2Answers: PlayerAnswers
): { player1Score: number; player2Score: number; breakdown: Array<{category: string, player1Points: number, player2Points: number, reason: string}> } {
  let player1Score = 0;
  let player2Score = 0;
  const breakdown: Array<{category: string, player1Points: number, player2Points: number, reason: string}> = [];
  
  const categories = [
    { key: 'boyName' as keyof PlayerAnswers, name: 'Boy Name' },
    { key: 'girlName' as keyof PlayerAnswers, name: 'Girl Name' },
    { key: 'animal' as keyof PlayerAnswers, name: 'Animal' },
    { key: 'place' as keyof PlayerAnswers, name: 'Place' },
    { key: 'thing' as keyof PlayerAnswers, name: 'Thing' },
    { key: 'movie' as keyof PlayerAnswers, name: 'Movie' }
  ];
  
  for (const category of categories) {
    const p1Answer = player1Answers[category.key]?.toLowerCase().trim();
    const p2Answer = player2Answers[category.key]?.toLowerCase().trim();
    
    let p1Points = 0;
    let p2Points = 0;
    let reason = '';
    
    if (!p1Answer && !p2Answer) {
      reason = 'Both empty';
    } else if (!p1Answer) {
      p2Points = 5;
      reason = 'Only Player 2 answered';
    } else if (!p2Answer) {
      p1Points = 5;
      reason = 'Only Player 1 answered';
    } else if (p1Answer === p2Answer) {
      p1Points = 5;
      p2Points = 5;
      reason = 'Same answer';
    } else {
      p1Points = 10;
      p2Points = 10;
      reason = 'Different answers';
    }
    
    player1Score += p1Points;
    player2Score += p2Points;
    
    breakdown.push({
      category: category.name,
      player1Points: p1Points,
      player2Points: p2Points,
      reason
    });
  }
  
  return { player1Score, player2Score, breakdown };
}
