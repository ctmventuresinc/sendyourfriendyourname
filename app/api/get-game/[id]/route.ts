import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { GameData } from '../../../types/game';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    // Get the game data from KV store
    const gameData = await kv.get(`game_${id}`) as GameData | null;
    
    if (!gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    return NextResponse.json(gameData);
  } catch (error) {
    console.error('Error getting game:', error);
    return NextResponse.json({ error: 'Failed to get game' }, { status: 500 });
  }
}
