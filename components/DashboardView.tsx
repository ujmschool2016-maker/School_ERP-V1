
import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Wallet, TrendingDown, Clock, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { dataService } from '../services/dataService';
import { DashboardStats, Student } from '../types';

interface DashboardViewProps {
  onSearchStudent: (roll: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onSearchStudent }) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, st] = await Promise.all([
          dataService.getDashboardStats(),
          dataService.getStudents()
        ]);
        setStats(s);
        setStudents(st);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentSearch.trim()) {
      const s = students.find(st => st.roll === studentSearch || st.name.toLowerCase().includes(studentSearch.toLowerCase()));
      if (s) onSearchStudent(s.roll);
      else alert('Student not found!');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, sub: `${stats.studentsOnLeave} on leave`, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Teachers', value: stats.totalTeachers, sub: `${stats.teachersOnLeave} on leave`, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Gross Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, sub: 'Total Received', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Expenses', value: `৳${stats.totalExpenses.toLocaleString()}`, sub: 'Burn to date', icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Due Fees', value: `৳${stats.totalDueFees.toLocaleString()}`, sub: 'Outstanding collection', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Due Salaries/Pay', value: `৳${stats.totalDueSalaries.toLocaleString()}`, sub: 'Unpaid liability', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const netProfit = stats.totalRevenue - stats.totalExpenses;
  const attData = [
    { name: 'Present', value: stats.attendanceToday.present, color: '#10b981' },
    { name: 'Absent', value: stats.attendanceToday.absent, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-black mb-2">Welcome Back, Admin!</h2>
          <p className="text-indigo-100 font-medium">Instantly access student performance, financial arrears, and attendance health from one central terminal.</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative z-10 w-full md:w-96">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Student Quick Lookup</p>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Enter Roll or Name..." 
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:bg-white focus:text-indigo-900 focus:outline-none transition-all shadow-xl font-bold"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
        <Wallet className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
            <div className={`w-10 h-10 rounded-2xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{card.value}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Financial Pulse</h3>
              <p className="text-sm text-slate-500 font-medium">Monthly collection trends (BDT)</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Net Balance</p>
              <p className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ৳{netProfit.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.feeTrends}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  formatter={(value: any) => [`৳${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">Today's Attendance</h3>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                    {attData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</p>
                <p className="text-lg font-black text-emerald-600">{stats.attendanceToday.present}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</p>
                <p className="text-lg font-black text-rose-600">{stats.attendanceToday.absent}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-lg font-black text-slate-900">{stats.attendanceToday.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
