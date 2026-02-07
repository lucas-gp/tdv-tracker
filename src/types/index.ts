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
