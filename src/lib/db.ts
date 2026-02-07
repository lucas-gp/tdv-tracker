import { sql } from '@vercel/postgres';

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
  try {
    // Get config
    const configResult = await sql`SELECT key, value FROM config`;
    const config: Record<string, string> = {};
    configResult.rows.forEach(row => {
      config[row.key] = row.value;
    });

    // Get sorties
    const sortiesResult = await sql`SELECT id, date, creneau, km FROM sorties ORDER BY date, id`;
    const sorties = sortiesResult.rows.map(row => ({
      id: row.id,
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
      creneau: row.creneau,
      km: row.km !== null ? parseFloat(row.km) : null
    }));

    return {
      target_km: parseInt(config.target_km) || 250,
      tdv_date: config.tdv_date || '2026-06-01',
      class_name: config.class_name || 'CM1/CM2',
      teacher: config.teacher || 'Sabrina',
      sorties
    };
  } catch (error) {
    console.error('DB read error:', error);
    // Return default data if DB fails
    return getDefaultData();
  }
}

export async function saveData(data: SortiesData): Promise<void> {
  try {
    // Update each sortie
    for (const sortie of data.sorties) {
      await sql`
        UPDATE sorties 
        SET km = ${sortie.km}
        WHERE id = ${sortie.id}
      `;
    }
  } catch (error) {
    console.error('DB write error:', error);
    throw error;
  }
}

export async function updateSortieKm(id: number, km: number | null): Promise<void> {
  await sql`UPDATE sorties SET km = ${km} WHERE id = ${id}`;
}

export async function addSortie(date: string, creneau: string): Promise<Sortie> {
  const result = await sql`
    INSERT INTO sorties (date, creneau) 
    VALUES (${date}, ${creneau})
    RETURNING id, date, creneau, km
  `;
  const row = result.rows[0];
  return {
    id: row.id,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    creneau: row.creneau,
    km: row.km !== null ? parseFloat(row.km) : null
  };
}

export async function deleteSortie(id: number): Promise<void> {
  await sql`DELETE FROM sorties WHERE id = ${id}`;
}

function getDefaultData(): SortiesData {
  return {
    target_km: 250,
    tdv_date: "2026-06-01",
    class_name: "CM1/CM2",
    teacher: "Sabrina",
    sorties: []
  };
}
