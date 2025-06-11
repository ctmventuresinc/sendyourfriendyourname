import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { GameData } from '../../types/game';
import { validateAllAnswers, validateName } from '../../utils/game';

export async function POST(request: NextRequest) {
  try {
    const gameData: GameData = await request.json();
    
    if (!gameData.id || !gameData.player1?.name || !gameData.player1?.answers) {
      return NextResponse.json({ 
        error: 'Game ID, player name, and answers are required' 
      }, { status: 400 });
    }

    // Validate player name and answers
    const nameValidation = validateName(gameData.player1.name);
    if (!nameValidation.isValid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const answersValidation = validateAllAnswers(gameData.player1.answers);
    if (!answersValidation.isValid) {
      return NextResponse.json({ error: answersValidation.error }, { status: 400 });
    }
    
    // Store the complete game data
    await kv.set(`game_${gameData.id}`, gameData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing game:', error);
    return NextResponse.json({ error: 'Failed to store game' }, { status: 500 });
  }
}
