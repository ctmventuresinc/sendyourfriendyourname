import { useState, useCallback } from 'react';
import { GameStep, GameData, PlayerData, GameConfig, PlayerAnswers } from '../types/game';
import { 
  validateAllAnswers, 
  validateName, 
  generateGameId, 
  generateGameUrl,
  DEFAULT_GAME_CONFIG 
} from '../utils/game';

interface UseGameOptions {
  gameConfig?: Partial<GameConfig>;
}

export function useGame(options: UseGameOptions = {}) {
  const [step, setStep] = useState<GameStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  
  const config: GameConfig = {
    ...DEFAULT_GAME_CONFIG,
    ...options.gameConfig
  };

  const createGame = useCallback(async (playerName: string, answers: PlayerAnswers) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nameValidation = validateName(playerName);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error);
      }

      const answersValidation = validateAllAnswers(answers);
      if (!answersValidation.isValid) {
        throw new Error(answersValidation.error);
      }

      const gameId = generateGameId();
      const newGameData: GameData = {
        id: gameId,
        player1: {
          name: playerName,
          answers,
          submittedAt: new Date()
        },
        gameConfig: config,
        createdAt: new Date()
      };

      // Store in database
      const response = await fetch('/api/store-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGameData)
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      setGameData(newGameData);
      setStep('generated');
      
      return { success: true, gameId };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const joinGame = useCallback(async (gameId: string, playerName: string, answers: PlayerAnswers) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nameValidation = validateName(playerName);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error);
      }

      const answersValidation = validateAllAnswers(answers);
      if (!answersValidation.isValid) {
        throw new Error(answersValidation.error);
      }

      // Update game with player2 data
      const response = await fetch('/api/join-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          player2: {
            name: playerName,
            answers,
            submittedAt: new Date()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join game');
      }

      const updatedGameData = await response.json();
      setGameData(updatedGameData);
      setStep('result');
      
      return updatedGameData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const fetchGame = useCallback(async (gameId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/get-game/${gameId}`);
      if (!response.ok) {
        throw new Error('Game not found');
      }
      
      const data = await response.json();
      setGameData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetGame = useCallback(() => {
    setStep('input');
    setGameData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    step,
    setStep,
    isLoading,
    error,
    gameData,
    config,
    createGame,
    joinGame,
    fetchGame,
    resetGame
  };
}
