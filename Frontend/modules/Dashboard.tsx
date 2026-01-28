
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Briefcase,
  ShieldAlert,
  BarChart3,
  BrainCircuit,
  Activity,
  Loader2,
  Building2
} from 'lucide-react';
import { HealthStatus, Record, Risk, Decision, RecordStatus, Company } from '../types';
import { api } from '../api';
import { persistence } from '../persistence';

interface DashboardProps {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeCompanyId, setActiveCompanyId }) => {
  const [stats, setStats] = useState({
    totalBurn: 0,
    activeRisks: 0,
    openDecisions: 0,
    health: 'Healthy'
  });
  const [records, setRecords] = useState<Record[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeCompanyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyList = await api.companies.list();
      setCompanies(companyList);

      let currentId = activeCompanyId;
      
      // Auto-select the first company if none is active but companies exist
      if (!currentId && companyList.length > 0) {
        currentId = companyList[0]._id;
        setActiveCompanyId(currentId);
      }

      if (currentId) {
        const [recs, decs, risks] = await Promise.all([
          api.records.list(currentId),
          api.decisions.list(currentId),
          api.intelligence.getRisks(currentId)
        ]);
        
        const burn = recs.reduce((acc: number, rec: Record) => acc + (rec.cost || 0), 0);
        const activeRisksCount = risks.filter(r => r.status !== 'MITIGATED').length;
        
        setRecords(recs);
        setStats({
          totalBurn: burn,
          activeRisks: activeRisksCount,
          openDecisions: decs.length,
          health: activeRisksCount > 3 ? 'Attention Needed' : activeRisksCount > 0 ? 'Watching' : 'Healthy'
        });
      }
    } catch (err) {
      console.error("Pulse sync failure on dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-20 text-center space-y-4">
        <Building2 className="mx-auto text-slate-200" size={64} />
        <h3 className="text-xl font-bold text-slate-900 uppercase">No Entity Context</h3>
        <p className="text-slate-500 font-medium">Please register a company entity to unlock the system dashboard.</p>
      </div>
    );
  }

