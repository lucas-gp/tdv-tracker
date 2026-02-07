import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/db';

// Disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getData();
    const response = NextResponse.json(data);
    // Ensure no caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('GET /api/sorties error:', error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, sorties } = body;

    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const userPassword = (password || '').trim();

    if (!adminPassword || userPassword !== adminPassword) {
      console.log('Password mismatch. Expected length:', adminPassword.length, 'Got length:', userPassword.length);
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const currentData = await getData();
    currentData.sorties = sorties;
    
    await saveData(currentData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/sorties error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
