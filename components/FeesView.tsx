
import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, History, CheckCircle2, AlertCircle, Search, Printer, ReceiptText, Trash2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Student, FeeRecord, ClassRates } from '../types';

const FeesView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [feesHistory, setFeesHistory] = useState<FeeRecord[]>([]);
  const [rates, setRates] = useState<ClassRates[]>([]);
  const [success, setSuccess] = useState(false);
  const [printableRecord, setPrintableRecord] = useState<FeeRecord | null>(null);
  
  const [formData, setFormData] = useState({
    studentRoll: '',
    month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()),
    admissionFee: 0,
    registrationFee: 0,
    idCardDiaryFee: 0,
    sessionFee: 0,
    tuitionFee: 0,
    examFee: 0,
    culturalSportsFee: 0,
    scholarshipExamFee: 0,
    othersFee: 0,
    paidAmount: 0
  });

  const [previousDue, setPreviousDue] = useState(0);

  useEffect(() => {
    const unsubStudents = dataService.subscribeToStudents(setStudents);
    const unsubFees = dataService.subscribeToFees((fees) => {
      setFeesHistory(fees.sort((a, b) => Number(b.id) - Number(a.id)));
    });
    const unsubRates = dataService.subscribeToRates(setRates);
    
    return () => {
      unsubStudents();
      unsubFees();
      unsubRates();
    };
  }, []);

  const getStudentBalance = (roll: string) => {
    const studentFees = feesHistory.filter(f => f.studentRoll === roll);
    const totalPayable = studentFees.reduce((acc, f) => acc + (f.total - f.previousDue), 0);
    const totalPaid = studentFees.reduce((acc, f) => acc + f.paidAmount, 0);
    return Math.max(0, totalPayable - totalPaid);
  };

  useEffect(() => {
    if (formData.studentRoll) {
      const student = students.find(s => s.roll === formData.studentRoll);
      const balance = getStudentBalance(formData.studentRoll);
      setPreviousDue(balance);

      if (student) {
        const classRate = rates.find(r => r.className === student.className);
        if (classRate) {
          setFormData(prev => ({
            ...prev,
            tuitionFee: classRate.tuitionFee,
            examFee: ['March', 'July', 'December'].includes(formData.month) ? classRate.examFee : 0,
            admissionFee: formData.month === 'January' ? classRate.admissionFee : 0,
            sessionFee: formData.month === 'January' ? classRate.sessionFee : 0,
            registrationFee: formData.month === 'January' ? classRate.registrationFee : 0,
          }));
        }
      }
    } else {
      setPreviousDue(0);
      setFormData(prev => ({
        ...prev,
        admissionFee: 0, registrationFee: 0, sessionFee: 0, tuitionFee: 0, examFee: 0
      }));
    }
  }, [formData.studentRoll, formData.month, rates, students, feesHistory]);

  const totals = useMemo(() => {
    const currentMonthFees = 
      formData.admissionFee + formData.registrationFee + formData.idCardDiaryFee + 
      formData.sessionFee + formData.tuitionFee + formData.examFee + 
      formData.culturalSportsFee + formData.scholarshipExamFee + formData.othersFee;
    
    const grossPayable = currentMonthFees + previousDue;
    const remainingDue = grossPayable - formData.paidAmount;
    
    return { 
      current: currentMonthFees, 
      total: grossPayable, 
      due: Math.max(0, remainingDue) 
    };
  }, [formData, previousDue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentRoll) return alert('Please select a student');
    
    try {
      const newRecord = await dataService.saveFee({
        ...formData,
        previousDue: previousDue,
        total: totals.total,
        dueAmount: totals.due
      } as any);
      
      if (newRecord) {
        setPrintableRecord(newRecord as any);
      }
      setFormData({
        studentRoll: '', month: formData.month, 
        admissionFee: 0, registrationFee: 0, idCardDiaryFee: 0, sessionFee: 0, tuitionFee: 0, 
        examFee: 0, culturalSportsFee: 0, scholarshipExamFee: 0, othersFee: 0, paidAmount: 0
      });
      alert('Fee collection recorded successfully!');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save fee record: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this fee record?')) {
      try {
        await dataService.deleteFee(id);
        alert('Fee record deleted!');
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handlePrint = (record: FeeRecord) => {
    setPrintableRecord(record);
    setTimeout(() => {
        window.print();
    }, 200);
  };

  const getStudent = (roll: string) => students.find(s => s.roll === roll);
  const getStudentName = (roll: string) => {
    const s = getStudent(roll);
    return s ? `${s.name} (${s.className})` : `Roll: ${roll}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 relative">
      
      {/* Printable Area */}
      {printableRecord && (
        <div className="print-only fixed inset-0 bg-white p-12 z-[9999]">
          <div className="max-w-3xl mx-auto border-4 border-double border-slate-900 p-8">
            <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
              <h1 className="text-4xl font-black uppercase tracking-tighter">Uttar Jurbaria Model School (UJMS)</h1>
              <p className="text-sm font-bold mt-1">Managed Academy | Reliable Educational Solution</p>
              <div className="mt-4 flex justify-between text-xs font-black uppercase bg-slate-100 p-2 rounded">
                <span>Transaction ID: #{printableRecord.id}</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</p>
                <p className="text-xl font-black">{getStudent(printableRecord.studentRoll)?.name || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</p>
                   <p className="text-sm font-black">{getStudent(printableRecord.studentRoll)?.className || 'N/A'}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll</p>
                   <p className="text-sm font-black">#{printableRecord.studentRoll}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between border-b py-1">
                 <span className="text-sm font-bold uppercase">Billing Period</span>
                 <span className="text-sm font-black">{printableRecord.month}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="border-b-2 border-slate-900">
                  <tr className="text-left font-black uppercase text-xs">
                    <th className="py-2">Fee Description</th>
                    <th className="py-2 text-right">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printableRecord.admissionFee > 0 && <tr><td className="py-1.5">Admission Fee</td><td className="text-right py-1.5">৳{printableRecord.admissionFee}</td></tr>}
                  {printableRecord.registrationFee > 0 && <tr><td className="py-1.5">Registration Fee</td><td className="text-right py-1.5">৳{printableRecord.registrationFee}</td></tr>}
                  {printableRecord.tuitionFee > 0 && <tr><td className="py-1.5">Monthly Tuition Fee</td><td className="text-right py-1.5">৳{printableRecord.tuitionFee}</td></tr>}
                  {printableRecord.sessionFee > 0 && <tr><td className="py-1.5">Session Fee</td><td className="text-right py-1.5">৳{printableRecord.sessionFee}</td></tr>}
                  {printableRecord.idCardDiaryFee > 0 && <tr><td className="py-1.5">ID Card & Diary</td><td className="text-right py-1.5">৳{printableRecord.idCardDiaryFee}</td></tr>}
                  {printableRecord.examFee > 0 && <tr><td className="py-1.5">Exam Fee</td><td className="text-right py-1.5">৳{printableRecord.examFee}</td></tr>}
                  {printableRecord.culturalSportsFee > 0 && <tr><td className="py-1.5">Cultural & Sports</td><td className="text-right py-1.5">৳{printableRecord.culturalSportsFee}</td></tr>}
                  {printableRecord.scholarshipExamFee > 0 && <tr><td className="py-1.5">Scholarship Exam</td><td className="text-right py-1.5">৳{printableRecord.scholarshipExamFee}</td></tr>}
                  {printableRecord.othersFee > 0 && <tr><td className="py-1.5">Other Charges</td><td className="text-right py-1.5">৳{printableRecord.othersFee}</td></tr>}
                  <tr className="font-bold bg-slate-50"><td className="py-2 pl-2">Current Month Total</td><td className="text-right py-2 pr-2">৳{(printableRecord.total - printableRecord.previousDue).toLocaleString()}</td></tr>
                  <tr><td className="py-2 text-rose-600">Previous Arrears (Due)</td><td className="text-right py-2 text-rose-600 font-bold">+ ৳{printableRecord.previousDue.toLocaleString()}</td></tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 text-lg font-black uppercase">
                    <td className="py-3">Grand Total Payable</td>
                    <td className="text-right py-3">৳{printableRecord.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-8 items-end">
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Paid (Cash/Check)</p>
                    <p className="text-3xl font-black text-emerald-700">৳{printableRecord.paidAmount.toLocaleString()}</p>
                    <div className="mt-3 border-t border-emerald-200 pt-2 flex justify-between items-center">
                        <span className="text-[10px] font-black text-rose-500">CLOSING DUE</span>
                        <span className="text-sm font-black text-rose-600">৳{printableRecord.dueAmount.toLocaleString()}</span>
                    </div>
                </div>
                <div className="text-center pb-2">
                    <div className="w-full border-b border-slate-900 mb-2"></div>
                    <p className="text-[10px] font-black uppercase">Authorized Signature</p>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Stamp of UJMS Administration</p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="lg:col-span-5 space-y-6 no-print">
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          {success && (
            <div className="absolute inset-0 bg-emerald-600/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white text-center p-6 animate-in fade-in duration-300">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <h4 className="text-xl font-black">Collection Logged</h4>
              <button 
                onClick={() => handlePrint(feesHistory[0])}
                className="mt-6 flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black hover:scale-105 transition-transform"
              >
                <Printer className="w-5 h-5" /> PRINT RECEIPT NOW
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-100 rounded-2xl"><CreditCard className="w-6 h-6 text-indigo-600" /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Fee Entry Form</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing {formData.month} Payouts</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Select Student</label>
                <select required value={formData.studentRoll} onChange={e => setFormData({...formData, studentRoll: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold">
                  <option value="">Choose Student From Database...</option>
                  {students.map(s => <option key={s.id} value={s.roll}>{s.roll} - {s.name} [{s.className}]</option>)}
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Billing Month</label>
                <select required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold">
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {previousDue > 0 && (
                <div className="col-span-2 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex justify-between items-center animate-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-rose-500 uppercase">Arrears/Due: ৳{previousDue.toLocaleString()}</p>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
              )}
              
              {[
                { label: 'Tuition Fee', key: 'tuitionFee' },
                { label: 'Exam Fee', key: 'examFee' },
                { label: 'Admission Fee', key: 'admissionFee' },
                { label: 'Session Fee', key: 'sessionFee' },
                { label: 'Registration', key: 'registrationFee' },
                { label: 'ID Card/Diary', key: 'idCardDiaryFee' },
                { label: 'Others', key: 'othersFee' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{field.label}</label>
                  <input type="number" min="0" value={(formData as any)[field.key] || ''} onChange={e => setFormData({...formData, [field.key]: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" />
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-900 rounded-3xl text-white mt-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <span className="font-black text-emerald-400 uppercase text-xs">AMOUNT RECEIVED</span>
                <input type="number" min="0" value={formData.paidAmount || ''} onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})} className="w-32 bg-white/10 text-right font-mono border-none rounded-xl px-3 py-2 text-lg font-bold" />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-xs uppercase opacity-60">CLOSING DUE</span>
                <span className={`text-2xl font-mono font-black ${totals.due > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>৳{totals.due.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-xl transition-all">LOG PAYMENT</button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-7 no-print h-full flex flex-col">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px] sm:h-[700px]">
          <div className="p-8 border-b border-slate-100 shrink-0">
             <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2"><History className="w-6 h-6 text-indigo-600" /> Recent History</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Student</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Paid</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {feesHistory.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{getStudentName(f.studentRoll)}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{f.month}</p>
                    </td>
                    <td className="px-8 py-5 text-center font-black text-emerald-600">৳{f.paidAmount.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handlePrint(f)} className="p-2 bg-slate-100 rounded-xl hover:bg-indigo-600 hover:text-white shadow-sm transition-colors"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(f.id)} className="p-2 bg-slate-100 rounded-xl hover:bg-rose-600 hover:text-white shadow-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {feesHistory.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-24 text-center opacity-30">
                      <ReceiptText className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest">No history found</p>
                    </td>
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

export default FeesView;
