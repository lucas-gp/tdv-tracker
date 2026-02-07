'use client';

import { useEffect, useState } from 'react';
import { SortiesData, Sortie } from '@/types';

function formatDateFR(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  };
  return date.toLocaleDateString('fr-FR', options);
}

export default function AdminPage() {
  const [data, setData] = useState<SortiesData | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form for new sortie
  const [newDate, setNewDate] = useState('');
  const [newCreneau, setNewCreneau] = useState('13h00-16h30');

  const fetchData = () => {
    fetch('/api/sorties')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      setAuthenticated(true);
    }
  };

  const handleKmChange = (id: number, value: string) => {
    if (!data) return;
    
    const newSorties = data.sorties.map(s => 
      s.id === id 
        ? { ...s, km: value === '' ? null : parseFloat(value) }
        : s
    );
    
    setData({ ...data, sorties: newSorties });
  };

  const handleSave = async () => {
    if (!data) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/sorties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sorties: data.sorties })
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Données enregistrées !' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Erreur lors de la sauvegarde' });
        if (res.status === 401) {
          setAuthenticated(false);
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
    
    setSaving(false);
  };

  const handleAddSortie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/sorties/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, date: newDate, creneau: newCreneau })
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Sortie ajoutée !' });
        setNewDate('');
        fetchData();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Erreur lors de l\'ajout' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
    
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette sortie ?')) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/sorties/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Sortie supprimée !' });
        fetchData();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Erreur lors de la suppression' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">⚙️ Chargement...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="stat-card rounded-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Administration</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                placeholder="Entrez le mot de passe"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Connexion
            </button>
          </form>
          
          <a 
            href="/" 
            className="block text-center mt-6 text-gray-400 hover:text-white transition-colors"
          >
            ← Retour au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  const totalKm = data?.sorties.reduce((sum, s) => sum + (s.km || 0), 0) || 0;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">⚙️ Administration TDV</h1>
        <a 
          href="/" 
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          ← Tableau de bord
        </a>
      </header>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="stat-card rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{totalKm.toFixed(1)} km</div>
            <div className="text-gray-400">parcourus</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{(data?.target_km || 250) - totalKm} km</div>
            <div className="text-gray-400">restants</div>
          </div>
        </div>
      </div>

      {/* Sorties List */}
      <div className="stat-card rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📋 Modifier les sorties</h2>
        
        <div className="space-y-3">
          {data?.sorties.map((sortie, index) => (
            <div 
              key={sortie.id}
              className="flex flex-wrap items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="font-bold text-lg min-w-[80px]">
                #{index + 1}
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{formatDateFR(sortie.date)}</div>
                <div className="text-sm text-gray-400">{sortie.creneau}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={sortie.km ?? ''}
                  onChange={(e) => handleKmChange(sortie.id, e.target.value)}
                  placeholder="km"
                  className="w-24 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-right focus:outline-none focus:border-orange-500"
                />
                <span className="text-gray-400">km</span>
              </div>
              
              <button
                onClick={() => handleDelete(sortie.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded-lg transition-colors"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
        </button>
      </div>

      {/* Add Sortie */}
      <div className="stat-card rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">➕ Ajouter une sortie</h2>
        
        <form onSubmit={handleAddSortie} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Créneau</label>
              <select
                value={newCreneau}
                onChange={(e) => setNewCreneau(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
              >
                <option value="13h00-16h30">Après-midi (13h00-16h30)</option>
                <option value="8h20-16h30">Journée complète (8h20-16h30)</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={saving || !newDate}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {saving ? '⏳ Ajout...' : '➕ Ajouter la sortie'}
          </button>
        </form>
      </div>
    </main>
  );
}
