import React, { useState } from 'react';
import { Cat } from '../types';
import { Camera, X } from 'lucide-react';

interface CatFormProps {
  onSave: (cat: Cat) => void;
  onCancel: () => void;
  initialData?: Cat;
}

export const CatForm: React.FC<CatFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Cat>>(
    initialData || {
      name: '',
      breed: '',
      age: 0,
      weight: 0,
      gender: 'Maschio',
      imageUrl: 'https://picsum.photos/200'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    onSave({
      _id: initialData?._id || crypto.randomUUID(),
      name: formData.name!,
      breed: formData.breed || 'Misto',
      age: Number(formData.age),
      weight: Number(formData.weight),
      gender: formData.gender as 'Maschio' | 'Femmina',
      imageUrl: formData.imageUrl || 'https://picsum.photos/200'
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Modifica Gatto' : 'Aggiungi Gatto'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Razza</label>
              <input
                type="text"
                value={formData.breed}
                onChange={e => setFormData({...formData, breed: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sesso</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value as any})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Maschio">Maschio</option>
                <option value="Femmina">Femmina</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Età (anni)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.age}
                onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Salva Profilo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};