import { NextRequest, NextResponse } from 'next/server';
import { addSortie } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, date, creneau } = body;

    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const userPassword = (password || '').trim();

    if (!adminPassword || userPassword !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await addSortie(date, creneau);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/sorties/add error:', error);
    return NextResponse.json({ error: 'Failed to add sortie' }, { status: 500 });
  }
}
