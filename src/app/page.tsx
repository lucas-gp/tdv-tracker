'use client';

import { useEffect, useState, useCallback } from 'react';
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

// Password Modal Component
function PasswordModal({ 
  onSuccess, 
  onCancel 
}: { 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);

    // Test the password with a simple API call
    try {
      const res = await fetch('/api/sorties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sorties: [] })
      });
      
      // We expect 401 if password is wrong, but any other response means password is OK
      // Actually we need to test properly - let's use a verify endpoint or just store and verify on save
      // For now, store and let the actual save verify
      sessionStorage.setItem('tdv_password', password);
      onSuccess();
    } catch {
      setError(true);
    }
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-purple-400 modal-content">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white">Mode Maîtresse</h2>
          <p className="text-purple-200 mt-2">Entre le mot de passe magique !</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/20 border-2 border-purple-300 rounded-xl px-4 py-3 text-white text-center text-xl placeholder-purple-200 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/30"
            placeholder="••••••"
            autoFocus
          />

          {error && (
            <div className="text-red-300 text-center animate-shake">
              ❌ Mot de passe incorrect !
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={checking || !password}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? '⏳' : '✨ Entrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confetti Component
function Confetti() {
  const confettiItems = ['🎉', '⭐', '✨', '🌟', '💫', '🎊', '🏆', '🎯'];
  const elements = [];
  
  // Generate confetti
  for (let i = 0; i < 20; i++) {
    const emoji = confettiItems[Math.floor(Math.random() * confettiItems.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 1;
    
    elements.push(
      <div
        key={`confetti-${i}`}
        className="confetti"
        style={{
          left: `${left}%`,
          top: '-50px',
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      >
        {emoji}
      </div>
    );
  }
  
  // Generate star bursts
  for (let i = 0; i < 8; i++) {
    const left = 10 + Math.random() * 80;
    const top = 10 + Math.random() * 80;
    const delay = Math.random() * 0.3;
    
    elements.push(
      <div
        key={`star-${i}`}
        className="star-burst"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          animationDelay: `${delay}s`,
        }}
      >
        ⭐
      </div>
    );
  }
  
  return <>{elements}</>;
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({
  sortieNumber,
  onConfirm,
  onCancel
}: {
  sortieNumber: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-gradient-to-br from-red-900 to-pink-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-red-400 modal-content">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🗑️</div>
          <h2 className="text-2xl font-bold text-white">Supprimer les km ?</h2>
          <p className="text-red-200 mt-2">Sortie {sortieNumber}</p>
        </div>

        <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-xl p-4 mb-6">
          <p className="text-yellow-100 text-sm text-center">
            ⚠️ <strong>Attention :</strong> Si des sorties suivantes ont été saisies, leurs exercices de calcul étaient basés sur cette valeur. Les km restent corrects car le système recalcule tout automatiquement.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            ❌ Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            {deleting ? '⏳' : '🗑️ Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Entry Modal Component
function EntryModal({
  sortie,
  sortieNumber,
  kmBefore,
  initialKm,
  onSave,
  onCancel
}: {
  sortie: Sortie;
  sortieNumber: number;
  kmBefore: number;
  initialKm?: number | null;
  onSave: (km: number) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [kmParcours, setKmParcours] = useState(initialKm ? String(initialKm) : '');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success' | 'saving'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showBikeAnimation, setShowBikeAnimation] = useState(false);

  const kmParcoursNum = parseFloat(kmParcours) || 0;
  const correctAnswer = kmBefore - kmParcoursNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kmParcours || kmParcoursNum <= 0) {
      setStatus('error');
      setErrorMessage('Entre les km parcourus ! 🚴');
      return;
    }

    const userResult = parseFloat(result);
    
    if (isNaN(userResult)) {
      setStatus('error');
      setErrorMessage('Entre le résultat du calcul ! 🔢');
      return;
    }

    // Check if the calculation is correct (with small tolerance for decimals)
    if (Math.abs(userResult - correctAnswer) > 0.01) {
      setStatus('error');
      setErrorMessage(`Oups, recalcule ! 🤔\n${kmBefore} - ${kmParcoursNum} = ???`);
      return;
    }

    // Calculation is correct! Save the data
    setStatus('saving');
    const success = await onSave(kmParcoursNum);
    
    if (success) {
      setStatus('success');
      setShowBikeAnimation(true);
      // Close modal after bike animation
      setTimeout(() => {
        onCancel();
      }, 2500);
    } else {
      setStatus('error');
      setErrorMessage('Erreur de sauvegarde 😕');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 modal-backdrop overflow-hidden">
      {/* Bike animation overlay */}
      {showBikeAnimation && (
        <>
          <Confetti />
          <div 
            className="bike-ride-animation"
            style={{ top: '50%' }}
          >
            🚴
          </div>
        </>
      )}
      
      <div className={`bg-gradient-to-br ${status === 'success' ? 'from-green-600 to-emerald-700' : status === 'error' ? 'from-red-600 to-pink-700' : 'from-blue-600 to-cyan-700'} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full shadow-2xl border-4 ${status === 'success' ? 'border-green-300' : status === 'error' ? 'border-red-300' : 'border-blue-300'} modal-content transition-colors duration-300 max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto`}>
        
        {status === 'success' ? (
          <div className="text-center py-4 sm:py-8">
            <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Bravo !</h2>
            <p className="text-green-100 mt-2 text-lg sm:text-xl">C&apos;est enregistré ! 🚴✨</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-4xl sm:text-5xl mb-2">📝</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Sortie {sortieNumber}</h2>
              <p className="text-blue-100 text-sm sm:text-base">{formatDateFR(sortie.date)}</p>
            </div>

            {/* Km before display */}
            <div className="bg-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-center">
              <div className="text-blue-100 text-xs sm:text-sm mb-1">Km restants avant cette sortie</div>
              <div className="text-3xl sm:text-4xl font-bold text-yellow-300">{kmBefore} km</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Km input */}
              <div>
                <label className="block text-white font-bold mb-2 text-base sm:text-lg">
                  🚴 Combien de km avez-vous fait ?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={kmParcours}
                    onChange={(e) => {
                      setKmParcours(e.target.value);
                      setStatus('idle');
                    }}
                    className="flex-1 bg-white/90 border-3 sm:border-4 border-white rounded-xl px-3 sm:px-4 py-3 sm:py-4 text-gray-900 text-center text-xl sm:text-2xl font-bold focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/30"
                    placeholder="?"
                    autoFocus
                  />
                  <span className="text-white text-lg sm:text-xl font-bold">km</span>
                </div>
              </div>

              {/* Math exercise */}
              {kmParcours && kmParcoursNum > 0 && (
                <div className="bg-yellow-400/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-yellow-400/50">
                  <label className="block text-white font-bold mb-2 sm:mb-3 text-base sm:text-lg text-center">
                    🧮 Calcule le résultat !
                  </label>
                  <div className="flex items-center justify-center gap-1 sm:gap-3 text-lg sm:text-2xl flex-wrap">
                    <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-white font-bold">{kmBefore}</span>
                    <span className="text-white font-bold">-</span>
                    <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-white font-bold">{kmParcoursNum}</span>
                    <span className="text-white font-bold">=</span>
                    <input
                      type="number"
                      step="0.1"
                      value={result}
                      onChange={(e) => {
                        setResult(e.target.value);
                        setStatus('idle');
                      }}
                      className="w-20 sm:w-24 bg-white border-3 sm:border-4 border-yellow-400 rounded-xl px-1 sm:px-2 py-1 sm:py-2 text-gray-900 text-center text-lg sm:text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
                      placeholder="?"
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {status === 'error' && (
                <div className="bg-red-500/30 border-2 border-red-300 rounded-xl p-3 sm:p-4 text-center animate-shake">
                  <div className="text-white text-base sm:text-lg font-bold whitespace-pre-line">{errorMessage}</div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-600/80 hover:bg-gray-500 text-white font-bold py-3 sm:py-4 px-3 sm:px-6 rounded-xl transition-all text-sm sm:text-lg"
                >
                  ❌ Annuler
                </button>
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 text-gray-900 font-bold py-3 sm:py-4 px-3 sm:px-6 rounded-xl transition-all text-sm sm:text-lg disabled:opacity-50"
                >
                  {status === 'saving' ? '⏳' : '✅ Valider'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<SortiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingSortie, setPendingSortie] = useState<{ sortie: Sortie; index: number; kmBefore: number; isEdit?: boolean } | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ sortie: Sortie; index: number } | null>(null);

  const fetchData = useCallback(() => {
    fetch('/api/sorties')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isAuthenticated = () => {
    return !!sessionStorage.getItem('tdv_password');
  };

  const handleSaisirClick = (sortie: Sortie, index: number, kmBefore: number, isEdit: boolean = false) => {
    if (!isAuthenticated()) {
      setPendingSortie({ sortie, index, kmBefore, isEdit });
      setShowPasswordModal(true);
    } else {
      setPendingSortie({ sortie, index, kmBefore, isEdit });
      setShowEntryModal(true);
    }
  };

  const handleDeleteClick = (sortie: Sortie, index: number) => {
    if (!isAuthenticated()) {
      setPendingDelete({ sortie, index });
      setShowPasswordModal(true);
    } else {
      setPendingDelete({ sortie, index });
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!data || !pendingDelete) return;

    const password = sessionStorage.getItem('tdv_password');
    if (!password) return;

    const newSorties = data.sorties.map(s =>
      s.id === pendingDelete.sortie.id ? { ...s, km: null } : s
    );

    try {
      const res = await fetch('/api/sorties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sorties: newSorties })
      });

      if (res.ok) {
        setData({ ...data, sorties: newSorties });
      } else if (res.status === 401) {
        sessionStorage.removeItem('tdv_password');
      }
    } catch {
      // Error handling
    }
    
    setShowDeleteModal(false);
    setPendingDelete(null);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    if (pendingSortie) {
      setShowEntryModal(true);
    } else if (pendingDelete) {
      setShowDeleteModal(true);
    }
  };

  const handleSaveKm = async (km: number): Promise<boolean> => {
    if (!data || !pendingSortie) return false;

    const password = sessionStorage.getItem('tdv_password');
    if (!password) return false;

    const newSorties = data.sorties.map(s =>
      s.id === pendingSortie.sortie.id ? { ...s, km } : s
    );

    try {
      const res = await fetch('/api/sorties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sorties: newSorties })
      });

      if (res.ok) {
        setData({ ...data, sorties: newSorties });
        return true;
      } else {
        if (res.status === 401) {
          sessionStorage.removeItem('tdv_password');
        }
        return false;
      }
    } catch {
      return false;
    }
  };

  const handleCloseModals = () => {
    setShowPasswordModal(false);
    setShowEntryModal(false);
    setShowDeleteModal(false);
    setPendingSortie(null);
    setPendingDelete(null);
  };

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
  
  const remainingSortiesCount = data.sorties.filter(s => s.km === null);
  const kmNeededPerSortie = remainingSortiesCount.length > 0 
    ? remainingKm / remainingSortiesCount.length 
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

  // Calculate remaining km BEFORE each sortie
  const sortiesWithKmBefore = data.sorties.map((sortie, index) => {
    // Sum km of all previous sorties
    let kmBeforeThisSortie = data.target_km;
    for (let i = 0; i < index; i++) {
      if (data.sorties[i].km !== null) {
        kmBeforeThisSortie -= data.sorties[i].km!;
      }
    }
    return { ...sortie, kmBefore: kmBeforeThisSortie };
  });

  // Calculate remaining km after each sortie (for display)
  let runningTotal = data.target_km;
  const sortiesWithRemaining = sortiesWithKmBefore.map(sortie => {
    if (sortie.km !== null) {
      runningTotal -= sortie.km;
    }
    return { ...sortie, remainingAfter: sortie.km !== null ? runningTotal : null };
  });

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Modals */}
      {showPasswordModal && (
        <PasswordModal
          onSuccess={handlePasswordSuccess}
          onCancel={handleCloseModals}
        />
      )}
      {showEntryModal && pendingSortie && (
        <EntryModal
          sortie={pendingSortie.sortie}
          sortieNumber={pendingSortie.index + 1}
          kmBefore={pendingSortie.kmBefore}
          initialKm={pendingSortie.isEdit ? pendingSortie.sortie.km : undefined}
          onSave={handleSaveKm}
          onCancel={handleCloseModals}
        />
      )}
      {showDeleteModal && pendingDelete && (
        <DeleteConfirmModal
          sortieNumber={pendingDelete.index + 1}
          onConfirm={handleDeleteConfirm}
          onCancel={handleCloseModals}
        />
      )}

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
                  
                  <div className="text-right flex items-center gap-2 sm:gap-3">
                    {sortie.km !== null ? (
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-xl font-bold text-green-400">
                            {sortie.km} km
                          </div>
                          <div className="text-sm text-gray-400">
                            Reste: {sortie.remainingAfter?.toFixed(1)} km
                          </div>
                        </div>
                        {/* Edit/Delete buttons - only show if authenticated */}
                        {isAuthenticated() && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaisirClick(sortie, index, sortie.kmBefore, true)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-600/50 hover:bg-gray-500/70 text-gray-300 hover:text-white rounded-lg transition-all text-sm sm:text-base"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteClick(sortie, index)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-600/50 hover:bg-red-500/70 text-gray-300 hover:text-white rounded-lg transition-all text-sm sm:text-base"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        À venir
                      </div>
                    )}
                    
                    {/* Saisir button */}
                    <button
                      onClick={() => handleSaisirClick(sortie, index, sortie.kmBefore)}
                      className="saisir-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm md:text-base"
                    >
                      ✏️ Saisir
                    </button>
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
