
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  BrainCircuit, 
  AlertTriangle,
  Wallet,
  Clock,
  Layers,
  Settings2,
  Loader2,
  X,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { Expense, ExpenseCategory, FinanceData, Decision, Company } from '../types';
import { api } from '../api';
import DeleteModal from '../components/DeleteModal';

interface FinanceModuleProps {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

const FinanceModule: React.FC<FinanceModuleProps> = ({ activeCompanyId, setActiveCompanyId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingBalance, setIsEditingBalance] = useState(false);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formExpense, setFormExpense] = useState<Partial<Expense>>({
    type: 'RECURRING',
    category: ExpenseCategory.TOOL,
    billingCycle: 'MONTHLY',
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: ''
  });

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const companyList = await api.companies.list();
        setCompanies(companyList);
        if (companyList.length > 0 && !activeCompanyId) {
          setActiveCompanyId(companyList[0]._id);
        } else if (companyList.length === 0) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load initial context.");
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (activeCompanyId) {
      loadData(activeCompanyId);
    }
  }, [activeCompanyId]);

  const loadData = async (companyId: string) => {
    setIsLoading(true);
    try {
      const [expensesData, financeInfo] = await Promise.all([
        api.finance.getExpenses(companyId),
        api.finance.getData(companyId),
        // api.decisions.list()
      ]);
      setExpenses(expensesData);
      setFinanceData(financeInfo);
      // setDecisions(decisionsData);
    } catch (err) {
      console.error("Finance pulse synchronization failed.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * CORE CALCULATIONS: BURN & RUNWAY
   */
  const burnMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const recurringMonthly = expenses.reduce((acc, exp) => {
      if (exp.type === 'RECURRING') {
        return acc + (exp.billingCycle === 'ANNUAL' ? exp.amount / 12 : exp.amount);
      }
      return acc;
    }, 0);

    const oneTimeThisMonth = expenses.reduce((acc, exp) => {
      if (exp.type === 'ONE_TIME' && exp.startDate) {
        const d = new Date(exp.startDate);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          return acc + exp.amount;
        }
      }
      return acc;
    }, 0);

    return { recurringMonthly, oneTimeThisMonth };
  }, [expenses]);

  const activeScenario = useMemo(() => {
    return financeData?.scenarios.find(s => s.isActive) || { name: 'Standard', burnMultiplier: 1 };
  }, [financeData]);

  const currentBaselineBurn = burnMetrics.recurringMonthly * activeScenario.burnMultiplier;
  const actualBurnThisMonth = currentBaselineBurn + burnMetrics.oneTimeThisMonth;

  const runwayMonths = useMemo(() => {
    if (!financeData || currentBaselineBurn <= 0) return 999;
    return financeData.cashBalance / currentBaselineBurn;
  }, [financeData, currentBaselineBurn]);

  const handleSaveExpense = async () => {
    if (!activeCompanyId) return;
    if (!formExpense.name || (formExpense.amount || 0) <= 0) {
      alert("Label and valid Amount are mandatory.");
      return;
    }

    try {
      const payload = {
        ...formExpense,
        _id: Math.random().toString(36).substr(2, 9),
        updated_at: new Date().toISOString()
      };

      await api.finance.createExpense(activeCompanyId, payload);
      setIsAddingExpense(false);
      setFormExpense({ 
        type: 'RECURRING', 
        category: ExpenseCategory.TOOL, 
        billingCycle: 'MONTHLY', 
        amount: 0, 
        startDate: new Date().toISOString().split('T')[0], 
        notes: '' 
      });
      await loadData(activeCompanyId);
    } catch (err) {
      alert("Persistence failure.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !activeCompanyId) return;
    try {
      await api.finance.deleteExpense(activeCompanyId, deleteTargetId);
      setDeleteTargetId(null);
      await loadData(activeCompanyId);
    } catch (err) {
      alert("Deletion failure.");
    }
  };

  const updateCashBalance = async (val: number) => {
    if (!activeCompanyId) return;
    try {
      await api.finance.updateData(activeCompanyId, { cashBalance: val });
      setIsEditingBalance(false);
      await loadData(activeCompanyId);
    } catch (err) {
      alert("Balance update failure.");
    }
  };

  const toggleScenario = async (idx: number) => {
    if (!financeData || !activeCompanyId) return;
    try {
      const updatedScenarios = financeData.scenarios.map((s, i) => ({ ...s, isActive: i === idx }));
      await api.finance.updateData(activeCompanyId, { scenarios: updatedScenarios });
      await loadData(activeCompanyId);
    } catch (err) {
      alert("Scenario switch failure.");
    }
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
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
        <h3 className="text-xl font-bold text-slate-900">No Entity Context</h3>
        <p className="text-slate-500 font-medium">Please register a company entity to unlock financial modeling.</p>
      </div>
    );
  }

  if (!financeData) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1 font-mono">Module 07 // Capital Control</p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter ">Finance & Burn</h2>
        </div>
        <div className="flex items-center gap-3">
           <select 
              value={activeCompanyId || ''} 
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none shadow-sm uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
           >
              {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash Balance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
              <Wallet size={24} />
            </div>
            {isEditingBalance ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl p-2 text-sm outline-none font-black text-indigo-600 shadow-inner"
                  defaultValue={financeData.cashBalance}
                  onBlur={(e) => updateCashBalance(parseFloat(e.target.value) || 0)}
                  autoFocus
                />
              </div>
            ) : (
              <button onClick={() => setIsEditingBalance(true)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><Edit3 size={16} /></button>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Total Liquidity</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(financeData.cashBalance)}</h3>
          </div>
        </div>

        {/* Monthly Burn */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shadow-inner group-hover:scale-110 transition-transform">
              <TrendingDown size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-lg uppercase tracking-widest font-mono">Baseline</span>
              {burnMetrics.oneTimeThisMonth > 0 && (
                <span className="text-[9px] font-bold text-amber-500 mt-1">+{formatCurrency(burnMetrics.oneTimeThisMonth)} one-time</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Operational Burn</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(currentBaselineBurn)}</h3>
          </div>
        </div>

        {/* Runway Pulse */}
        <div className={`rounded-3xl border p-8 shadow-xl flex flex-col justify-between transition-all duration-700 ${
          runwayMonths < 6 ? 'bg-red-600 text-white border-red-500 shadow-red-200' : 
          runwayMonths < 12 ? 'bg-amber-500 text-white border-amber-400 shadow-amber-100' :
          'bg-slate-900 text-white border-slate-800 shadow-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-2xl ${runwayMonths < 6 ? 'bg-red-500 text-white shadow-inner' : 'bg-slate-800 text-indigo-400 shadow-inner'}`}>
              <Clock size={24} />
            </div>
            {runwayMonths < 12 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full animate-pulse border border-white/30 shadow-sm">
                <AlertTriangle size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{runwayMonths < 6 ? 'Critical' : 'Warning'}</span>
              </div>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1 font-mono">Runway Horizon</p>
            <h3 className="text-4xl font-black tracking-tighter">
              {runwayMonths >= 999 ? '∞' : runwayMonths.toFixed(1)} 
              <span className="text-lg font-bold opacity-60 ml-2">Months</span>
            </h3>
          </div>
        </div>
      </div>

      <DeleteModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Financial Entry"
        message="Permanently purge this expense from the burn register? This will alter runway projections and monthly outflows."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ledger Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-indigo-600" size={20} />
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-sm">Survival Outflows</h3>
              </div>
              <button 
                onClick={() => setIsAddingExpense(true)}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Plus size={16} /> New Entry
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Entity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Type / Category</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right font-mono">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.map(exp => (
                    <tr key={exp._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 tracking-tight">{exp.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{exp.paymentMethod || 'Generic'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 uppercase tracking-widest w-fit">{exp.type}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{exp.category} • {exp.billingCycle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {exp.decisionId && (
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm" title="Linked to Decision Logic">
                              <BrainCircuit size={14} />
                            </div>
                          )}
                          <button onClick={() => setDeleteTargetId(exp._id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic text-sm font-medium">No active burn nodes. Register SaaS or Payroll to track runway.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Scenarios & Optimization */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="text-indigo-600" size={20} />
              <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase italic">Forecasting</h4>
            </div>
            <div className="space-y-3">
              {financeData.scenarios.map((s, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleScenario(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98] ${s.isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}
                >
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${s.isActive ? 'text-white' : 'text-slate-900'}`}>{s.name}</p>
                    <p className={`text-[10px] font-bold ${s.isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{s.burnMultiplier}x Burn Intensity</p>
                  </div>
                  {s.isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-sm shadow-white" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            <h4 className="text-lg font-black mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
              <Settings2 size={20} className="text-indigo-400" />
              Optimization
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className={`p-1.5 rounded-lg mt-0.5 ${runwayMonths > 12 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  <ArrowUpRight size={14} />
                </div>
                <p className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-tight">
                   Horizon Status: <span className={runwayMonths > 12 ? 'text-green-400' : 'text-amber-400'}>
                     {runwayMonths > 12 ? 'Capital Expansion Safe' : 'Conserve Cash Flow'}
                   </span>
                </p>
              </li>
              <li className="flex items-start gap-4 opacity-70">
                <div className="p-1.5 bg-slate-800 text-slate-500 rounded-lg mt-0.5"><Settings2 size={14} /></div>
                <p className="text-[11px] text-slate-400 font-bold leading-tight uppercase tracking-tight">System detected {expenses.filter(e => e.category === ExpenseCategory.TOOL).length} SaaS nodes for ROI review.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide-over Form */}
      {isAddingExpense && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingExpense(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic">New Outflow</h3>
                  <p className="text-xs text-slate-500 font-bold">Record survival burn or capital equipment.</p>
                </div>
              </div>
              <button onClick={() => setIsAddingExpense(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} className="text-slate-400" /></button>
            </div>

            <div className="p-8 space-y-10 flex-1">
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Financial Identification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest">Description Label *</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold shadow-sm" value={formExpense.name || ''} onChange={(e) => setFormExpense({...formExpense, name: e.target.value})} placeholder="e.g. AWS Cloud Platform" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest">Amount (₹ INR) *</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-black shadow-sm" value={formExpense.amount || ''} onChange={(e) => setFormExpense({...formExpense, amount: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest">Category</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black outline-none shadow-sm uppercase tracking-widest" value={formExpense.category} onChange={(e) => setFormExpense({...formExpense, category: e.target.value as ExpenseCategory})}>
                      {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Billing Logic</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest">Frequency</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black outline-none shadow-sm uppercase tracking-widest" value={formExpense.billingCycle} onChange={(e) => setFormExpense({...formExpense, billingCycle: e.target.value as any})}>
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUAL">Annual</option>
                      <option value="ONE_TIME">One-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest">Start Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-mono" value={formExpense.startDate} onChange={(e) => setFormExpense({...formExpense, startDate: e.target.value})} />
                  </div>
                </div>
              </section>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3"><button onClick={() => setIsAddingExpense(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button><button onClick={handleSaveExpense} className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"><Save size={18} /> Persist Outflow</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceModule;
