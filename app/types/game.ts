export const GAME_CATEGORIES = [
  'Boy Name That Starts With B',
  'Girl Name That Starts With B', 
  'Animal That Starts With B',
  'Place That Starts With B',
  'Thing That Starts With B',
  'Movie That Starts With B'
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
