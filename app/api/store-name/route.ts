import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, name } = await request.json();
    
    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }
    
    // Store the name with the ID as key
    await kv.set(`name_${id}`, name);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing name:', error);
    return NextResponse.json({ error: 'Failed to store name' }, { status: 500 });
  }
}
