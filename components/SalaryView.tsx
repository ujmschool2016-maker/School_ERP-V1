
import React, { useState, useEffect, useMemo } from 'react';
import { Banknote, History } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Teacher, SalaryRecord } from '../types';

const SalaryView: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [formData, setFormData] = useState({
    teacherId: '', month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()), baseSalary: 0, bonus: 0, deductions: 0, paymentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsubTeachers = dataService.subscribeToTeachers(setTeachers);
    const unsubSalaries = dataService.subscribeToSalaries((salaries) => {
      setSalaries(salaries.sort((a, b) => Number(b.id) - Number(a.id)));
    });
    return () => {
      unsubTeachers();
      unsubSalaries();
    };
  }, []);

  useEffect(() => {
    if (formData.teacherId) {
      const teacher = teachers.find(t => t.id === formData.teacherId);
      if (teacher) {
        setFormData(prev => ({ ...prev, baseSalary: teacher.baseSalary }));
      }
    } else {
      setFormData(prev => ({ ...prev, baseSalary: 0 }));
    }
  }, [formData.teacherId, teachers]);

  const total = useMemo(() => formData.baseSalary + formData.bonus - formData.deductions, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId) return;

    try {
      await dataService.saveSalary({ ...formData, total, status: 'Paid' });
      setFormData({ ...formData, baseSalary: 0, bonus: 0, deductions: 0 });
      alert('Salary payout recorded!');
    } catch (err: any) {
      alert('Failed to record salary payout: ' + err.message);
    }
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Unknown';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-100 rounded-2xl"><Banknote className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Payroll Engine</h3>
              <p className="text-xs text-slate-500 font-medium">Record teacher payouts (BDT)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Teacher</label>
              <select required value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold appearance-none">
                <option value="">Select Personnel...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} - {t.designation}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pay Month</label>
                <select required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold">
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pay Date</label>
                <input required type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Base Salary (Auto-populated)</label>
                <input readOnly value={formData.baseSalary || ''} className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl font-black text-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Bonus" value={formData.bonus || ''} onChange={e => setFormData({...formData, bonus: Number(e.target.value)})} className="px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold" />
                <input type="number" placeholder="Deductions" value={formData.deductions || ''} onChange={e => setFormData({...formData, deductions: Number(e.target.value)})} className="px-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-rose-600" />
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-3xl text-white">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Net Payout</span>
              <p className="text-3xl font-black">৳{total.toLocaleString()}</p>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 shadow-xl transition-all">DISBURSE SALARY</button>
          </form>
        </div>
      </div>

      <div className="xl:col-span-8 flex flex-col h-full">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          <div className="p-8 border-b border-slate-100 shrink-0">
             <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2"><History className="w-6 h-6 text-slate-400" /> Payroll History</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Personnel</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salaries.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900">{getTeacherName(s.teacherId)}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.month}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 text-center">৳{s.total.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Paid</span>
                    </td>
                  </tr>
                ))}
                {salaries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-24 text-center text-slate-300 font-bold uppercase tracking-widest">No payout history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryView;
