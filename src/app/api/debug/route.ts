import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    env: {
      KV_REST_API_URL: process.env.KV_REST_API_URL ? 'SET' : 'NOT SET',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'SET' : 'NOT SET',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET',
    },
    kvConfigured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    initialDataSortie4: "13h00-16h30", // This is what initialData has
  };
  
  return NextResponse.json(debug, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
