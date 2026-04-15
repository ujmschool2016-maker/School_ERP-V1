
import React, { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, Users, UserCheck, CreditCard, Banknote, HardHat, Calendar } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Student, Teacher, FeeRecord, SalaryRecord, OperationCost, AttendanceRecord, LeaveRequest } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [costs, setCosts] = useState<OperationCost[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    const unsubStudents = dataService.subscribeToStudents(setStudents);
    const unsubTeachers = dataService.subscribeToTeachers(setTeachers);
    const unsubFees = dataService.subscribeToFees(setFees);
    const unsubSalaries = dataService.subscribeToSalaries(setSalaries);
    const unsubCosts = dataService.subscribeToCosts(setCosts);
    const unsubAttendance = dataService.subscribeToAttendance(setAttendance);
    const unsubLeaves = dataService.subscribeToLeaves(setLeaves);

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubFees();
      unsubSalaries();
      unsubCosts();
      unsubAttendance();
      unsubLeaves();
    };
  }, []);

  const downloadPDF = (title: string, headers: string[][], data: any[][], filename: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Uttar Jurbaria Model School (UJMS)', 14, 22);
    doc.setFontSize(12);
    doc.text(title, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    (doc as any).autoTable({
      startY: 45,
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: { fillStyle: '#4f46e5', textColor: '#ffffff', fontStyle: 'bold' },
      styles: { fontSize: 8 },
    });

    doc.save(`${filename}.pdf`);
  };

  const downloadExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const reports = [
    {
      id: 'students',
      title: 'Student Enrollment Report',
      description: 'Full list of registered students with academic details.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      onPDF: () => {
        const headers = [['Roll', 'Name', 'Class', 'Father Name', 'Mobile', 'Gender']];
        const data = students.map(s => [s.roll, s.name, s.className, s.fatherName, s.mobile, s.gender]);
        downloadPDF('Student Enrollment Report', headers, data, 'Student_Report');
      },
      onExcel: () => {
        const data = students.map(s => ({
          Roll: s.roll,
          Name: s.name,
          Class: s.className,
          Father: s.fatherName,
          Mother: s.motherName,
          Mobile: s.mobile,
          Gender: s.gender,
          Address: s.address
        }));
        downloadExcel(data, 'Student_Report');
      }
    },
    {
      id: 'teachers',
      title: 'Staff Directory Report',
      description: 'List of teachers and staff with designation and salary.',
      icon: UserCheck,
      color: 'bg-violet-50 text-violet-600',
      onPDF: () => {
        const headers = [['Name', 'Designation', 'Mobile', 'Salary', 'Joined', 'Gender']];
        const data = teachers.map(t => [t.name, t.designation, t.mobile, `৳${t.baseSalary}`, t.joiningDate, t.gender]);
        downloadPDF('Staff Directory Report', headers, data, 'Teacher_Report');
      },
      onExcel: () => {
        const data = teachers.map(t => ({
          Name: t.name,
          Designation: t.designation,
          Mobile: t.mobile,
          Salary: t.baseSalary,
          JoiningDate: t.joiningDate,
          Gender: t.gender,
          Address: t.address
        }));
        downloadExcel(data, 'Teacher_Report');
      }
    },
    {
      id: 'fees',
      title: 'Fees Collection Ledger',
      description: 'History of all fee payments and dues.',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-600',
      onPDF: () => {
        const headers = [['Roll', 'Month', 'Total', 'Paid', 'Due']];
        const data = fees.map(f => [f.studentRoll, f.month, `৳${f.total}`, `৳${f.paidAmount}`, `৳${f.dueAmount}`]);
        downloadPDF('Fees Collection Ledger', headers, data, 'Fees_Report');
      },
      onExcel: () => {
        const data = fees.map(f => ({
          Roll: f.studentRoll,
          Month: f.month,
          Total: f.total,
          Paid: f.paidAmount,
          Due: f.dueAmount
        }));
        downloadExcel(data, 'Fees_Report');
      }
    },
    {
      id: 'salaries',
      title: 'Salary Payout History',
      description: 'Record of salaries paid to teachers and staff.',
      icon: Banknote,
      color: 'bg-green-50 text-green-600',
      onPDF: () => {
        const headers = [['Teacher ID', 'Month', 'Base', 'Bonus', 'Deductions', 'Total', 'Date']];
        const data = salaries.map(s => [s.teacherId, s.month, `৳${s.baseSalary}`, `৳${s.bonus}`, `৳${s.deductions}`, `৳${s.total}`, s.paymentDate]);
        downloadPDF('Salary Payout History', headers, data, 'Salary_Report');
      },
      onExcel: () => {
        const data = salaries.map(s => ({
          TeacherID: s.teacherId,
          Month: s.month,
          Base: s.baseSalary,
          Bonus: s.bonus,
          Deductions: s.deductions,
          Total: s.total,
          Date: s.paymentDate
        }));
        downloadExcel(data, 'Salary_Report');
      }
    },
    {
      id: 'costs',
      title: 'Operational Expense Report',
      description: 'Detailed list of all school expenses and costs.',
      icon: HardHat,
      color: 'bg-slate-50 text-slate-600',
      onPDF: () => {
        const headers = [['Date', 'Category', 'Description', 'Amount']];
        const data = costs.map(c => [c.date, c.category, c.description, `৳${c.amount}`]);
        downloadPDF('Operational Expense Report', headers, data, 'Expense_Report');
      },
      onExcel: () => {
        const data = costs.map(c => ({
          Date: c.date,
          Category: c.category,
          Description: c.description,
          Amount: c.amount
        }));
        downloadExcel(data, 'Expense_Report');
      }
    },
    {
      id: 'attendance',
      title: 'Attendance Summary',
      description: 'Daily attendance records for students and teachers.',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600',
      onPDF: () => {
        const headers = [['Date', 'Name', 'Type', 'Status', 'Time']];
        const data = attendance.map(a => [a.date, a.entityName, a.type, a.status, a.time]);
        downloadPDF('Attendance Summary', headers, data, 'Attendance_Report');
      },
      onExcel: () => {
        const data = attendance.map(a => ({
          Date: a.date,
          Name: a.entityName,
          Type: a.type,
          Status: a.status,
          Time: a.time,
          Class: a.className || 'N/A'
        }));
        downloadExcel(data, 'Attendance_Report');
      }
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl ${report.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={report.onPDF}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={report.onExcel}
                    className="p-2 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                    title="Download Excel"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{report.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{report.description}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Format: PDF / XLSX</span>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                      <FileText className="w-3 h-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-black uppercase mb-2">Need a custom report?</h3>
          <p className="text-indigo-100 text-sm font-medium max-w-md">Our system can generate specialized reports for academic performance, financial audits, and more. Contact administration for details.</p>
        </div>
        <FileText className="absolute -right-8 -bottom-8 w-48 h-48 text-indigo-500 opacity-20 rotate-12" />
      </div>
    </div>
  );
};

export default ReportView;
