import { NextRequest, NextResponse } from 'next/server';
import { deleteSortie } from '@/lib/db';

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

    await deleteSortie(parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/sorties error:', error);
    return NextResponse.json({ error: 'Failed to delete sortie' }, { status: 500 });
  }
}
