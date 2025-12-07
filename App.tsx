import React, { useState, useEffect } from 'react';
import { Cat, CareLog, LogType } from './types';
import { CatForm } from './components/CatForm';
import { getCatAdvice } from './services/geminiService';
import { 
  Plus, 
  Cat as CatIcon, 
  Activity, 
  Sparkles, 
  Trash2, 
  Utensils, 
  Stethoscope, 
  Scale, 
  MoreHorizontal,
  MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Convex Imports
import { useQuery, useMutation } from "convex/react";
import { api } from "./convex/_generated/api";
import { Id } from "./convex/_generated/dataModel";

export default function App() {
  // Replace local state with Convex Queries
  const cats = useQuery(api.cats.get) || [];
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  
  // Fetch logs ONLY for the selected cat
  const catLogs = useQuery(api.logs.getByCat, { 
    catId: selectedCatId ? (selectedCatId as Id<"cats">) : undefined 
  }) || [];

  // Mutations
  const addCatMutation = useMutation(api.cats.add);
  const deleteCatMutation = useMutation(api.cats.remove);
  const addLogMutation = useMutation(api.logs.add);
  const updateCatWeightMutation = useMutation(api.cats.updateWeight);

  // UI State
  const [showAddCat, setShowAddCat] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Set initial selected cat when data loads
  useEffect(() => {
    if (cats.length > 0 && !selectedCatId) {
      setSelectedCatId(cats[0]._id);
    }
  }, [cats, selectedCatId]);

  const handleAddCat = async (newCatData: Cat) => {
    // Convex generates the ID, so we pass the other data
    const newId = await addCatMutation({
      name: newCatData.name,
      breed: newCatData.breed,
      age: newCatData.age,
      weight: newCatData.weight,
      imageUrl: newCatData.imageUrl,
      gender: newCatData.gender as string,
    });
    
    setSelectedCatId(newId);
    setShowAddCat(false);
  };

  const handleDeleteCat = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo profilo e tutti i dati associati?')) {
      await deleteCatMutation({ id: id as Id<"cats"> });
      // Reset selection handled by useEffect or manually pick first available
      const remaining = cats.filter(c => c._id !== id);
      if (remaining.length > 0) setSelectedCatId(remaining[0]._id);
      else setSelectedCatId(null);
    }
  };

  const addLog = async (type: LogType, value?: string) => {
    if (!selectedCatId) return;
    
    await addLogMutation({
      catId: selectedCatId as Id<"cats">,
      type,
      timestamp: new Date().toISOString(),
      notes: '',
      value
    });
    
    // If it's a weight log, update the cat's current weight in DB
    if (type === LogType.WEIGHT && value) {
        await updateCatWeightMutation({
          id: selectedCatId as Id<"cats">,
          weight: Number(value)
        });
    }
  };

  const handleAskAI = async () => {
    if (!selectedCatId || !aiPrompt.trim()) return;
    const cat = cats.find(c => c._id === selectedCatId);
    if (!cat) return;

    setAiLoading(true);
    // Note: catLogs is already filtered by query for the selected cat
    const answer = await getCatAdvice(cat, catLogs as CareLog[], aiPrompt);
    setAiResponse(answer);
    setAiLoading(false);
  };

  const selectedCat = cats.find(c => c._id === selectedCatId);

  // Prepare chart data for weight
  const weightData = (catLogs as CareLog[])
    .filter(l => l.type === LogType.WEIGHT)
    .map(l => ({
      date: new Date(l.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: Number(l.value)
    }))
    .reverse();

  if (cats === undefined) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  if (cats.length === 0 && !showAddCat) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600">
          <CatIcon size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Benvenuto in Cat Care</h1>
        <p className="text-slate-600 mb-8 max-w-md">Inizia creando un profilo per il tuo amico felino. I dati saranno salvati nel cloud!</p>
        <button 
          onClick={() => setShowAddCat(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Aggiungi il tuo primo gatto
        </button>
        {showAddCat && <CatForm onSave={handleAddCat} onCancel={() => setShowAddCat(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row max-w-7xl mx-auto shadow-2xl overflow-hidden md:my-8 md:rounded-3xl">
      {/* Sidebar Navigation */}
      <aside className="bg-white w-full md:w-20 lg:w-64 border-r border-slate-100 flex flex-col">
        <div className="p-6 flex items-center gap-3 text-indigo-600 font-bold text-xl border-b border-slate-50">
          <CatIcon size={28} />
          <span className="hidden lg:block">Cat Care</span>
        </div>
        
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 hidden lg:block">I tuoi Gatti</div>
          {cats.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCatId(cat._id)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                selectedCatId === cat._id 
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
              <div className="hidden lg:block text-left overflow-hidden">
                <div className="font-medium truncate">{cat.name}</div>
                <div className="text-xs text-slate-400 truncate">{cat.breed}</div>
              </div>
            </button>
          ))}
          
          <button
            onClick={() => setShowAddCat(true)}
            className="w-full flex items-center gap-3 p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all border-t border-slate-100 mt-2 pt-4"
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <Plus size={16} />
            </div>
            <span className="hidden lg:block font-medium">Nuovo Gatto</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50/50 relative overflow-y-auto h-[calc(100vh-80px)] md:h-auto">
        {selectedCat && (
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <img src={selectedCat.imageUrl} alt={selectedCat.name} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{selectedCat.name}</h1>
                  <p className="text-slate-500 flex items-center gap-2">
                    {selectedCat.breed} • {selectedCat.age} anni • {selectedCat.gender}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                 <button 
                  onClick={() => setAiModalOpen(true)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  Chiedi all'AI
                </button>
                <button 
                  onClick={() => handleDeleteCat(selectedCat._id)}
                  className="bg-white text-red-500 px-4 py-2 rounded-lg font-medium border border-slate-200 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </header>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => addLog(LogType.FEEDING)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Utensils size={20} />
                </div>
                <div className="font-semibold text-slate-700">Pasto</div>
              </button>
              
              <button onClick={() => addLog(LogType.LITTER)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <BoxIcon />
                </div>
                <div className="font-semibold text-slate-700">Lettiera</div>
              </button>

              <button 
                onClick={() => {
                   const weight = prompt("Inserisci il peso attuale (kg):", selectedCat.weight.toString());
                   if (weight) addLog(LogType.WEIGHT, weight);
                }} 
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-green-200 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Scale size={20} />
                </div>
                <div className="font-semibold text-slate-700">Peso</div>
              </button>

              <button onClick={() => addLog(LogType.MEDICAL)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-red-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Stethoscope size={20} />
                </div>
                <div className="font-semibold text-slate-700">Salute</div>
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Activity Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-500" />
                    Attività Recenti
                  </h3>
                  <div className="space-y-4">
                    {catLogs.length === 0 ? (
                      <p className="text-slate-400 text-center py-8">Nessuna attività registrata ancora.</p>
                    ) : (
                      catLogs.slice(0, 5).map(log => (
                        <div key={log._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                          <div className={`p-2 rounded-lg ${
                            log.type === LogType.MEDICAL ? 'bg-red-100 text-red-600' :
                            log.type === LogType.WEIGHT ? 'bg-green-100 text-green-600' :
                            log.type === LogType.FEEDING ? 'bg-orange-100 text-orange-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {log.type === LogType.MEDICAL ? <Stethoscope size={16} /> :
                             log.type === LogType.WEIGHT ? <Scale size={16} /> :
                             log.type === LogType.FEEDING ? <Utensils size={16} /> :
                             <MoreHorizontal size={16} />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{log.type} {log.value && `• ${log.value} ${log.type === LogType.WEIGHT ? 'kg' : ''}`}</div>
                            <div className="text-sm text-slate-500">{new Date(log.timestamp).toLocaleString('it-IT')}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Weight Chart */}
                {weightData.length > 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                     <h3 className="text-lg font-bold text-slate-800 mb-4">Andamento Peso</h3>
                     <div className="h-64">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={weightData}>
                           <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                           <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                           <Line type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
                )}
              </div>

              {/* Stats Side */}
              <div className="space-y-6">
                <div className="bg-indigo-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-bold opacity-90 mb-1">Peso Attuale</h3>
                    <div className="text-4xl font-bold mb-4">{selectedCat.weight} <span className="text-xl font-normal opacity-70">kg</span></div>
                    <div className="text-sm opacity-80 bg-indigo-500/50 inline-block px-3 py-1 rounded-full">
                      {weightData.length > 1 ? (
                        (weightData[weightData.length - 1].weight - weightData[0].weight) > 0 ? '+ In Aumento' : 'Stabile'
                      ) : 'Nessun dato storico'}
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <CatIcon size={120} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                   <h3 className="text-lg font-bold text-slate-800 mb-4">Promemoria Rapidi</h3>
                   <div className="space-y-3">
                     <div className="flex items-center gap-3 text-slate-600 text-sm">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div>
                       Vaccinazione annuale: Ottobre
                     </div>
                     <div className="flex items-center gap-3 text-slate-600 text-sm">
                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                       Antiparassitario: ogni mese
                     </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Add Cat Modal */}
      {showAddCat && <CatForm onSave={handleAddCat} onCancel={() => setShowAddCat(false)} />}

      {/* AI Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
             <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-2xl">
               <div className="flex items-center gap-2 font-bold">
                 <Sparkles size={20} />
                 Veterinario AI
               </div>
               <button onClick={() => setAiModalOpen(false)}><X size={20} /></button>
             </div>
             
             <div className="p-6 overflow-y-auto flex-1 space-y-4">
               {aiResponse ? (
                 <div className="prose prose-sm prose-indigo bg-slate-50 p-4 rounded-xl">
                   {aiResponse.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                 </div>
               ) : (
                 <div className="text-center text-slate-500 py-8">
                   <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                   <p>Chiedi consiglio su alimentazione, comportamento o salute di {selectedCat?.name}.</p>
                 </div>
               )}
             </div>

             <div className="p-4 border-t bg-white rounded-b-2xl">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   placeholder="Es: Il mio gatto miagola molto di notte..."
                   className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                   onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                 />
                 <button 
                   onClick={handleAskAI}
                   disabled={aiLoading}
                   className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                 >
                   {aiLoading ? '...' : 'Invia'}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Box Icon for Litter
const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22v-9"/>
  </svg>
);

// X icon helper
const X = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 18 18"/>
  </svg>
);