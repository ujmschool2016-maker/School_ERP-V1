
import React, { useState, useEffect, useMemo } from 'react';
import { UserRoundCheck, Search, CheckCircle, XCircle, Clock, Filter, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Student, AttendanceRecord } from '../types';

const AttendanceView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filterClass, setFilterClass] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsubStudents = dataService.subscribeToStudents(setStudents);
    const unsubAttendance = dataService.subscribeToAttendance(setAttendance);
    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = filterClass === 'All' || s.className === filterClass;
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.includes(searchTerm);
      return matchClass && matchSearch;
    });
  }, [students, filterClass, searchTerm]);

  const stats = useMemo(() => {
    const classAttendance = attendance.filter(a => a.date === today && (filterClass === 'All' || a.className === filterClass));
    const present = classAttendance.filter(a => a.status === 'Present').length;
    const late = classAttendance.filter(a => a.status === 'Late').length;
    const absent = classAttendance.filter(a => a.status === 'Absent').length;
    const totalMarked = classAttendance.length;
    const classTotal = filterClass === 'All' ? students.length : students.filter(s => s.className === filterClass).length;
    
    return { present, late, absent, remaining: classTotal - totalMarked, total: classTotal };
  }, [attendance, students, filterClass, today]);

  const markStatus = async (student: Student, status: 'Present' | 'Absent' | 'Late') => {
    try {
      await dataService.markAttendance({
        entityId: student.roll,
        entityName: student.name,
        type: 'Student',
        status,
        className: student.className,
        date: today
      });
    } catch (err: any) {
      alert('Failed to mark attendance: ' + err.message);
    }
  };

  const getStatus = (roll: string) => {
    return attendance.find(a => a.entityId === roll && a.date === today)?.status;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <UserRoundCheck className="w-8 h-8 text-slate-200" />
        </div>
        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-emerald-500 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Present</p>
          <p className="text-2xl font-black text-slate-900">{stats.present}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-rose-500 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Absent</p>
          <p className="text-2xl font-black text-slate-900">{stats.absent}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-amber-500 border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Late</p>
          <p className="text-2xl font-black text-slate-900">{stats.late}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search student..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
          />
        </div>
        <select 
          value={filterClass} 
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-6 py-4 bg-white rounded-2xl border border-slate-200 font-bold text-slate-700 shadow-sm min-w-[150px]"
        >
          <option value="All">All Classes</option>
          <option value="Play">Play</option>
          <option value="Nursery">Nursery</option>
          <option value="KG">KG</option>
          <option value="Class One">Class One</option>
          <option value="Class Two">Class Two</option>
          <option value="Class Three">Class Three</option>
          <option value="Class Four">Class Four</option>
          <option value="Class Five">Class Five</option>
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => {
                const status = getStatus(s.roll);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">Roll: {s.roll}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{s.className}</span>
                    </td>
                    <td className="px-8 py-5">
                      {status ? (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 
                          status === 'Absent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>{status}</span>
                      ) : <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Not Marked</span>}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => markStatus(s, 'Present')} className={`p-2 rounded-xl transition-all ${status === 'Present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 hover:text-emerald-600'}`}>
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => markStatus(s, 'Absent')} className={`p-2 rounded-xl transition-all ${status === 'Absent' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-400 hover:text-rose-600'}`}>
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => markStatus(s, 'Late')} className={`p-2 rounded-xl transition-all ${status === 'Late' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 text-slate-400 hover:text-amber-500'}`}>
                          <Clock className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
