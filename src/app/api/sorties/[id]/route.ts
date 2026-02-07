import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'sorties.json');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    currentData.sorties = currentData.sorties.filter(
      (s: { id: number }) => s.id !== parseInt(id)
    );
    
    fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete sortie' }, { status: 500 });
  }
}
