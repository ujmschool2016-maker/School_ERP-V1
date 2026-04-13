
import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Trophy, Edit3, X, Medal, Star, TrendingUp } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Student, Result } from '../types';

const ResultView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Result, 'id' | 'grade' | 'status'>>({
    studentRoll: '', className: '', examType: '1st', subject: '', marks: 0
  });

  useEffect(() => {
    const unsubStudents = dataService.subscribeToStudents(setStudents);
    const unsubResults = dataService.subscribeToResults(setResults);
    return () => {
      unsubStudents();
      unsubResults();
    };
  }, []);

  const calculateFinalGrade = (totalMarks: number, subjectsCount: number) => {
    if (subjectsCount === 0) return 'N/A';
    const avg = totalMarks / (subjectsCount * 4); // Average marks per subject across 4 potential terms
    if (avg >= 80) return 'A+';
    if (avg >= 70) return 'A';
    if (avg >= 60) return 'A-';
    if (avg >= 50) return 'B';
    if (avg >= 40) return 'C';
    if (avg >= 33) return 'D';
    return 'F';
  };

  const getStudentName = (roll: string) => students.find(s => s.roll === roll)?.name || 'Unknown';

  const consolidatedData = useMemo(() => {
    const summary: Record<string, { 
      results: Result[], 
      totalMarks: number, 
      subjects: Set<string>,
      className: string 
    }> = {};

    results.forEach(r => {
      if (!summary[r.studentRoll]) {
        summary[r.studentRoll] = { 
          results: [], 
          totalMarks: 0, 
          subjects: new Set(),
          className: r.className
        };
      }
      summary[r.studentRoll].results.push(r);
      summary[r.studentRoll].totalMarks += r.marks;
      summary[r.studentRoll].subjects.add(r.subject);
    });

    return summary;
  }, [results]);

  const meritList = useMemo(() => {
    const classRanks: Record<string, Array<{ roll: string, total: number }>> = {};
    
    Object.keys(consolidatedData).forEach(roll => {
      const { className, totalMarks } = consolidatedData[roll];
      if (!classRanks[className]) classRanks[className] = [];
      classRanks[className].push({ roll, total: totalMarks });
    });

    const finalRanks: Record<string, number> = {};
    Object.keys(classRanks).forEach(className => {
      classRanks[className].sort((a, b) => b.total - a.total);
      classRanks[className].forEach((item, index) => {
        finalRanks[item.roll] = index + 1;
      });
    });

    return finalRanks;
  }, [consolidatedData]);

  const handleEdit = (r: Result) => {
    setEditingId(r.id);
    setFormData({
      studentRoll: r.studentRoll,
      className: r.className,
      examType: r.examType,
      subject: r.subject,
      marks: r.marks
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentRoll) return;
    
    try {
      if (editingId) {
        await dataService.updateResult({ ...formData, id: editingId } as Result);
      } else {
        await dataService.saveResult(formData);
      }
      
      alert(editingId ? 'Result updated!' : 'Result published!');
      setFormData({ ...formData, subject: '', marks: 0 });
      setEditingId(null);
    } catch (err: any) {
      alert('Failed to save result: ' + err.message);
    }
  };

  const filteredRolls = useMemo(() => {
    return Object.keys(consolidatedData).filter(roll => 
      roll.includes(searchTerm) || getStudentName(roll).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [consolidatedData, searchTerm, students]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-fit sticky top-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              {editingId ? <Edit3 className="w-6 h-6 text-indigo-600" /> : <ClipboardList className="w-6 h-6 text-indigo-600" />}
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase">{editingId ? 'Edit Result' : 'Input Marks'}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Select Student</label>
              <select required disabled={!!editingId} value={formData.studentRoll} onChange={e => {
                const s = students.find(st => st.roll === e.target.value);
                setFormData({...formData, studentRoll: e.target.value, className: s?.className || ''});
              }} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-50">
                <option value="">Choose Student...</option>
                {students.map(s => <option key={s.id} value={s.roll}>{s.roll} - {s.name} ({s.className})</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Term</label>
                <select required value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold">
                  <option value="1st">1st Sem</option>
                  <option value="2nd">2nd Sem</option>
                  <option value="3rd">3rd Sem</option>
                  <option value="Annual">Annual Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Class (Locked)</label>
                <input readOnly value={formData.className} className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-slate-400 font-bold" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Subject</label>
              <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold">
                <option value="">Choose Subject...</option>
                <option value="Bangla">Bangla</option>
                <option value="English">English</option>
                <option value="Math">Math</option>
                <option value="Arabic">Arabic</option>
                <option value="General Knowledge">General Knowledge</option>
                <option value="Social Science">Social Science</option>
                <option value="Chitrankon">Chitrankon</option>
                <option value="Science">Science</option>
                <option value="Religion">Religion</option>
                <option value="ICT">ICT</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Marks (0-100)</label>
              <input required type="number" max="100" value={formData.marks || ''} onChange={e => setFormData({...formData, marks: Number(e.target.value)})} className="w-full px-4 py-4 bg-indigo-50 border-none rounded-2xl text-2xl font-black text-indigo-700" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all">
              {editingId ? 'UPDATE RESULT' : 'PUBLISH RESULT'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ studentRoll: '', className: '', examType: '1st', subject: '', marks: 0 }); }} className="w-full text-slate-400 font-bold py-2 hover:text-rose-500">Cancel Editing</button>
            )}
          </form>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-slate-900 uppercase">Performance Summary & Merit List</h3>
               <div className="flex gap-2">
                  <div className="px-3 py-1 bg-amber-50 rounded-lg flex items-center gap-1.5">
                    <Medal className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-600 uppercase">Class Rank</span>
                  </div>
               </div>
            </div>

            {filteredRolls.map(roll => {
              const data = consolidatedData[roll];
              const subjects = Array.from(data.subjects);
              const rank = meritList[roll];
              
              return (
                <div key={roll} className="mb-10 last:mb-0 animate-in slide-in-from-bottom-2">
                  <div className="bg-slate-900 text-white p-5 rounded-t-[2rem] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${rank === 1 ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white'}`}>
                        {rank}
                      </div>
                      <div>
                        <p className="font-black leading-none">{getStudentName(roll)}</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase mt-1 tracking-widest">Roll: {roll} • {data.className}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/40 uppercase">Final Grade</p>
                      <p className="text-xl font-black text-indigo-400">{calculateFinalGrade(data.totalMarks, subjects.length)}</p>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 rounded-b-[2rem] overflow-hidden bg-slate-50/30">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100/50">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Subject</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">1st Term</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">2nd Term</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">3rd Term</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center">Annual</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Aggregate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {subjects.map(subject => {
                          const sResults = data.results.filter(r => r.subject === subject);
                          const term1 = sResults.find(r => r.examType === '1st');
                          const term2 = sResults.find(r => r.examType === '2nd');
                          const term3 = sResults.find(r => r.examType === '3rd');
                          const annual = sResults.find(r => r.examType === 'Annual');
                          const subTotal = (term1?.marks || 0) + (term2?.marks || 0) + (term3?.marks || 0) + (annual?.marks || 0);

                          return (
                            <tr key={subject} className="group hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-800">{subject}</td>
                              <td className="px-6 py-4 text-center">
                                {term1 ? (
                                  <div className="relative group/cell">
                                    <span className="font-black text-slate-600">{term1.marks}</span>
                                    <button onClick={() => handleEdit(term1)} className="absolute -right-2 top-0 opacity-0 group-hover/cell:opacity-100 text-indigo-400 p-1"><Edit3 className="w-3 h-3"/></button>
                                  </div>
                                ) : <span className="text-slate-300">-</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {term2 ? (
                                  <div className="relative group/cell">
                                    <span className="font-black text-slate-600">{term2.marks}</span>
                                    <button onClick={() => handleEdit(term2)} className="absolute -right-2 top-0 opacity-0 group-hover/cell:opacity-100 text-indigo-400 p-1"><Edit3 className="w-3 h-3"/></button>
                                  </div>
                                ) : <span className="text-slate-300">-</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {term3 ? (
                                  <div className="relative group/cell">
                                    <span className="font-black text-slate-600">{term3.marks}</span>
                                    <button onClick={() => handleEdit(term3)} className="absolute -right-2 top-0 opacity-0 group-hover/cell:opacity-100 text-indigo-400 p-1"><Edit3 className="w-3 h-3"/></button>
                                  </div>
                                ) : <span className="text-slate-300">-</span>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {annual ? (
                                  <div className="relative group/cell">
                                    <span className="font-black text-slate-600">{annual.marks}</span>
                                    <button onClick={() => handleEdit(annual)} className="absolute -right-2 top-0 opacity-0 group-hover/cell:opacity-100 text-indigo-400 p-1"><Edit3 className="w-3 h-3"/></button>
                                  </div>
                                ) : <span className="text-slate-300">-</span>}
                              </td>
                              <td className="px-6 py-4 text-right font-black text-indigo-600">
                                {subTotal}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-indigo-50/50">
                           <td colSpan={5} className="px-6 py-4 text-[10px] font-black uppercase text-indigo-400">Cumulative Total Score</td>
                           <td className="px-6 py-4 text-right text-xl font-black text-indigo-700">{data.totalMarks}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
            
            {filteredRolls.length === 0 && (
              <div className="py-24 text-center opacity-20">
                <ClipboardList className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest">No Results Recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
