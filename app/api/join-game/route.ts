import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { GameData, PlayerData } from '../../types/game';
import { calculateScore, validateAllAnswers, validateName } from '../../utils/game';

export async function POST(request: NextRequest) {
  try {
    const { gameId, player2 }: { gameId: string; player2: PlayerData } = await request.json();
    
    if (!gameId || !player2?.name || !player2?.answers) {
      return NextResponse.json({ 
        error: 'Game ID, player name, and answers are required' 
      }, { status: 400 });
    }

    // Validate player name and answers
    const nameValidation = validateName(player2.name);
    if (!nameValidation.isValid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const answersValidation = validateAllAnswers(player2.answers);
    if (!answersValidation.isValid) {
      return NextResponse.json({ error: answersValidation.error }, { status: 400 });
    }
    
    // Get existing game data
    const existingGame = await kv.get(`game_${gameId}`) as GameData | null;
    
    if (!existingGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    if (existingGame.player2) {
      return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
    }
    
    // Calculate scores if scoring is enabled
    let results;
    if (existingGame.gameConfig.scoringEnabled) {
      const scores = calculateScore(
        existingGame.player1.answers,
        player2.answers
      );
      results = {
        player1Score: scores.player1Score,
        player2Score: scores.player2Score,
        breakdown: scores.breakdown
      };
    }
    
    // Update game with player2 data
    const updatedGame: GameData = {
      ...existingGame,
      player2,
      results,
      completedAt: new Date()
    };
    
    await kv.set(`game_${gameId}`, updatedGame);
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
  }
}
