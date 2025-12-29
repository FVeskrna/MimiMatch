
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Heart, X, Settings as SettingsIcon, List, Copy, Check, RotateCcw, Share2, Trash2 } from 'lucide-react';
import { Gender, AppSettings, BabyName, View } from './types';
import { NAMES_DATASET } from './constants';

// --- Utility: Shuffling ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- Utility: Title Case ---
const toTitleCase = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

// --- Sub-components ---

interface DiscoveryCardProps {
  currentNameItem: BabyName | null;
  surname: string;
  swipeDirection: 'left' | 'right' | null;
  onReset: () => void;
  onLike: () => void;
  onDiscard: () => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ currentNameItem, surname, swipeDirection, onReset, onLike, onDiscard }) => {
  const [dragX, setDragX] = useState(0);
  const startX = useRef<number | null>(null);
  const threshold = 100; // Threshold in pixels to trigger swipe action

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    setDragX(deltaX);
  };

  const handleTouchEnd = () => {
    if (dragX > threshold) {
      onLike();
    } else if (dragX < -threshold) {
      onDiscard();
    }
    setDragX(0);
    startX.current = null;
  };

  // Rotation and opacity based on drag distance
  const rotation = dragX * 0.1;
  const opacity = Math.max(0.5, 1 - Math.abs(dragX) / 1000);

  return (
    <div 
      className="relative w-full max-w-sm aspect-[4/5] perspective-1000 touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentNameItem ? (
        <div 
          className={`
            absolute inset-0 bg-white rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center text-center
            transition-transform duration-300 transform
            ${swipeDirection === 'left' ? 'card-exit-left' : ''}
            ${swipeDirection === 'right' ? 'card-exit-right' : ''}
          `}
          style={!swipeDirection ? {
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity: opacity,
            transition: startX.current === null ? 'all 0.3s ease-out' : 'none'
          } : undefined}
        >
          {/* Swipe Indicators */}
          {!swipeDirection && Math.abs(dragX) > 20 && (
            <div className={`absolute top-10 pointer-events-none transition-opacity duration-200 ${dragX > 0 ? 'right-10 opacity-100' : 'left-10 opacity-100'}`}>
              {dragX > 0 ? (
                <div className="border-4 border-pink-500 rounded-xl p-2 rotate-12">
                  <span className="text-pink-500 font-bold text-2xl uppercase">LÍBÍ</span>
                </div>
              ) : (
                <div className="border-4 border-red-500 rounded-xl p-2 -rotate-12">
                  <span className="text-red-500 font-bold text-2xl uppercase">DALŠÍ</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-8 w-full pointer-events-none">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Klasické</p>
              <h1 className="font-classic text-4xl md:text-5xl font-bold text-slate-800 break-words leading-tight">
                {toTitleCase(currentNameItem.name)} {toTitleCase(surname)}
              </h1>
            </div>
            
            <div className="border-t border-slate-100 pt-8">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Psací</p>
              <h2 className="font-handwritten text-4xl md:text-5xl text-indigo-600 break-words leading-tight">
                {toTitleCase(currentNameItem.name)} {toTitleCase(surname)}
              </h2>
            </div>

            {currentNameItem.fact && (
              <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <p className="text-xs md:text-sm text-slate-500 italic leading-relaxed px-4">
                  {currentNameItem.fact}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-center items-center text-center border-2 border-dashed border-slate-200">
          <RotateCcw className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">To je vše!</h2>
          <p className="text-slate-500 mb-6">Prošli jste všechna jména v této kategorii.</p>
          <button 
            onClick={onReset}
            className="px-6 py-3 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition"
          >
            Začít znovu
          </button>
        </div>
      )}
    </div>
  );
};

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onNavigate: (view: View) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, onNavigate }) => (
  <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Nastavení</h2>
      <p className="text-slate-500 text-sm">Přizpůsobte si hledání jména.</p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Příjmení rodiny</label>
        <input 
          type="text"
          value={settings.surname}
          onChange={(e) => setSettings(s => ({ ...s, surname: e.target.value }))}
          placeholder="Napište příjmení..."
          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Pohlaví miminka</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: Gender.MUZ, label: 'Kluk', color: 'bg-blue-50 text-blue-600 border-blue-100', active: 'bg-blue-600 text-white border-blue-600' },
            { id: Gender.ZENA, label: 'Holka', color: 'bg-pink-50 text-pink-600 border-pink-100', active: 'bg-pink-600 text-white border-pink-600' },
            { id: Gender.NEUTRALNI, label: 'Obojí', color: 'bg-slate-100 text-slate-600 border-slate-200', active: 'bg-slate-800 text-white border-slate-800' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSettings(s => ({ ...s, gender: opt.id }))}
              className={`p-3 rounded-2xl border transition-all duration-200 text-sm font-medium ${settings.gender === opt.id ? opt.active : opt.color}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <button 
        onClick={() => onNavigate('discovery')}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
      >
        Pokračovat v objevování
      </button>
    </div>
  </div>
);

interface ShortlistViewProps {
  likedNames: string[];
  surname: string;
  onShare: () => void;
  onCopy: (text: string) => void;
  onRemove: (name: string) => void;
  onReset: () => void;
  copySuccess: string | null;
}

const ShortlistView: React.FC<ShortlistViewProps> = ({ likedNames, surname, onShare, onCopy, onRemove, onReset, copySuccess }) => (
  <div className="max-w-md mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto max-h-[80vh] w-full">
    <div className="flex justify-between items-center sticky top-0 bg-slate-50/90 backdrop-blur-sm py-2 z-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Můj výběr</h2>
        <p className="text-slate-500 text-sm">{likedNames.length} vybraných jmen</p>
      </div>
      <div className="flex gap-2">
        {likedNames.length > 0 && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              title="Smazat všechna jména"
              className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition shadow-sm border border-red-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onShare}
              title="Sdílet seznam"
              className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition shadow-sm border border-indigo-100"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>

    {likedNames.length === 0 ? (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Heart className="w-12 h-12 text-pink-200 mx-auto mb-4" />
        <p className="text-slate-400 px-4">Zatím jste nevybrali žádná jména.</p>
      </div>
    ) : (
      <div className="grid gap-3">
        {likedNames.map((name) => (
          <div key={name} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-50 group">
            <div className="flex flex-col">
              <span className="font-classic text-lg font-bold text-slate-800">{name} {toTitleCase(surname)}</span>
              <span className="font-handwritten text-indigo-400 text-xl leading-none">{name} {toTitleCase(surname)}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onCopy(`${name} ${toTitleCase(surname)}`)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition"
              >
                {copySuccess === `${name} ${toTitleCase(surname)}` ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
              <button 
                 onClick={() => onRemove(name)}
                 className="p-2 text-slate-300 hover:text-red-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<View>('settings'); 
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('baby_name_settings');
    return saved ? JSON.parse(saved) : { surname: '', gender: Gender.ZENA };
  });
  
  const [likedNames, setLikedNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('baby_name_liked');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [seenNames, setSeenNames] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('baby_name_seen');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('baby_name_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('baby_name_liked', JSON.stringify(likedNames));
  }, [likedNames]);

  useEffect(() => {
    localStorage.setItem('baby_name_seen', JSON.stringify(Array.from(seenNames)));
  }, [seenNames]);

  // --- Filtered & Shuffled Dataset ---
  const filteredNames = useMemo(() => {
    const subset = NAMES_DATASET.filter(item => {
      if (settings.gender === Gender.NEUTRALNI) return true;
      return item.gender === settings.gender || item.gender === Gender.NEUTRALNI;
    });
    // Shuffle the result so discovery isn't alphabetical
    return shuffleArray(subset);
  }, [settings.gender]);

  const availableNames = useMemo(() => {
    return filteredNames.filter(item => !seenNames.has(item.name));
  }, [filteredNames, seenNames]);

  const currentNameItem = availableNames[0] || null;

  const seenCount = useMemo(() => {
    return filteredNames.length - availableNames.length;
  }, [filteredNames.length, availableNames.length]);

  // --- Handlers ---
  const handleLike = useCallback(() => {
    if (!currentNameItem || swipeDirection) return;
    setSwipeDirection('right');
    setTimeout(() => {
      setLikedNames(prev => [...new Set([...prev, currentNameItem.name])]);
      setSeenNames(prev => new Set(prev).add(currentNameItem.name));
      setSwipeDirection(null);
    }, 400);
  }, [currentNameItem, swipeDirection]);

  const handleDiscard = useCallback(() => {
    if (!currentNameItem || swipeDirection) return;
    setSwipeDirection('left');
    setTimeout(() => {
      setSeenNames(prev => new Set(prev).add(currentNameItem.name));
      setSwipeDirection(null);
    }, 400);
  }, [currentNameItem, swipeDirection]);

  const handleReset = useCallback(() => {
    // Directly clear state without confirmation as per user request
    setLikedNames([]);
    setSeenNames(new Set());
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(text);
    setTimeout(() => setCopySuccess(null), 2000);
  }, []);

  const shareList = useCallback(async () => {
    const text = likedNames.map(name => `${name} ${toTitleCase(settings.surname)}`).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Moje oblíbená jména', text });
      } catch (error: any) {
        // Silently handle cancellation (AbortError)
        if (error.name !== 'AbortError') {
          console.error('Sharing failed:', error);
        }
      }
    } else {
      copyToClipboard(text);
      alert('Seznam zkopírován do schránky.');
    }
  }, [likedNames, settings.surname, copyToClipboard]);

  const removeFromShortlist = useCallback((name: string) => {
    setLikedNames(prev => prev.filter(n => n !== name));
    setSeenNames(prev => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50 text-slate-900 select-none overflow-hidden">
      
      {/* --- Top Navigation --- */}
      <nav className="flex justify-between items-center p-6 pb-2 shrink-0">
        <button 
          onClick={() => setView(v => v === 'settings' ? 'discovery' : 'settings')}
          className={`p-3 rounded-2xl transition ${view === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white shadow-sm text-slate-400 hover:text-slate-600'}`}
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setView('discovery')}
          className="flex flex-col items-center group transition active:scale-95"
        >
          <span className="font-handwritten text-2xl font-bold text-indigo-600 group-hover:text-indigo-700 transition">MimiMatch</span>
          {view === 'discovery' && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold animate-in fade-in duration-300">
              {seenCount} z {filteredNames.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setView(v => v === 'shortlist' ? 'discovery' : 'shortlist')}
          className={`p-3 rounded-2xl transition relative ${view === 'shortlist' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white shadow-sm text-slate-400 hover:text-slate-600'}`}
        >
          <List className="w-6 h-6" />
          {likedNames.length > 0 && view !== 'shortlist' && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
              {likedNames.length}
            </span>
          )}
        </button>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-4 overflow-y-auto">
        {view === 'discovery' && (
          <DiscoveryCard 
            currentNameItem={currentNameItem} 
            surname={settings.surname} 
            swipeDirection={swipeDirection} 
            onReset={handleReset}
            onLike={handleLike}
            onDiscard={handleDiscard}
          />
        )}
        {view === 'settings' && (
          <SettingsView 
            settings={settings} 
            setSettings={setSettings} 
            onNavigate={setView} 
          />
        )}
        {view === 'shortlist' && (
          <ShortlistView 
            likedNames={likedNames} 
            surname={settings.surname} 
            onShare={shareList} 
            onCopy={copyToClipboard} 
            onRemove={removeFromShortlist} 
            onReset={handleReset}
            copySuccess={copySuccess}
          />
        )}
      </main>

      {/* --- Bottom Action Buttons --- */}
      {view === 'discovery' && currentNameItem && (
        <div className="p-10 flex justify-center items-center gap-12 mb-4 shrink-0">
          <button 
            onClick={handleDiscard}
            className="group w-20 h-20 flex items-center justify-center bg-white border border-slate-100 text-red-500 rounded-full shadow-xl hover:bg-red-50 transition transform active:scale-90"
          >
            <X className="w-10 h-10 transition group-hover:rotate-12" />
          </button>
          
          <button 
            onClick={handleLike}
            className="group w-24 h-24 flex items-center justify-center bg-white border border-slate-100 text-pink-500 rounded-full shadow-xl hover:bg-pink-50 transition transform active:scale-90"
          >
            <Heart className="w-12 h-12 fill-current transition group-hover:scale-110" />
          </button>
        </div>
      )}

      <div className="h-4 w-full shrink-0"></div>
    </div>
  );
};

export default App;
