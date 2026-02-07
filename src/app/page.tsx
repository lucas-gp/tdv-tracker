'use client';

import { useEffect, useState } from 'react';
import { SortiesData, Sortie } from '@/types';

function formatDateFR(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  };
  return date.toLocaleDateString('fr-FR', options);
}

function getCreneauLabel(creneau: string): string {
  if (creneau.startsWith('8h')) return '🌅 Journée complète';
  return '☀️ Après-midi';
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getSortieStatus(sortie: Sortie, isNext: boolean): { icon: string; class: string } {
  if (sortie.km !== null) {
    return { icon: '✅', class: 'bg-green-900/30 border-green-500/50' };
  }
  if (isNext) {
    return { icon: '📅', class: 'next-sortie bg-orange-900/30 border-orange-500' };
  }
  return { icon: '⏳', class: 'bg-gray-800/50 border-gray-600/30' };
}

export default function Home() {
  const [data, setData] = useState<SortiesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sorties')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">🚴 Chargement...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">Erreur de chargement des données</div>
      </div>
    );
  }

  const totalKm = data.sorties.reduce((sum, s) => sum + (s.km || 0), 0);
  const remainingKm = data.target_km - totalKm;
  const progress = (totalKm / data.target_km) * 100;
  const daysUntilTDV = getDaysUntil(data.tdv_date);
  
  const completedSorties = data.sorties.filter(s => s.km !== null);
  const averageKm = completedSorties.length > 0 
    ? totalKm / completedSorties.length 
    : 0;
  
  const remainingSorties = data.sorties.filter(s => s.km === null);
  const kmNeededPerSortie = remainingSorties.length > 0 
    ? remainingKm / remainingSorties.length 
    : 0;

  // Find next sortie (first one without km and in the future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextSortie = data.sorties.find(s => {
    const sortieDate = new Date(s.date);
    sortieDate.setHours(0, 0, 0, 0);
    return s.km === null && sortieDate >= today;
  });

  const daysUntilNextSortie = nextSortie ? getDaysUntil(nextSortie.date) : null;

  // Calculate remaining km after each sortie
  let runningTotal = data.target_km;
  const sortiesWithRemaining = data.sorties.map(sortie => {
    if (sortie.km !== null) {
      runningTotal -= sortie.km;
    }
    return { ...sortie, remainingAfter: sortie.km !== null ? runningTotal : null };
  });

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3">
          <span className="bike-icon">🚴</span>
          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-orange-400 bg-clip-text text-transparent">
            Traversée de la Drôme à Vélo 2026
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          Classe {data.class_name} — Maîtresse {data.teacher}
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat-card rounded-xl p-6 text-center card-hover">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-4xl md:text-5xl font-bold text-orange-400">{daysUntilTDV}</div>
          <div className="text-gray-400 mt-1">jours avant la TDV</div>
        </div>
        
        <div className="stat-card rounded-xl p-6 text-center card-hover">
          <div className="text-4xl mb-2">🛣️</div>
          <div className="text-4xl md:text-5xl font-bold text-green-400">{totalKm.toFixed(1)}</div>
          <div className="text-gray-400 mt-1">km parcourus</div>
        </div>
        
        <div className="stat-card rounded-xl p-6 text-center card-hover">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-4xl md:text-5xl font-bold text-blue-400">{remainingKm.toFixed(1)}</div>
          <div className="text-gray-400 mt-1">km restants</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="stat-card rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">🏫 École</span>
          <span className="text-2xl font-bold text-green-400">{progress.toFixed(1)}%</span>
          <span className="text-lg">🏁 TDV</span>
        </div>
        
        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-green-400 progress-bar-glow transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-1000 ease-out bike-icon"
            style={{ left: `calc(${Math.min(progress, 100)}% - 15px)` }}
          >
            🚴
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>0 km</span>
          <span>{data.target_km} km</span>
        </div>
      </div>

      {/* Sorties Table */}
      <div className="stat-card rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📋 Nos sorties d&apos;entraînement
        </h2>
        
        <div className="space-y-3">
          {sortiesWithRemaining.map((sortie, index) => {
            const isNext = nextSortie?.id === sortie.id;
            const status = getSortieStatus(sortie, isNext);
            
            return (
              <div 
                key={sortie.id}
                className={`rounded-lg p-4 border ${status.class} card-hover`}
              >
                <div className="flex flex-wrap items-center gap-3 md:gap-6">
                  <div className="text-2xl">{status.icon}</div>
                  
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-bold text-lg">
                      Sortie {index + 1}
                    </div>
                    <div className="text-gray-400">
                      {formatDateFR(sortie.date)} • {getCreneauLabel(sortie.creneau)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {sortie.km !== null ? (
                      <>
                        <div className="text-xl font-bold text-green-400">
                          {sortie.km} km
                        </div>
                        <div className="text-sm text-gray-400">
                          Reste: {sortie.remainingAfter?.toFixed(1)} km
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 italic">
                        À venir
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-2xl font-bold">{completedSorties.length}/{data.sorties.length}</div>
          <div className="text-sm text-gray-400">sorties effectuées</div>
        </div>
        
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">📈</div>
          <div className="text-2xl font-bold">{averageKm.toFixed(1)} km</div>
          <div className="text-sm text-gray-400">moyenne par sortie</div>
        </div>
        
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-2xl font-bold">{kmNeededPerSortie.toFixed(1)} km</div>
          <div className="text-sm text-gray-400">à faire par sortie</div>
        </div>
        
        <div className="stat-card rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">📅</div>
          <div className="text-2xl font-bold">
            {daysUntilNextSortie !== null ? `${daysUntilNextSortie} j` : '-'}
          </div>
          <div className="text-sm text-gray-400">prochaine sortie</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>🌿 La Drôme nous attend ! 🏔️</p>
      </footer>
    </main>
  );
}
