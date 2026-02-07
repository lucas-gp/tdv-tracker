import Redis from 'ioredis';

const KV_KEY = 'sorties-data';

// Redis client (lazy initialization)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL);
  }
  return redis;
}

// Initial data (will be used if Redis is empty or not configured)
const initialData = {
  target_km: 250,
  tdv_date: "2026-06-01",
  class_name: "CM1/CM2",
  teacher: "Sabrina",
  sorties: [
    { id: 1, date: "2026-01-16", creneau: "13h00-16h30", km: null },
    { id: 2, date: "2026-01-23", creneau: "13h00-16h30", km: null },
    { id: 3, date: "2026-01-30", creneau: "13h00-16h30", km: null },
    { id: 4, date: "2026-02-06", creneau: "13h00-16h30", km: null }, // Corrigé: après-midi
    { id: 5, date: "2026-02-27", creneau: "8h20-16h30", km: null },
    { id: 6, date: "2026-03-06", creneau: "8h20-16h30", km: null },
    { id: 7, date: "2026-03-13", creneau: "8h20-16h30", km: null },
    { id: 8, date: "2026-03-20", creneau: "8h20-16h30", km: null },
    { id: 9, date: "2026-03-27", creneau: "8h20-16h30", km: null },
    { id: 10, date: "2026-04-03", creneau: "8h20-16h30", km: null },
    { id: 11, date: "2026-04-23", creneau: "13h00-16h30", km: null },
    { id: 12, date: "2026-04-24", creneau: "8h20-16h30", km: null },
    { id: 13, date: "2026-05-21", creneau: "13h00-16h30", km: null },
    { id: 14, date: "2026-05-22", creneau: "8h20-16h30", km: null },
    { id: 15, date: "2026-05-29", creneau: "8h20-16h30", km: null }
  ]
};

export interface Sortie {
  id: number;
  date: string;
  creneau: string;
  km: number | null;
}

export interface SortiesData {
  target_km: number;
  tdv_date: string;
  class_name: string;
  teacher: string;
  sorties: Sortie[];
}

export async function getData(): Promise<SortiesData> {
  const client = getRedis();
  
  if (!client) {
    console.log('Redis not configured, using initial data');
    return { ...initialData };
  }
  
  try {
    const data = await client.get(KV_KEY);
    if (!data) {
      console.log('Redis empty, initializing with initial data');
      await client.set(KV_KEY, JSON.stringify(initialData));
      return { ...initialData };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Redis read error:', error);
    return { ...initialData };
  }
}

export async function saveData(data: SortiesData): Promise<void> {
  const client = getRedis();
  
  if (!client) {
    console.warn('Redis not configured, cannot save data');
    throw new Error('Redis not configured - read-only mode');
  }
  
  try {
    await client.set(KV_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Redis write error:', error);
    throw error;
  }
}

export { initialData };
