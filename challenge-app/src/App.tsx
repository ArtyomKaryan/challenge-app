
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CHALLENGES, PHRASES, SILENT_DAY_CHALLENGE } from './constants';
import { AppState, Challenge, DayReflection, UserMood } from './types';
import { storageService } from './services/storageService';
import { moodAnalyzer } from './services/moodAnalyzer';

const ActionButton: React.FC<{
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, variant = 'primary', children, className = '' }) => {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md',
    secondary: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md',
    outline: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100'
  };

  return (
    <button
      onClick={onClick}
      className={`${styles[variant]} px-6 py-3 rounded-2xl font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [view, setView] = useState<'intro' | 'challenge' | 'reflection' | 'report'>('intro');

  // Initialization
  useEffect(() => {
    const today = storageService.getCurrentDateString();
    const saved = storageService.loadState();
    
    if (saved && saved.lastUpdatedDate === today) {
      setState(saved);
      if (saved.currentChallengeId) setView('challenge');
    } else {
      const isSilent = moodAnalyzer.isSilentDayTriggered(today);
      const newState: AppState = {
        lastUpdatedDate: today,
        currentChallengeId: isSilent ? 0 : null,
        isCompleted: false,
        isMysteryRevealed: false,
        isReflectionDone: false,
        history: saved?.history || [],
        reflections: saved?.reflections || [],
        isSilentDay: isSilent
      };
      setState(newState);
      if (isSilent) setView('challenge');
      else setView('intro');
    }
  }, []);

  const save = (updated: AppState) => {
    setState(updated);
    storageService.saveState(updated);
  };

  const startDay = () => {
    if (!state) return;
    const lastReflection = state.reflections[state.reflections.length - 1];
    const targetCategory = moodAnalyzer.recommendCategory(lastReflection);
    
    let available = CHALLENGES.filter(c => c.category === targetCategory);
    if (available.length === 0) available = CHALLENGES;
    
    const randomChallenge = available[Math.floor(Math.random() * available.length)];
    
    save({ ...state, currentChallengeId: randomChallenge.id });
    setView('challenge');
  };

  const completeChallenge = () => {
    if (!state) return;
    const newState = { 
      ...state, 
      isCompleted: true, 
      history: [...state.history, { challengeId: state.currentChallengeId!, date: state.lastUpdatedDate }]
    };
    save(newState);
  };

  const revealMystery = () => {
    if (!state) return;
    save({ ...state, isMysteryRevealed: true });
  };

  const handleReflection = (reflection: Omit<DayReflection, 'date'>) => {
    if (!state) return;
    const newState: AppState = {
      ...state,
      isReflectionDone: true,
      reflections: [...state.reflections, { ...reflection, date: state.lastUpdatedDate }]
    };
    save(newState);
  };

  const phraseOfTheDay = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return PHRASES[dayOfYear % PHRASES.length];
  }, []);

  if (!state) return null;

  const currentChallenge = state.isSilentDay 
    ? SILENT_DAY_CHALLENGE 
    : CHALLENGES.find(c => c.id === state.currentChallengeId);

  // Render Logic
  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 transition-colors duration-1000 ${state.isSilentDay ? 'bg-zinc-50' : 'bg-slate-50'}`}>
      
      {/* Background elements */}
      {!state.isSilentDay && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/30 blur-[120px] rounded-full"></div>
        </>
      )}

      {/* Main Content Area */}
      <main className="max-w-md w-full z-10 space-y-12">
        
        {/* Intro View */}
        {view === 'intro' && (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Challenge <span className="text-indigo-600">of the Day</span>
              </h1>
              <p className="text-gray-400 font-medium">{phraseOfTheDay}</p>
            </div>
            
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
               <div className="text-6xl mb-6">✨</div>
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Твой день начинается здесь</h2>
               <p className="text-gray-500 mb-10 leading-relaxed text-sm">
                 Мы подобрали вызов на основе твоего самочувствия вчера. Готов узнать, что тебя ждет?
               </p>
               <ActionButton onClick={startDay} className="w-full py-4 text-lg">
                 Открыть конверт
               </ActionButton>
            </div>
          </div>
        )}

        {/* Challenge View */}
        {view === 'challenge' && currentChallenge && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden">
              {/* Silent Day visual cue */}
              {state.isSilentDay && (
                <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-gray-300 font-bold">Silent Mode</div>
              )}

              <div className="flex flex-col items-center text-center space-y-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-700 ${state.isCompleted ? 'bg-emerald-50 scale-90' : 'bg-indigo-50 shadow-inner'}`}>
                  {state.isCompleted ? '🎉' : currentChallenge.emoji}
                </div>

                <div className="space-y-4">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${state.isSilentDay ? 'text-gray-400 bg-gray-100' : 'text-indigo-500 bg-indigo-50'}`}>
                    {state.isSilentDay ? 'Тишина' : currentChallenge.category}
                  </span>
                  <h2 className={`text-2xl font-bold leading-tight transition-colors duration-500 ${state.isCompleted ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {state.isCompleted ? 'Вызов принят и выполнен' : currentChallenge.text}
                  </h2>
                </div>

                {state.isCompleted ? (
                   <div className="w-full space-y-6 animate-in fade-in zoom-in duration-500">
                      {currentChallenge.mysteryReveal && !state.isMysteryRevealed ? (
                        <button 
                          onClick={revealMystery}
                          className="text-indigo-600 text-sm font-semibold hover:underline"
                        >
                          В чем смысл этого задания?
                        </button>
                      ) : state.isMysteryRevealed && currentChallenge.mysteryReveal ? (
                        <p className="text-gray-500 italic text-sm leading-relaxed px-4">
                          "{currentChallenge.mysteryReveal}"
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm">Отличный вклад в твой невидимый прогресс.</p>
                      )}
                      
                      {!state.isReflectionDone && (
                        <ActionButton onClick={() => setView('reflection')} variant="ghost" className="w-full">
                          Завершить день
                        </ActionButton>
                      )}
                      {state.isReflectionDone && (
                        <div className="text-xs text-gray-300 font-medium">Увидимся завтра. Отдыхай.</div>
                      )}
                   </div>
                ) : (
                  <div className="flex flex-col w-full gap-3 pt-6">
                    <ActionButton onClick={completeChallenge} variant="secondary">
                      Выполнено
                    </ActionButton>
                    {!state.isSilentDay && (
                      <ActionButton onClick={startDay} variant="outline">
                        Другой вариант
                      </ActionButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reflection View (Evening Questionnaire) */}
        {view === 'reflection' && (
          <ReflectionForm onSubmit={handleReflection} onCancel={() => setView('challenge')} />
        )}

      </main>

      {/* Progress Footer */}
      <footer className="mt-20 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default">
         <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <button onClick={() => setView('report')} className="hover:text-indigo-600 transition-colors">Невидимый прогресс</button>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Серия: {calculateStreak(state.history)} дней</span>
         </div>
      </footer>

      {/* Stats Modal (Simplified as a View) */}
      {view === 'report' && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="max-w-md w-full space-y-10 text-center">
             <h2 className="text-3xl font-bold text-gray-900">Твоя история</h2>
             <div className="space-y-6 text-left bg-gray-50 p-8 rounded-3xl">
                <p className="text-gray-600 leading-relaxed italic">
                  "{generateNarrativeReport(state)}"
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {state.history.slice(-20).map((h, i) => (
                    <div key={i} className="h-2 bg-indigo-500 rounded-full opacity-20 hover:opacity-100 transition-opacity" title={h.date}></div>
                  ))}
                </div>
             </div>
             <ActionButton onClick={() => setView(state.currentChallengeId !== null ? 'challenge' : 'intro')} variant="outline">
               Назад к фокусу
             </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Reflection Form
const ReflectionForm: React.FC<{ 
  onSubmit: (data: Omit<DayReflection, 'date'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [mood, setMood] = useState<UserMood>('Neutral');
  const [energy, setEnergy] = useState(3);
  const [difficulty, setDifficulty] = useState('');

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">Вечерняя рефлексия</h3>
        <p className="text-xs text-gray-400">Пара секунд, чтобы мы поняли твой завтрашний день.</p>
      </div>

      <div className="space-y-8">
        {/* Mood */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block text-center">Как ты сегодня?</label>
          <div className="flex justify-between gap-2">
            {(['Good', 'Neutral', 'Heavy'] as UserMood[]).map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all ${mood === m ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                {m === 'Good' ? 'Легко' : m === 'Neutral' ? 'Нормально' : 'Тяжело'}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block text-center">Уровень энергии (1-5)</label>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => setEnergy(v)}
                className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${energy === v ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block text-center">Что было самым трудным?</label>
          <input 
            type="text" 
            placeholder="Одним словом..." 
            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <ActionButton onClick={() => onSubmit({ mood, energy, difficulty })} variant="primary">
          Завершить
        </ActionButton>
        <button onClick={onCancel} className="text-[10px] text-gray-300 uppercase font-bold tracking-widest hover:text-gray-500">Отмена</button>
      </div>
    </div>
  );
};

// Utils
function calculateStreak(history: { date: string }[]): number {
  if (history.length === 0) return 0;
  // Simplified streak check
  return history.length; 
}

function generateNarrativeReport(state: AppState): string {
  const lastMoods = state.reflections.slice(-3).map(r => r.mood);
  const avgEnergy = state.reflections.reduce((acc, curr) => acc + curr.energy, 0) / (state.reflections.length || 1);
  
  if (state.history.length === 0) return "Твоя история только начинается. Каждое выполненное задание — это тихий вклад в лучшую версию тебя.";
  
  let summary = "За последнее время ты сделал(а) акцент на ";
  if (avgEnergy < 3) summary += "восстановлении сил. ";
  else summary += "активности и росте. ";
  
  if (lastMoods.includes('Heavy')) summary += "Твои дни были непростыми, но ты продолжаешь двигаться. Это и есть настоящая сила.";
  else summary += "Твое состояние стабильно, и это отличный фундамент для новых свершений.";
  
  return summary;
}

export default App;
