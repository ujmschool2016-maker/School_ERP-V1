
import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, Edit3, Camera, User, Phone, Calendar, Briefcase, Award, Trash2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Teacher } from '../types';

const TeacherView: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '', fatherName: '', address: '', mobile: '', dob: '', gender: 'Male', designation: '', joiningDate: new Date().toISOString().split('T')[0], baseSalary: 0, photo: ''
  });

  useEffect(() => {
    const unsubscribe = dataService.subscribeToTeachers(setTeachers);
    return () => unsubscribe();
  }, []);

  const calculateServicePeriod = (joiningDate: string) => {
    if (!joiningDate) return 'N/A';
    const start = new Date(joiningDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) return `${months} Months`;
    return `${years}y ${months}m`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (t: Teacher) => {
    setEditingId(t.id);
    setFormData(t);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this teacher record permanently?')) {
      try {
        await dataService.deleteTeacher(id);
        alert('Teacher record deleted successfully!');
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dataService.updateTeacher({ ...formData, id: editingId } as Teacher);
      } else {
        await dataService.saveTeacher(formData as Omit<Teacher, 'id'>);
      }
      setFormData({ name: '', fatherName: '', address: '', mobile: '', dob: '', gender: 'Male', designation: '', joiningDate: new Date().toISOString().split('T')[0], baseSalary: 0, photo: '' });
      setEditingId(null);
      alert(editingId ? 'Teacher record updated!' : 'Teacher registered!');
    } catch (err: any) {
      alert('Failed to save teacher: ' + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit">
        <h3 className="text-xl font-black mb-8 flex items-center gap-2 uppercase tracking-tight">
          {editingId ? <Edit3 className="w-6 h-6 text-indigo-600" /> : <Plus className="w-6 h-6 text-indigo-600" />}
          {editingId ? 'Edit Staff Record' : 'Teacher Registration'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-2 group">
              {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-300" />}
              <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <span className="text-[10px] font-black uppercase">Upload</span>
              </label>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Mobile Number</label>
              <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="01XXX..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Joining Date</label>
              <input required type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Designation</label>
              <input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Salary (BDT)</label>
              <input required type="number" value={formData.baseSalary || ''} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Gender</label>
              <div className="flex gap-4">
                {['Male', 'Female'].map(g => (
                  <label key={g} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="hidden" />
                    <span className="text-xs font-black uppercase tracking-widest">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-100 mt-4">
            {editingId ? 'SAVE CHANGES' : 'SAVE PERSONNEL RECORD'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', fatherName: '', address: '', mobile: '', dob: '', gender: 'Male', designation: '', joiningDate: new Date().toISOString().split('T')[0], baseSalary: 0, photo: '' }); }} className="w-full text-slate-400 font-bold py-2 hover:text-rose-500 transition-colors">Cancel Editing</button>
          )}
        </form>
      </div>

      <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black mb-8 flex items-center gap-2 uppercase tracking-tight">
          <UserCheck className="w-6 h-6 text-emerald-600" />
          Staff Directory
        </h3>
        <div className="space-y-4">
          {teachers.map((t) => (
            <div key={t.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-3xl transition-all hover:bg-white hover:shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 overflow-hidden shrink-0">
                {t.photo ? <img src={t.photo} className="w-full h-full object-cover" /> : t.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-black text-slate-900 flex items-center gap-2">
                  {t.name}
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${t.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.gender}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-lg uppercase">{calculateServicePeriod(t.joiningDate)} Service</span>
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {t.designation}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {t.mobile}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined: {t.joiningDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Salary</p>
                  <p className="text-sm font-black text-slate-700">৳{t.baseSalary.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleEdit(t)} 
                  className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="py-20 text-center opacity-20">
              <UserCheck className="w-16 h-16 mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">No Staff Registered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherView;
