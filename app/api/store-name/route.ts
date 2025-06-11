import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, name, animal } = await request.json();
    
    if (!id || !name || !animal) {
      return NextResponse.json({ error: 'ID, name and animal are required' }, { status: 400 });
    }
    
    // Store the game data with the ID as key
    await kv.set(`game_${id}`, { name, animal });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing name:', error);
    return NextResponse.json({ error: 'Failed to store name' }, { status: 500 });
  }
}
