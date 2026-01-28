
import React, { useState, useEffect, useRef } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  Navigate 
} from 'react-router-dom';
import { 
  LayoutGrid, 
  Briefcase, 
  FileText, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  Search, 
  Plus, 
  BrainCircuit,
  Menu,
  X,
  Bell,
  Cpu,
  ChevronUp,
  Mic,
  LogOut,
  User as UserIcon,
  Settings,
  Loader2
} from 'lucide-react';

import Dashboard from './modules/Dashboard';
import CompanyModule from './modules/CompanyModule';
import RecordsModule from './modules/RecordsModule';
import DecisionsModule from './modules/DecisionsModule';
import IntelligenceModule from './modules/IntelligenceModule';
import PeopleModule from './modules/PeopleModule';
import FinanceModule from './modules/FinanceModule';
import QuickCapture from './components/QuickCapture';
import GlobalSearch from './components/GlobalSearch';
import LiveCapture from './components/LiveCapture';
import AuthScreen from './modules/AuthScreen';
import { api } from './api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isLiveCaptureOpen, setIsLiveCaptureOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  
  // Shared Context State
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  
  // Dynamic User State
  const [founderName, setFounderName] = useState('Administrator');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Fixed: Added 'const' to declare userMenuRef properly
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const user = await api.auth.getMe();
        setFounderName(user.fullName);
        setIsAuthenticated(true);
      } catch (err) {
        api.logout();
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Handle clicking outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.logout();
    localStorage.clear();
    sessionStorage.clear();
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-12 h-12 text-indigo-500 animate-pulse" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Checking OS Integrity</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
        <aside 
          className={`bg-slate-900 text-slate-300 w-72 flex-shrink-0 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-72'
          } absolute md:relative z-40 h-full shadow-2xl`}
        >
          <div className="p-8 border-b border-slate-800 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-indigo-500" />
            <h1 className="font-black text-white tracking-tighter text-xl uppercase">
              Founder OS
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 mt-2">
            <SidebarLink to="/" icon={<LayoutGrid size={18} />} label="System Pulse" />
            <SidebarLink to="/company" icon={<Briefcase size={18} />} label="Company & Legal" />
            <SidebarLink to="/records" icon={<FileText size={18} />} label="Records & Assets" />
            <SidebarLink to="/decisions" icon={<BrainCircuit size={18} />} label="Thinking Vault" />
            <SidebarLink to="/intelligence" icon={<ShieldAlert size={18} />} label="Intelligence" />
            <SidebarLink to="/people" icon={<Users size={18} />} label="People and Roles" />
            <SidebarLink to="/finance" icon={<BarChart3 size={18} />} label="Finance & Burn" />
            
            <div className="pt-8 pb-2 px-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              Capture Tools
            </div>
            <button 
              onClick={() => setIsLiveCaptureOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-900/40 transition-colors text-indigo-400 font-bold group"
            >
              <div className="p-1.5 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20">
                <Mic size={18} />
              </div>
              <span>Live Voice Capture</span>
            </button>
            <button 
              onClick={() => setIsQuickCaptureOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 font-medium"
            >
              <Plus size={18} />
              <span>Text Capture</span>
            </button>
          </nav>

          <div className="p-4 border-t border-slate-800 relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-50">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Administrator</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{founderName}</p>
                </div>
                <div className="p-2 space-y-0.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left group">
                    <UserIcon size={16} className="text-slate-400 group-hover:text-indigo-500" />
                    <span>View Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left group">
                    <Settings size={16} className="text-slate-400 group-hover:text-indigo-500" />
                    <span>OS Settings</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left group"
                  >
                    <LogOut size={16} className="text-red-400 group-hover:text-red-600" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all hover:bg-slate-800 text-left group ${isUserMenuOpen ? 'bg-slate-800 ring-1 ring-slate-700' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0 shadow-lg">
                {founderName[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{founderName}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest opacity-60">Admin Root</p>
              </div>
              <ChevronUp size={16} className={`text-slate-600 group-hover:text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4 text-slate-600">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md">
                <Menu size={20} />
              </button>
              <button onClick={() => setIsGlobalSearchOpen(true)} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:border-slate-300 transition-all w-64 md:w-96 text-left shadow-sm">
                <Search size={18} />
                <span className="text-sm">Search OS (Ctrl+K)</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-green-100 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-full relative">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <Routes>
              <Route path="/" element={<Dashboard activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />} />
              <Route path="/company" element={<CompanyModule activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />} />
              <Route path="/records" element={<RecordsModule activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId}/>} />
              <Route path="/decisions" element={<DecisionsModule activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />} />
              <Route path="/intelligence" element={<IntelligenceModule activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />} />
              <Route path="/people" element={<PeopleModule activeCompanyId={activeCompanyId} />} />
              <Route path="/finance" element={<FinanceModule activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        <QuickCapture isOpen={isQuickCaptureOpen} onClose={() => setIsQuickCaptureOpen(false)} />
        <LiveCapture isOpen={isLiveCaptureOpen} onClose={() => setIsLiveCaptureOpen(false)} />
        <GlobalSearch isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} />
      </div>
    </Router>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
          : 'hover:bg-slate-800 hover:text-white text-slate-400 font-medium'
      }`}
    >
      {icon}
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </Link>
  );
};

export default App;
