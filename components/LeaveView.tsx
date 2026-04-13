
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { LeaveRequest, Student, Teacher } from '../types';

const LeaveView: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    type: 'Student', category: 'Personal', startDate: '', endDate: '', reason: '', applicantId: ''
  });

  useEffect(() => {
    const unsubLeaves = dataService.subscribeToLeaves((leaves) => {
      setLeaves(leaves.sort((a, b) => Number(b.id) - Number(a.id)));
    });
    const unsubStudents = dataService.subscribeToStudents(setStudents);
    const unsubTeachers = dataService.subscribeToTeachers(setTeachers);
    
    return () => {
      unsubLeaves();
      unsubStudents();
      unsubTeachers();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const applicant = formData.type === 'Student' 
      ? students.find(s => s.roll === formData.applicantId)
      : teachers.find(t => t.id === formData.applicantId);

    if (!applicant) return alert('Invalid Applicant');

    try {
      await dataService.saveLeave({
        ...formData as any,
        applicantName: applicant.name,
        status: 'Pending'
      });
      setIsModalOpen(false);
      setFormData({ type: 'Student', category: 'Personal', startDate: '', endDate: '', reason: '', applicantId: '' });
    } catch (err: any) {
      alert('Failed to submit leave application: ' + err.message);
    }
  };

  const updateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await dataService.updateLeaveStatus(id, status);
    } catch (err: any) {
      alert('Failed to update leave status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Leave Ledger</h2>
          <p className="text-sm text-slate-500 font-medium">Track and manage absences</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 font-bold"
        >
          <Plus className="w-5 h-5" />
          Apply for Leave
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-slate-900">{l.applicantName}</p>
                    <p className="text-[10px] text-indigo-500 font-black uppercase">{l.type} - ID: {l.applicantId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-semibold text-slate-700">{l.startDate} to {l.endDate}</p>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{l.reason}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">{l.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      l.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                      l.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {l.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {l.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {l.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateStatus(l.id, 'Approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => updateStatus(l.id, 'Rejected')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-slate-300">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-bold text-slate-400">No leave records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Leave Application</h3>
                <p className="text-slate-500 text-sm font-medium">Request formal absence period</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Applicant Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any, applicantId: ''})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold">
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold">
                    <option value="Personal">Personal</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Applicant</label>
                <select required value={formData.applicantId} onChange={e => setFormData({...formData, applicantId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold">
                  <option value="">Choose...</option>
                  {formData.type === 'Student' 
                    ? students.map(s => <option key={s.id} value={s.roll}>{s.roll} - {s.name}</option>)
                    : teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>)
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">End Date</label>
                  <input required type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" rows={3} placeholder="Explain the reason for leave..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveView;
