import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'sorties.json');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, date, creneau } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
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
    
    fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to add sortie' }, { status: 500 });
  }
}
