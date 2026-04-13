
import React, { useState, useEffect } from 'react';
import { HardHat, TrendingDown, Plus, Wallet, Edit3, Home, Award, Sparkles, MapPin, Trophy } from 'lucide-react';
import { dataService } from '../services/dataService';
import { OperationCost, OperationCategory } from '../types';

const OperationCostView: React.FC = () => {
  const [costs, setCosts] = useState<OperationCost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<OperationCost>>({
    category: 'Utility', description: '', amount: 0, date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsubscribe = dataService.subscribeToCosts((costs) => {
      setCosts(costs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    return () => unsubscribe();
  }, []);

  const totalSpent = costs.reduce((acc, c) => acc + c.amount, 0);

  const categories: OperationCategory[] = [
    'Utility', 'Rent', 'Maintenance', 'Events', 'Supplies', 'Home', 'Others',
    'Result published', 'Class 5 Farewell Ceremony', 'Student Awards', 'Anual Sports Program', 'Stydy Tour (Picnic)'
  ];

  const handleEdit = (c: OperationCost) => {
    setEditingId(c.id);
    setFormData(c);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dataService.updateCost({ ...formData, id: editingId } as OperationCost);
      } else {
        await dataService.saveCost(formData as Omit<OperationCost, 'id'>);
      }
      setFormData({ category: 'Utility', description: '', amount: 0, date: new Date().toISOString().split('T')[0] });
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to save expense: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold opacity-60 uppercase tracking-[0.2em] mb-2">Total Operational Burn (BDT)</h3>
            <p className="text-5xl font-black">৳{totalSpent.toLocaleString()}</p>
            <div className="mt-8 flex gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs font-bold">Managed Balance</span>
              </div>
            </div>
          </div>
          <Wallet className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm max-h-[400px] overflow-y-auto">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-white">Category Breakdown</h4>
          <div className="space-y-4">
            {categories.map(cat => {
              const catTotal = costs.filter(c => c.category === cat).reduce((acc, curr) => acc + curr.amount, 0);
              const percentage = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
              if (catTotal === 0 && !['Utility', 'Rent', 'Result published'].includes(cat)) return null;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-500">{cat}</span>
                    <span className="text-slate-900">৳{catTotal.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              {editingId ? <Edit3 className="w-6 h-6 text-indigo-600" /> : <Plus className="w-6 h-6 text-indigo-600" />}
              {editingId ? 'Edit Entry (BDT)' : 'Log Expense (BDT)'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold">
                  <option value="Utility">Utility Bills</option>
                  <option value="Rent">Property Rent</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Events">General Events</option>
                  <option value="Supplies">Office Supplies</option>
                  <option value="Home">Home Cost</option>
                  <option value="Result published">Result published</option>
                  <option value="Class 5 Farewell Ceremony">Class 5 Farewell Ceremony</option>
                  <option value="Student Awards">Awards & Crest Ceremony</option>
                  <option value="Anual Sports Program">Anual Sports Program</option>
                  <option value="Stydy Tour (Picnic)">Stydy Tour (Picnic)</option>
                  <option value="Others">Others Cost</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. Electric bill for March" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (BDT)</label>
                  <input required type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black shadow-xl shadow-slate-200 transition-all">
                {editingId ? 'SAVE CHANGES' : 'RECORD EXPENSE'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ category: 'Utility', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }); }} className="w-full text-slate-400 font-bold py-2 hover:text-rose-500">Cancel Editing</button>
              )}
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">Expense Ledger</h3>
              <div className="text-[10px] font-black text-slate-400 uppercase bg-white px-3 py-1 rounded-lg border">Real-time Data</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {costs.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-700">{c.date}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${
                          c.category === 'Home' ? 'bg-emerald-50 text-emerald-600' : 
                          c.category === 'Others' ? 'bg-amber-50 text-amber-600' : 
                          c.category === 'Anual Sports Program' ? 'bg-rose-50 text-rose-600' :
                          c.category === 'Stydy Tour (Picnic)' ? 'bg-sky-50 text-sky-600' :
                          c.category === 'Result published' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {c.category === 'Home' && <Home className="w-3 h-3" />}
                          {c.category === 'Anual Sports Program' && <Trophy className="w-3 h-3" />}
                          {c.category === 'Stydy Tour (Picnic)' && <MapPin className="w-3 h-3" />}
                          {c.category === 'Student Awards' && <Award className="w-3 h-3" />}
                          {c.category === 'Result published' && <Sparkles className="w-3 h-3" />}
                          {c.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-medium text-slate-600">{c.description}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <p className="text-sm font-black text-slate-900">৳{c.amount.toLocaleString()}</p>
                          <button 
                            onClick={() => handleEdit(c)}
                            className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {costs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-32 text-center text-slate-300">
                        <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="font-bold text-slate-400">No expenses recorded in BDT.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationCostView;
