export const GAME_LETTER = 'T';

export const GAME_CATEGORIES = [
  `Boy Name That Starts With ${GAME_LETTER}`,
  `Girl Name That Starts With ${GAME_LETTER}`, 
  `Animal That Starts With ${GAME_LETTER}`,
  `Place That Starts With ${GAME_LETTER}`,
  `Thing That Starts With ${GAME_LETTER}`,
  `Movie That Starts With ${GAME_LETTER}`
] as const;

export interface PlayerAnswers {
  boyName: string;
  girlName: string;
  animal: string;
  place: string;
  thing: string;
  movie: string;
}

export interface PlayerData {
  name: string;
  answers: PlayerAnswers;
  submittedAt: Date;
  timeSpent?: number;
}

export interface GameConfig {
  requiredLetter: string;
  categories: readonly string[];
  timeLimit?: number;
  scoringEnabled: boolean;
}

export interface GameResults {
  player1Score: number;
  player2Score: number;
  breakdown: ScoreBreakdown[];
}

export interface ScoreBreakdown {
  category: string;
  player1Points: number;
  player2Points: number;
  reason: string;
}

export interface GameData {
  id: string;
  player1: PlayerData;
  player2?: PlayerData;
  gameConfig: GameConfig;
  results?: GameResults;
  createdAt: Date;
  completedAt?: Date;
}

export type GameStep = 'input' | 'animal' | 'generated' | 'result';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
