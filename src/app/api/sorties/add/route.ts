import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/kv-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, date, creneau } = body;

    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const userPassword = (password || '').trim();

    if (!adminPassword || userPassword !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const currentData = await getData();
    
    const maxId = currentData.sorties.reduce((max: number, s: { id: number }) => Math.max(max, s.id), 0);
    
    currentData.sorties.push({
      id: maxId + 1,
      date,
      creneau,
      km: null
    });
    
    // Sort by date
    currentData.sorties.sort((a: { date: string }, b: { date: string }) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    await saveData(currentData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/sorties/add error:', error);
    return NextResponse.json({ error: 'Failed to add sortie' }, { status: 500 });
  }
}