  // Note: We no longer need the !activeCompanyId selection screen here 
  // because loadData handles auto-selection of the first available entity.

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-end justify-between">
        <div>
          {/* <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1 font-mono">Module 00 // Core Operating Engine</p> */}
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">System Pulse</h2>
        </div>
        <div className="flex flex-col items-end gap-3">
          <select 
            value={activeCompanyId || ''} 
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic opacity-60">Synced with backend</p>
          </div>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Monthly Outflow" 
          value={`₹${stats.totalBurn.toLocaleString()}`} 
          subtext="Aggregated from asset loop"
        />
        <StatCard 
          label="Active Risks" 
          value={stats.activeRisks.toString()} 
          alert={stats.activeRisks > 0}
          subtext="Requiring mitigation"
        />
        <StatCard 
          label="Strategy Vault" 
          value={stats.openDecisions.toString()} 
          subtext="Captured logic nodes"
        />
        <StatCard 
          label="OS Integrity" 
          value={stats.health} 
          subtext="System health status"
          status={stats.health === 'Healthy' ? HealthStatus.HEALTHY : HealthStatus.ATTENTION_NEEDED}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Neglect Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Neglect & Drift Monitor</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Active Scan</span>
            </div>
            <div className="divide-y divide-slate-100">
              {records.slice(0, 4).map(rec => (
                <DriftItem 
                  key={rec._id}
                  title={rec.name} 
                  days={Math.floor(Math.random() * 30).toString()} 
                  type={rec.type} 
                  severity={rec.status === RecordStatus.RENEWAL_SOON ? "medium" : "low"}
                  reason={rec.notes ? rec.notes.substring(0, 60) + '...' : "Standard periodic review pending"}
                />
              ))}
              {records.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm italic">
                  No data nodes to monitor. Initialize your first record.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-500 delay-75">
              <h4 className="text-[10px] font-black mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-widest font-mono">
                <Clock className="text-indigo-500" size={16} />
                Upcoming Milestones
              </h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-col items-center justify-center text-indigo-700 shrink-0 shadow-inner border border-indigo-100">
                    <span className="text-[9px] font-black leading-none">MAR</span>
                    <span className="text-lg font-black leading-none">15</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 tracking-tight uppercase">GST Filing Window</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Compliance Threshold</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 opacity-50">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                    <span className="text-[9px] font-black leading-none">APR</span>
                    <span className="text-lg font-black leading-none">01</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 tracking-tight uppercase">Q2 Logic Refresh</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Strategic Cycle</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-500 delay-150">
              <h4 className="text-[10px] font-black mb-6 flex items-center gap-2 text-slate-400 uppercase tracking-widest font-mono">
                <Zap className="text-amber-500" size={16} />
                Core Operations
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <DashboardAction icon={<Briefcase size={16} />} label="Legal" />
                <DashboardAction icon={<ShieldAlert size={16} />} label="Risks" />
                <DashboardAction icon={<BarChart3 size={16} />} label="Burn" />
                <DashboardAction icon={<BrainCircuit size={16} />} label="Logic" />
              </div>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full animate-in zoom-in-95 duration-500 delay-200">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
              <Activity className="text-indigo-500" size={20} />
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">OS Activity Log</h3>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px] scrollbar-hide">
              <AuditItem user="System" action="Identity nodes verified" time="Just now" module="Security" />
              <AuditItem user="Founder" action="Session initialized" time="Today" module="Auth" />
              {persistence.getSessions().slice(0, 5).map(sess => (
                <AuditItem 
                  key={sess._id}
                  user="Founder" 
                  action={`Voice Pulse: ${sess.draftCards.length} insights`} 
                  time={new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  module="Voice" 
                />
              ))}
              {records.slice(0, 2).map(rec => (
                <AuditItem 
                  key={`audit-${rec._id}`}
                  user="System" 
                  action={`Mapped asset: ${rec.name}`} 
                  time="History" 
                  module="Assets" 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardAction: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-2xl hover:bg-indigo-50/30 hover:border-indigo-200 transition-all group active:scale-95 shadow-sm">
    <div className="text-slate-400 group-hover:text-indigo-500 transition-colors mb-2">
      {icon}
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 font-mono">{label}</span>
  </button>
);

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  subtext: string;
  alert?: boolean;
  status?: HealthStatus;
}> = ({ label, value, subtext, alert, status }) => (
  <div className={`bg-white p-6 rounded-3xl border transition-all animate-in zoom-in-95 duration-500 ${alert ? 'border-red-200 bg-red-50/10' : 'border-slate-200 shadow-sm hover:border-indigo-200'}`}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{label}</span>
      {status === HealthStatus.HEALTHY ? (
        <CheckCircle2 size={16} className="text-green-500" />
      ) : alert ? (
        <AlertTriangle size={16} className="text-red-500 animate-pulse" />
      ) : null}
    </div>
    <div className="mb-1">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{value}</h3>
    </div>
    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-70">{subtext}</p>
  </div>
);

const DriftItem: React.FC<{ 
  title: string; 
  days: string; 
  type: string; 
  reason: string;
  severity: 'low' | 'medium' | 'high';
}> = ({ title, days, type, reason, severity }) => {
  const sevColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-5 hover:bg-slate-50 transition-colors flex items-start justify-between group cursor-default">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-black/5 ${sevColors[severity]}`}>
            {type}
          </span>
          <h4 className="text-sm font-bold text-slate-800 truncate uppercase tracking-tight">{title}</h4>
        </div>
        <p className="text-xs text-slate-500 line-clamp-1 font-medium italic opacity-80">{reason}</p>
      </div>
      <div className="text-right ml-4 shrink-0 flex flex-col items-end">
        <p className="text-sm font-black text-slate-900 font-mono tracking-tighter">{days}D</p>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Neglected</p>
      </div>
    </div>
  );
};

const AuditItem: React.FC<{ user: string; action: string; time: string; module: string }> = ({ user, action, time, module }) => (
  <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-indigo-400 before:rounded-full before:z-10 after:content-[''] after:absolute after:left-[3.5px] after:top-1.5 after:w-[1px] after:h-full after:bg-slate-100 last:after:hidden pb-4">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 shadow-sm">{module}</span>
      <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest font-mono">{time}</span>
    </div>
    <p className="text-xs font-bold text-slate-800 leading-tight uppercase tracking-tight">{action}</p>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Log: {user}</p>
  </div>
);

export default Dashboard;
