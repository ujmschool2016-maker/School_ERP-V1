
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, AlertCircle, Camera, User, MapPin, Edit3, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Student } from '../types';
import { useAuth } from './FirebaseProvider';

interface StudentViewProps {
  onViewStudent?: (roll: string) => void;
}

const StudentView: React.FC<StudentViewProps> = ({ onViewStudent }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<Student>>({
    roll: '', name: '', fatherName: '', motherName: '', address: '', mobile: '', dob: '', gender: 'Male', className: '', admissionDate: new Date().toISOString().split('T')[0], photo: ''
  });

  useEffect(() => {
    const unsubscribe = dataService.subscribeToStudents(setStudents);
    return () => unsubscribe();
  }, []);

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

  const openEditModal = (s: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setFormData(s);
    setIsModalOpen(true);
    setError('');
  };

  const handleGenerateId = async () => {
    try {
      const newId = await dataService.generateUniqueId('S');
      setFormData({ ...formData, uniqueId: newId });
    } catch (err: any) {
      alert('Failed to generate ID: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await dataService.updateStudent({ ...formData, id: editingId } as Student);
        alert('Student record updated successfully!');
      } else {
        await dataService.saveStudent(formData as Omit<Student, 'id'>);
        alert('Student registered successfully!');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };


  const resetForm = () => {
    setEditingId(null);
    setFormData({ roll: '', name: '', fatherName: '', motherName: '', address: '', mobile: '', dob: '', gender: 'Male', className: '', admissionDate: new Date().toISOString().split('T')[0], photo: '' });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this record permanently?')) {
      try {
        await dataService.deleteStudent(id);
      } catch (err: any) {
        alert('Failed to delete student: ' + err.message);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll.includes(searchTerm) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search student by name, roll, or class..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
          />
        </div>
        <button 
          onClick={() => { resetForm(); setError(''); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
        >
          <Plus className="w-5 h-5" />
          <span>Register New Student</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unique ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parents Detail</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address & Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => (
                <tr 
                  key={s.id} 
                  className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                  onClick={() => onViewStudent?.(s.roll)}
                >
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">{s.uniqueId}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center shrink-0">
                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-indigo-300" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900 leading-tight">{s.name}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${s.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                            {s.gender}
                          </span>
                          <ExternalLink className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Roll: {s.roll}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{s.fatherName} (F)</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-rose-400" />
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{s.motherName} (M)</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900">{s.mobile}</p>
                      <div className="flex items-start gap-1 text-[10px] text-slate-400 font-bold uppercase leading-relaxed max-w-[150px]">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{s.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{s.className}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={(e) => openEditModal(s, e)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => handleDelete(s.id, e)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="max-w-xs mx-auto opacity-20">
                      <User className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest">Database is empty</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Edit Student Profile' : 'Admission Entry Form'}</h3>
                <p className="text-slate-500 text-sm font-medium italic">Available: Play to Class Five</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[75vh] space-y-6">
              {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 font-bold text-sm border border-rose-100"><AlertCircle className="w-5 h-5" /> {error}</div>}
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-28 h-28 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-2 group transition-all hover:border-indigo-400">
                    {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-300" />}
                    <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <span className="text-[10px] font-black uppercase">Click to Upload</span>
                    </label>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport Size Photo</p>
                </div>

                {editingId && (
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Unique ID</label>
                    <div className="flex gap-2">
                      <input 
                        value={formData.uniqueId || ''} 
                        onChange={e => setFormData({...formData, uniqueId: e.target.value})}
                        className="flex-1 px-4 py-3 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-indigo-600 font-black text-xl tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="S-0000"
                      />
                      <button 
                        type="button"
                        onClick={handleGenerateId}
                        className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl hover:bg-indigo-200 transition-colors"
                        title="Auto-generate ID"
                      >
                        <RefreshCw className="w-6 h-6" />
                      </button>
                    </div>
                    <p className="text-[10px] text-indigo-400 font-bold mt-2 italic">You can manually enter or auto-generate</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Class</label>
                  <select required value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold">
                    <option value="">Select...</option>
                    {['Play', 'Nursery', 'KG', 'Class One', 'Class Two', 'Class Three', 'Class Four', 'Class Five'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Roll No.</label>
                  <input required value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="e.g. 01" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Full Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Father's Name</label>
                  <input required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mother's Name</label>
                  <input required value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Guardian Contact No.</label>
                  <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="01XXX-XXXXXX" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Birth Date</label>
                  <input required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admission Date</label>
                  <input required type="date" value={formData.admissionDate} onChange={e => setFormData({...formData, admissionDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                  <div className="flex gap-4">
                    {['Male', 'Female'].map(g => (
                      <label key={g} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all ${formData.gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                        <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="hidden" />
                        <span className="text-xs font-black uppercase tracking-widest">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Present Address</label>
                  <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold" rows={2} placeholder="Village, Post Office, Upazila..."></textarea>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                {editingId ? 'UPDATE RECORD' : 'COMPLETE REGISTRATION'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;
