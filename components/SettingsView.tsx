
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Info } from 'lucide-react';
import { dataService } from '../services/dataService';
import { ClassRates } from '../types';

const SettingsView: React.FC = () => {
  const [rates, setRates] = useState<ClassRates[]>([]);
  const classes = ['Play', 'Nursery', 'KG', 'Class One', 'Class Two', 'Class Three', 'Class Four', 'Class Five'];

  useEffect(() => {
    const unsubscribe = dataService.subscribeToRates((saved) => {
      if (saved.length === 0) {
        const initial = classes.map(c => ({
          className: c, admissionFee: 0, tuitionFee: 0, examFee: 0, sessionFee: 0, registrationFee: 0
        }));
        setRates(initial);
      } else {
        setRates(saved);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateRate = (className: string, field: keyof ClassRates, value: number) => {
    setRates(prev => prev.map(r => r.className === className ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    try {
      await dataService.saveRates(rates);
      alert('Global Fee Settings Updated Successfully!');
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl"><SettingsIcon className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Predefined Fee Structures</h3>
              <p className="text-xs text-slate-500 font-medium">Standardize costs for each academic class</p>
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold transition-all">
            <Save className="w-5 h-5" /> SAVE GLOBAL SETTINGS
          </button>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100 mb-8">
           <Info className="w-5 h-5 text-amber-500 mt-0.5" />
           <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
             Note: These values will be automatically populated in the "Fees Collection" panel when you select a student from these classes. This ensures billing consistency and speed.
           </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuition (Monthly)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Fee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Session</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.map((r) => (
                <tr key={r.className} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-700">{r.className}</td>
                  <td className="px-6 py-4">
                    <input type="number" value={r.admissionFee || ''} onChange={e => updateRate(r.className, 'admissionFee', Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                  </td>
                  <td className="px-6 py-4">
                    <input type="number" value={r.tuitionFee || ''} onChange={e => updateRate(r.className, 'tuitionFee', Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                  </td>
                  <td className="px-6 py-4">
                    <input type="number" value={r.examFee || ''} onChange={e => updateRate(r.className, 'examFee', Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                  </td>
                  <td className="px-6 py-4">
                    <input type="number" value={r.sessionFee || ''} onChange={e => updateRate(r.className, 'sessionFee', Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                  </td>
                  <td className="px-6 py-4">
                    <input type="number" value={r.registrationFee || ''} onChange={e => updateRate(r.className, 'registrationFee', Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
