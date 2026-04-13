
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, User, CreditCard, ClipboardList, UserRoundCheck, MapPin, Calendar, Phone, Shield, Wallet, Star, TrendingUp, Award, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Student, FeeRecord, Result, AttendanceRecord } from '../types';

interface StudentDetailsViewProps {
  roll: string;
  onBack: () => void;
}

const StudentDetailsView: React.FC<StudentDetailsViewProps> = ({ roll, onBack }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'profile' | 'fees' | 'academic' | 'attendance'>('summary');

  useEffect(() => {
    const unsubStudents = dataService.subscribeToStudents((students) => {
      const s = students.find(st => st.roll === roll);
      if (s) setStudent(s);
    });
    const unsubFees = dataService.subscribeToFees((fees) => {
      setFees(fees.filter(f => f.studentRoll === roll));
    });
    const unsubResults = dataService.subscribeToResults((results) => {
      setResults(results.filter(r => r.studentRoll === roll));
    });
    const unsubAttendance = dataService.subscribeToAttendance((attendance) => {
      setAttendance(attendance.filter(a => a.entityId === roll));
    });

    return () => {
      unsubStudents();
      unsubFees();
      unsubResults();
      unsubAttendance();
    };
  }, [roll]);

  const stats = useMemo(() => {
    const totalPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    
    // Calculate balance locally based on fees history
    const totalPayable = fees.reduce((acc, f) => acc + (f.total - f.previousDue), 0);
    const totalPaidAll = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const balance = Math.max(0, totalPayable - totalPaidAll);

    const totalMarks = results.reduce((acc, r) => acc + r.marks, 0);
    const avgMarks = results.length > 0 ? (totalMarks / results.length).toFixed(1) : 'N/A';
    const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const attPercentage = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : '100';

    return { totalPaid, balance, avgMarks, attPercentage, totalMarks, presentCount, totalDays: attendance.length };
  }, [fees, results, attendance, roll]);

  if (!student) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <User className="w-16 h-16 mb-4 opacity-20" />
      <p className="font-black uppercase tracking-widest">Student Not Found</p>
      <button onClick={onBack} className="mt-4 text-indigo-600 font-bold hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 no-print">
        <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">Student Terminal: {student.name}</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Academic Dashboard • {student.className} • Roll: {student.roll}</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden no-print">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 p-2 overflow-x-auto bg-slate-50/30">
          {[
            { id: 'summary', label: 'Overall Summary', icon: TrendingUp },
            { id: 'profile', label: 'Bio Data', icon: User },
            { id: 'academic', label: 'Results', icon: Award },
            { id: 'fees', label: 'Finance', icon: CreditCard },
            { id: 'attendance', label: 'Attendance', icon: UserRoundCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {activeTab === 'summary' && (
            <div className="space-y-8">
              {/* Summary Hero Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Fees Cleared</p>
                    <p className="text-4xl font-black text-emerald-900">৳{stats.totalPaid.toLocaleString()}</p>
                    <div className="h-1 w-full bg-emerald-200 rounded-full mt-4">
                      <div className="h-full bg-emerald-600 rounded-full" style={{width: '75%'}}></div>
                    </div>
                 </div>
                 <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Outstanding Dues</p>
                    <p className="text-4xl font-black text-rose-900">৳{stats.balance.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-rose-400 mt-2 uppercase">Please clear as soon as possible</p>
                 </div>
                 <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Attendance Health</p>
                    <p className="text-4xl font-black text-indigo-900">{stats.attPercentage}%</p>
                    <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase">{stats.presentCount} / {stats.totalDays} Days Present</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                   <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-indigo-600" /> Academic Performance</h4>
                   <div className="space-y-4">
                      {results.slice(0, 4).map(r => (
                        <div key={r.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                           <div>
                             <p className="text-sm font-black text-slate-800">{r.subject}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{r.examType}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-sm font-black text-indigo-600">{r.marks}/100</p>
                             <p className={`text-[10px] font-black uppercase ${r.status === 'Pass' ? 'text-emerald-500' : 'text-rose-500'}`}>{r.status}</p>
                           </div>
                        </div>
                      ))}
                      {results.length === 0 && <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px]">No results recorded yet</p>}
                   </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
                   <h4 className="text-lg font-black mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> Recent Attendance Log</h4>
                   <div className="space-y-3">
                      {attendance.slice(-5).reverse().map(a => (
                        <div key={a.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                          <span className="text-sm font-bold">{a.date}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                            a.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>{a.status}</span>
                        </div>
                      ))}
                      {attendance.length === 0 && <p className="text-center py-10 text-white/20 font-bold uppercase text-[10px]">No attendance marked yet</p>}
                   </div>
                   <Clock className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 -rotate-12" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><span className="w-4 h-1 bg-indigo-500 rounded-full"></span> Family Info</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Shield className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father's Name</p>
                      <p className="font-bold text-slate-900">{student.fatherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Shield className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mother's Name</p>
                      <p className="font-bold text-slate-900">{student.motherName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><span className="w-4 h-1 bg-emerald-500 rounded-full"></span> Contact</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Phone className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                      <p className="font-bold text-slate-900">{student.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><MapPin className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Address</p>
                      <p className="font-bold text-slate-900 text-sm">{student.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center p-8 bg-slate-50 rounded-[2rem]">
                 <div className="w-24 h-24 rounded-[2rem] bg-indigo-100 overflow-hidden mb-4 border-4 border-white shadow-lg">
                    {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <User className="w-12 h-12 m-6 text-indigo-300" />}
                 </div>
                 <p className="text-xl font-black text-slate-900">{student.name}</p>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Roll #{student.roll}</p>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="overflow-x-auto -mx-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Subject</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Term</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Marks</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-900">{r.subject}</td>
                      <td className="px-8 py-5 text-center font-medium text-slate-500">{r.examType}</td>
                      <td className="px-8 py-5 text-center font-black text-indigo-600">{r.marks}/100</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${r.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="overflow-x-auto -mx-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Month</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-center">Paid Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fees.map((f) => (
                    <tr key={f.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-900">{f.month}</td>
                      <td className="px-8 py-5 text-center font-black text-emerald-600">৳{f.paidAmount.toLocaleString()}</td>
                      <td className="px-8 py-5 text-right font-black text-rose-600">৳{f.dueAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="overflow-x-auto -mx-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-5 font-bold text-slate-900">{a.date}</td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{a.time}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsView;
