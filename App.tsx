
import React, { useState } from 'react';
import { Layout, Users, UserCheck, CreditCard, ClipboardList, Home, FileSpreadsheet, Menu, X, Bell, Calendar, Banknote, HardHat, UserRoundCheck, Settings as SettingsIcon, LogOut, LogIn } from 'lucide-react';
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
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import ErrorBoundary from './components/ErrorBoundary';

type View = 'dashboard' | 'students' | 'teachers' | 'attendance' | 'fees' | 'results' | 'leaves' | 'salaries' | 'costs' | 'sheets' | 'student-details' | 'settings';

const AppContent: React.FC = () => {
  const { user, loading, login, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: UserRoundCheck },
    { id: 'students', label: 'Student Info', icon: Users },
    { id: 'teachers', label: 'Teacher Info', icon: UserCheck },
    { id: 'fees', label: 'Fees Collection', icon: CreditCard },
    { id: 'results', label: 'Result Input', icon: ClipboardList },
    { id: 'leaves', label: 'Leave Info', icon: Calendar },
    { id: 'salaries', label: 'Teacher Salary', icon: Banknote },
    { id: 'costs', label: 'Operation Cost', icon: HardHat },
    { id: 'settings', label: 'Global Settings', icon: SettingsIcon },
    { id: 'sheets', label: 'Google Sheet', icon: FileSpreadsheet },
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
      <aside className={`bg-[#1a1c2c] text-white transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'} h-full flex flex-col no-print`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Layout className="w-6 h-6" />
          </div>
          {isSidebarOpen && <h1 className="font-bold text-xl tracking-tight">EduManage</h1>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
                  currentView === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {user ? (
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 p-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">Logout</span>}
            </button>
          ) : (
            <button 
              onClick={login}
              className="w-full flex items-center gap-4 p-3 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <LogIn className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap text-sm">Login with Google</span>}
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 hover:bg-slate-800 rounded text-slate-400"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 no-print">
          <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
            {currentView === 'student-details' ? 'Student Profile' : currentView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4 ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.displayName || 'Guest User'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user ? 'Administrator' : 'Not Signed In'}</p>
              </div>
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'G'}&background=6366f1&color=fff`} 
                className="w-9 h-9 rounded-full border-2 border-slate-100" 
                alt="Profile" 
              />
            </div>
          </div>
        </header>

        <div className="p-8">
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
