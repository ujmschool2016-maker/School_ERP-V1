
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Info, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
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

  const handleClearAllData = async () => {
    if (confirm('CRITICAL WARNING: This will permanently delete ALL students, teachers, fees, results, and attendance data. This action cannot be undone. Are you absolutely sure?')) {
      const secondConfirm = confirm('Type "DELETE" is not required, but please confirm one last time. Proceed with total data wipe?');
      if (secondConfirm) {
        try {
          await dataService.clearAllData();
          alert('All application data has been cleared successfully.');
        } catch (err: any) {
          alert('Failed to clear data: ' + err.message);
        }
      }
    }
  };

  const handleBackfillIds = async () => {
    if (confirm('This will generate Unique IDs for all existing students and teachers who do not have one. Continue?')) {
      try {
        await dataService.backfillUniqueIds();
        alert('Unique IDs have been successfully generated for all existing records.');
      } catch (err: any) {
        alert('Failed to generate IDs: ' + err.message);
      }
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

      <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-900 uppercase">Data Maintenance</h3>
              <p className="text-sm text-indigo-600 font-medium">Generate missing Unique IDs for existing records</p>
            </div>
          </div>
          <button 
            onClick={handleBackfillIds}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5" /> GENERATE MISSING IDs
          </button>
        </div>
        <p className="mt-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-relaxed">
          Use this tool if you have imported data or have old records without "S-0000" or "T-0000" format IDs.
        </p>
      </div>

      <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-rose-100 rounded-2xl text-rose-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-rose-900 uppercase">Danger Zone</h3>
              <p className="text-sm text-rose-600 font-medium">Permanently clear all application records</p>
            </div>
          </div>
          <button 
            onClick={handleClearAllData}
            className="flex items-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-100 font-black transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5" /> CLEAR ALL DATABASE DATA
          </button>
        </div>
        <p className="mt-6 text-[10px] font-black text-rose-400 uppercase tracking-widest leading-relaxed">
          Warning: This operation will wipe all student profiles, teacher records, financial history, results, and attendance logs. Fee structures (settings) will be preserved.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
