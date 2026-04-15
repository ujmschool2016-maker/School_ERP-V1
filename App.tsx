
import React, { useState } from 'react';
import { Layout, Users, UserCheck, CreditCard, ClipboardList, Home, FileSpreadsheet, Menu, X, Bell, Calendar, Banknote, HardHat, UserRoundCheck, Settings as SettingsIcon, LogOut, LogIn, FileText } from 'lucide-react';
import DashboardView from './components/DashboardView';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import FeesView from './components/FeesView';
import ResultView from './components/ResultView';
import LeaveView from './components/LeaveView';
import SalaryView from './components/SalaryView';
import OperationCostView from './components/OperationCostView';
import AttendanceView from './components/AttendanceView';
import StudentDetailsView from './components/StudentDetailsView';
import SettingsView from './components/SettingsView';
import ReportView from './components/ReportView';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'testing' | 'online' | 'offline' | 'error'>('testing');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const check = async () => {
      try {
        // Try to fetch a non-existent doc just to test connection
        await getDocFromServer(doc(db, '_connection_test_', 'ping'));
        setStatus('online');
      } catch (err: any) {
        console.warn('Connection check failed:', err.message);
        if (err.message.includes('offline')) {
          setStatus('offline');
        } else if (err.message.includes('permission-denied')) {
          // Permission denied means we ARE connected but rules blocked us
          setStatus('online');
        } else {
          setStatus('error');
          setErrorMsg(err.message);
        }
      }
    };
    check();
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
      <div className={`w-2 h-2 rounded-full ${
        status === 'online' ? 'bg-emerald-500 animate-pulse' : 
        status === 'offline' ? 'bg-amber-500' : 
        status === 'error' ? 'bg-rose-500' : 'bg-slate-300'
      }`} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {status === 'testing' ? 'Connecting...' : status === 'online' ? 'Firebase Live' : status === 'offline' ? 'Offline' : 'Config Error'}
      </span>
      {status === 'error' && (
        <button onClick={() => alert(`Firebase Error: ${errorMsg}`)} className="text-[10px] text-rose-500 underline font-bold">Details</button>
      )}
    </div>
  );
};

type View = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'results' | 'leaves' | 'salaries' | 'costs' | 'sheets' | 'student-details' | 'settings' | 'reports';

const AppContent: React.FC = () => {
  const { user, loading, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-500' },
    { id: 'attendance', label: 'Attendance', icon: UserRoundCheck, color: 'text-emerald-500' },
    { id: 'students', label: 'Student Info', icon: Users, color: 'text-blue-500' },
    { id: 'teachers', label: 'Teacher Info', icon: UserCheck, color: 'text-violet-500' },
    { id: 'fees', label: 'Fees Collection', icon: CreditCard, color: 'text-amber-500' },
    { id: 'results', label: 'Result Input', icon: ClipboardList, color: 'text-rose-500' },
    { id: 'reports', label: 'Reports', icon: FileText, color: 'text-cyan-500' },
    { id: 'leaves', label: 'Leave Info', icon: Calendar, color: 'text-orange-500' },
    { id: 'salaries', label: 'Teacher Salary', icon: Banknote, color: 'text-green-500' },
    { id: 'costs', label: 'Operation Cost', icon: HardHat, color: 'text-slate-500' },
    { id: 'settings', label: 'Global Settings', icon: SettingsIcon, color: 'text-slate-400' },
    { id: 'sheets', label: 'Google Sheet', icon: FileSpreadsheet, color: 'text-emerald-600' },
  ];

  const handleViewStudent = (roll: string) => {
    setSelectedStudentRoll(roll);
    setCurrentView('student-details');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onSearchStudent={handleViewStudent} />;
      case 'students': return <StudentView onViewStudent={handleViewStudent} />;
      case 'student-details': 
        return <StudentDetailsView roll={selectedStudentRoll || ''} onBack={() => setCurrentView('students')} />;
      case 'teachers': return <TeacherView />;
      case 'attendance': return <AttendanceView />;
      case 'fees': return <FeesView />;
      case 'results': return <ResultView />;
      case 'leaves': return <LeaveView />;
      case 'salaries': return <SalaryView />;
      case 'costs': return <OperationCostView />;
      case 'settings': return <SettingsView />;
      case 'reports': return <ReportView />;
      case 'sheets': return (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
           <FileSpreadsheet className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold mb-2">Google Sheets Database</h2>
           <p className="text-slate-600 mb-6">Connect your Google Sheets backend to view raw data.</p>
           <div className="bg-slate-100 p-4 rounded text-left font-mono text-sm inline-block">
             <p>// Extended Google Apps Script structure required:</p>
             <p>- Sheet "Attendance": EntityId, Name, Type, Date, Status, Time, Class</p>
             <p>- Sheet "Leaves": ApplicantId, Name, Type, Category, Start, End, Reason, Status</p>
             <p>- Sheet "Salaries": TeacherId, Month, Base, Bonus, Deductions, Total, Date, Status</p>
             <p>- Sheet "Costs": Category, Description, Amount, Date</p>
           </div>
        </div>
      );
      default: return <DashboardView onSearchStudent={handleViewStudent} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative z-50 bg-[#1a1c2c] text-white transition-all duration-300 flex-shrink-0 h-full flex flex-col no-print
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Layout className="w-6 h-6" />
            </div>
            {isSidebarOpen && <h1 className="font-bold text-xl tracking-tight">EduManage</h1>}
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : item.color}`} />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-20 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {user ? (
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">Logout</span>}
            </button>
          ) : (
            <button 
              onClick={login}
              className="w-full flex items-center gap-4 p-3 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">Login with Google</span>}
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex w-full items-center justify-center p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-slate-800 capitalize tracking-tight truncate max-w-[150px] sm:max-w-none">
              {currentView === 'student-details' ? 'Student Profile' : currentView.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ConnectionStatus />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 border-l pl-2 sm:pl-4 ml-1 sm:ml-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{user?.displayName || 'Guest User'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user ? 'Administrator' : 'Not Signed In'}</p>
              </div>
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'G'}&background=6366f1&color=fff`} 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-100" 
                alt="Profile" 
              />
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
};

export default App;
