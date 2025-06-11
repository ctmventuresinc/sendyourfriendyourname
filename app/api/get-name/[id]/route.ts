import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    // Get the name from KV store
    const name = await kv.get(`name_${id}`);
    
    if (!name) {
      return NextResponse.json({ error: 'Name not found' }, { status: 404 });
    }
    
    return NextResponse.json({ name });
  } catch (error) {
    console.error('Error getting name:', error);
    return NextResponse.json({ error: 'Failed to get name' }, { status: 500 });
  }
}
