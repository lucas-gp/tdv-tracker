import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData } from '@/lib/kv-data';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    const userPassword = (password || '').trim();

    if (!adminPassword || userPassword !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const currentData = await getData();
    
    currentData.sorties = currentData.sorties.filter(
      (s: { id: number }) => s.id !== parseInt(id)
    );
    
    await saveData(currentData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/sorties error:', error);
    return NextResponse.json({ error: 'Failed to delete sortie' }, { status: 500 });
  }
}
