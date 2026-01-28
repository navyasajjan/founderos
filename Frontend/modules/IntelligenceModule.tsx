
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lightbulb, 
  Zap, 
  HelpCircle, 
  AlertCircle,
  Plus,
  X,
  Save,
  Trash2,
  Edit3,
  TrendingUp,
  User,
  Calendar,
  Layers,
  CheckCircle2,
  Loader2,
  Building2
} from 'lucide-react';
import { Risk, Assumption, Company } from '../types';
import { api } from '../api';
import DeleteModal from '../components/DeleteModal';

interface IntelligenceModuleProps {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

const IntelligenceModule: React.FC<IntelligenceModuleProps> = ({ activeCompanyId, setActiveCompanyId }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ASSUMPTION' | 'RISK'>('ASSUMPTION');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formAssumption, setFormAssumption] = useState<Partial<Assumption>>({
    statement: '',
    area: 'Product',
    confidence: 50,
    evidence: '',
    validationDate: ''
  });

  const [formRisk, setFormRisk] = useState<Partial<Risk>>({
    type: 'Operational',
    probability: 3,
    impact: 3,
    mitigationPlan: '',
    owner: 'Founder',
    status: 'OPEN'
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        const list = await api.companies.list();
        setCompanies(list);
        if (list.length > 0 && !activeCompanyId) {
          setActiveCompanyId(list[0]._id);
        }
      } catch (e) {}
    };
    initialize();
  }, []);

  useEffect(() => {
    if (activeCompanyId) {
      loadData(activeCompanyId);
    } else {
      setIsLoading(false);
    }
  }, [activeCompanyId]);

  const loadData = async (companyId: string) => {
    setIsLoading(true);
    try {
      const [loadedRisks, loadedAssumptions] = await Promise.all([
        api.intelligence.getRisks(companyId),
        api.intelligence.getAssumptions(companyId)
      ]);
      setRisks(loadedRisks);
      setAssumptions(loadedAssumptions);
    } catch (err) {
      console.error("Failed to load intelligence data.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAdd = (type: 'ASSUMPTION' | 'RISK') => {
    setEditingId(null);
    setActiveTab(type);
    if (type === 'ASSUMPTION') {
      setFormAssumption({ statement: '', area: 'Product', confidence: 50, evidence: '', validationDate: '' });
    } else {
      setFormRisk({ type: 'Operational', probability: 3, impact: 3, mitigationPlan: '', owner: 'Founder', status: 'OPEN' });
    }
    setIsAdding(true);
  };

  const openEditAssumption = (a: Assumption) => {
    setEditingId(a._id);
    setActiveTab('ASSUMPTION');
    setFormAssumption({ ...a });
    setIsAdding(true);
  };

  const openEditRisk = (r: Risk) => {
    setEditingId(r._id);
    setActiveTab('RISK');
    setFormRisk({ ...r });
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!activeCompanyId) return;
    try {
      if (activeTab === 'ASSUMPTION') {
        if (!formAssumption.statement) return alert("Statement is required.");
        // FIX: Ensure confidence 0 is allowed (0 is falsy, so we check specifically for undefined)
        const payload: Assumption & { companyId: string } = {
          ...(editingId && { _id: editingId }),
          companyId: activeCompanyId,
          statement: formAssumption.statement || '',
          area: formAssumption.area || 'Product',
          confidence: formAssumption.confidence !== undefined ? formAssumption.confidence : 50,
          evidence: formAssumption.evidence || '',
          validationDate: formAssumption.validationDate,
          updated_at: new Date().toISOString()
        };
        await api.intelligence.saveAssumption(payload);
      } else {
        if (!formRisk.mitigationPlan) return alert("Mitigation plan/title is required.");
        const payload: Risk & { companyId: string } = {
            ...(editingId && { _id: editingId }),
          companyId: activeCompanyId,
          type: formRisk.type || 'Operational',
          probability: formRisk.probability !== undefined ? formRisk.probability : 3,
          impact: formRisk.impact !== undefined ? formRisk.impact : 3,
          mitigationPlan: formRisk.mitigationPlan || '',
          owner: formRisk.owner || 'Founder',
          status: formRisk.status || 'OPEN',
          updated_at: new Date().toISOString()
        };
        await api.intelligence.saveRisk(payload);
      }
      setIsAdding(false);
      loadData(activeCompanyId);
    } catch (err) {
      alert("Failed to save intelligence entry.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !activeCompanyId) return;
    try {
      if (activeTab === 'ASSUMPTION') {
        await api.intelligence.deleteAssumption(deleteTargetId, activeCompanyId);
      } else {
        await api.intelligence.deleteRisk(deleteTargetId, activeCompanyId);
      }
      loadData(activeCompanyId);
      setIsAdding(false);
      setDeleteTargetId(null);
    } catch (err) {
      alert("Failed to delete intelligence entry.");
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
        <p className="text-slate-500 font-medium">Please register a company entity to unlock the intelligence module.</p>
      </div>
    );
  }

  if (!activeCompanyId) {
    return (
      <div className="max-w-7xl mx-auto p-20 text-center space-y-4">
        <Building2 className="mx-auto text-slate-200" size={64} />
        <h3 className="text-xl font-bold text-slate-900 uppercase">No Entity Selected</h3>
        <p className="text-slate-500 font-medium">Please select a company to unlock the intelligence module.</p>
        <select 
          value={activeCompanyId || ''} 
          onChange={(e) => setActiveCompanyId(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>Select Entity...</option>
          {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Intelligence & Health</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage assumptions, fragility, and systemic risks for this entity.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={activeCompanyId || ''} 
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
          >
            {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button 
            onClick={() => openAdd('ASSUMPTION')}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>
      </div>

      <DeleteModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${activeTab === 'ASSUMPTION' ? 'Assumption' : 'Risk'}`}
        message={`Are you sure you want to remove this ${activeTab.toLowerCase()} entry? This will permanently erase the associated mitigation plans and evidence data.`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="text-amber-500" size={24} />
                <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Assumption Tracker</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{assumptions.length} Active Hypotheses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assumptions.map((a, idx) => (
                <AssumptionCard key={a._id} data={a} onClick={() => openEditAssumption(a)} delay={idx * 100} />
              ))}
              {assumptions.length === 0 && (
                <div className="col-span-2 py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 italic text-sm">
                  No assumptions tracked. Log your product or market hypotheses.
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={24} />
                <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Risk Register</h3>
              </div>
              <button 
                onClick={() => openAdd('RISK')}
                className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline font-mono"
              >
                Log New Risk
              </button>
            </div>
            <div className="space-y-2 divide-y divide-slate-50">
              {risks.map((r, idx) => (
                <RiskItem key={r._id} data={r} onClick={() => openEditRisk(r)} delay={idx * 50} />
              ))}
              {risks.length === 0 && (
                <div className="py-6 text-center text-slate-400 italic text-sm">
                  System currently resilient. No risks logged.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group animate-in zoom-in-95 duration-500 delay-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Zap size={20} />
              <h4 className="text-lg font-bold text-white uppercase tracking-tight italic">Fragility Monitor</h4>
            </div>
            <ul className="space-y-4">
              <SpofItem label="Credentials Access" status={risks.some(r => r.type === 'SPOF') ? 'Critical' : 'Secured'} color={risks.some(r => r.type === 'SPOF') ? 'text-red-400' : 'text-green-400'} />
              <SpofItem label="SOP Documentation" status={assumptions.length < 3 ? 'Fragile' : 'Resilient'} color={assumptions.length < 3 ? 'text-amber-400' : 'text-green-400'} />
              <SpofItem label="DB Maintenance" status="Resilient" color="text-green-400" />
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm animate-in zoom-in-95 duration-500 delay-400">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="text-slate-400" size={20} />
              <h4 className="text-lg font-bold text-slate-800 italic tracking-tight uppercase">Strategic Continuity</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 italic border-l-2 border-slate-100 pl-4 font-medium">Institutional knowledge only you possess.</p>
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700 leading-tight uppercase tracking-tight">• Investor relationship dynamics</p>
              <p className="text-sm font-bold text-slate-700 leading-tight uppercase tracking-tight">• Discount tier limitations</p>
              <p className="text-sm font-bold text-slate-700 leading-tight uppercase tracking-tight">• Critical vendor side-agreements</p>
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg ${activeTab === 'ASSUMPTION' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
                  {activeTab === 'ASSUMPTION' ? <Lightbulb size={20} /> : <ShieldAlert size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">{editingId ? 'Edit Entry' : 'New Intelligence Entry'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Capture systemic knowledge or risks.</p>
                </div>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1">
              {!editingId && (
                <div className="p-8 pb-0">
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                      onClick={() => setActiveTab('ASSUMPTION')}
                      className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest ${activeTab === 'ASSUMPTION' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Assumption
                    </button>
                    <button 
                      onClick={() => setActiveTab('RISK')}
                      className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest ${activeTab === 'RISK' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Risk Item
                    </button>
                  </div>
                </div>
              )}

              <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
                {activeTab === 'ASSUMPTION' ? (
                  <>
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Hypothesis Definition</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Statement *</label>
                        <textarea 
                          rows={3}
                          placeholder="e.g. Customers prefer self-serve over white-glove onboarding."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none transition-all font-bold shadow-sm"
                          value={formAssumption.statement}
                          onChange={(e) => setFormAssumption({...formAssumption, statement: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Focus Area</label>
                          <input 
                            type="text" 
                            placeholder="Product, GTM..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none shadow-sm uppercase font-bold"
                            value={formAssumption.area}
                            onChange={(e) => setFormAssumption({...formAssumption, area: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Confidence ({formAssumption.confidence}%)</label>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            className="w-full accent-amber-500 h-8 mt-1"
                            value={formAssumption.confidence}
                            onChange={(e) => setFormAssumption({...formAssumption, confidence: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4 pb-10">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Evidence Layer</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Evidence Base</label>
                        <textarea 
                          rows={3}
                          placeholder="What data supports this assumption currently?"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none italic font-medium shadow-sm"
                          value={formAssumption.evidence}
                          onChange={(e) => setFormAssumption({...formAssumption, evidence: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-widest ml-1"><Calendar size={14} /> Validation Due</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none shadow-inner font-mono"
                          value={formAssumption.validationDate}
                          onChange={(e) => setFormAssumption({...formAssumption, validationDate: e.target.value})}
                        />
                      </div>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Risk Definition</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Description *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Single Point of Failure: Server Credentials"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold shadow-sm"
                          value={formRisk.mitigationPlan}
                          onChange={(e) => setFormRisk({...formRisk, mitigationPlan: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Risk Type</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none shadow-sm uppercase tracking-widest"
                            value={formRisk.type}
                            onChange={(e) => setFormRisk({...formRisk, type: e.target.value})}
                          >
                            <option value="Operational">Operational</option>
                            <option value="SPOF">SPOF</option>
                            <option value="Financial">Financial</option>
                            <option value="Legal">Legal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Status</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none shadow-sm uppercase tracking-widest"
                            value={formRisk.status}
                            onChange={(e) => setFormRisk({...formRisk, status: e.target.value})}
                          >
                            <option value="OPEN">Active</option>
                            <option value="MITIGATED">Mitigated</option>
                            <option value="WATCH">Watching</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 pb-10">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Scoring Matrix</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-widest ml-1"><TrendingUp size={14} /> Probability (1-5)</label>
                          <input 
                            type="number" min="1" max="5" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none shadow-inner font-mono"
                            value={formRisk.probability}
                            onChange={(e) => setFormRisk({...formRisk, probability: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-widest ml-1"><ShieldAlert size={14} /> Impact (1-5)</label>
                          <input 
                            type="number" min="1" max="5" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none shadow-inner font-mono"
                            value={formRisk.impact}
                            onChange={(e) => setFormRisk({...formRisk, impact: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between shadow-inner">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest font-mono">Severity Score</span>
                        <span className="text-3xl font-black text-red-700">{(formRisk.probability || 0) * (formRisk.impact || 0)}/25</span>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              {editingId && (
                <button 
                  onClick={() => setDeleteTargetId(editingId)}
                  className="p-4 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  title="Delete Entry"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className={`flex-[2] py-4 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'ASSUMPTION' ? 'bg-amber-600 shadow-amber-500/20 hover:bg-amber-700' : 'bg-red-600 shadow-red-500/20 hover:bg-red-700'}`}
              >
                <Save size={18} />
                {editingId ? 'Persist Logic Updates' : 'Commit Intelligence'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AssumptionCard: React.FC<{ data: Assumption; onClick: () => void; delay: number }> = ({ data, onClick, delay }) => (
  <div 
    onClick={onClick}
    className="p-6 rounded-3xl border border-slate-200 bg-white hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer group animate-in zoom-in-95 duration-500"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Layers size={12} className="text-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest font-mono">{data.area}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{data.confidence}% confidence</span>
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${data.confidence > 70 ? 'bg-green-500' : data.confidence > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
            style={{ width: `${data.confidence}%` }} 
          />
        </div>
      </div>
    </div>
    <p className="text-sm font-bold text-slate-900 mb-4 leading-relaxed group-hover:text-amber-700 transition-colors uppercase tracking-tight">{data.statement}</p>
    <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 group-hover:bg-amber-50/30 group-hover:border-amber-100 transition-all shadow-inner">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Evidence Base</p>
      <p className="text-xs text-slate-600 line-clamp-2 italic font-medium">{data.evidence || 'No evidence recorded.'}</p>
    </div>
    {data.validationDate && (
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tight font-mono">
          <Calendar size={10} /> Valid By {data.validationDate}
        </div>
        <Edit3 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )}
  </div>
);

const RiskItem: React.FC<{ data: Risk; onClick: () => void; delay: number }> = ({ data, onClick, delay }) => {
  const score = data.probability * data.impact;
  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-4 p-5 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group relative animate-in zoom-in-95 duration-500"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex-shrink-0 pt-1">
        <AlertCircle className={score > 12 ? "text-red-500 animate-pulse" : score > 6 ? "text-amber-500" : "text-slate-300"} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3">
            <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors tracking-tight uppercase">{data.mitigationPlan}</h5>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shadow-sm ${data.status === 'MITIGATED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
              {data.status}
            </span>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ml-2 font-mono shadow-inner ${score > 12 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
            SCORE: {score}/25
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-slate-400 mb-3 font-black uppercase tracking-widest font-mono">
          <span className="flex items-center gap-1"><User size={10} /> {data.owner}</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{data.type}</span>
        </div>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter font-mono">Prob</span>
            <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i <= data.probability ? 'bg-amber-400 shadow-sm shadow-amber-400/50 scale-110' : 'bg-slate-200'}`} />)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter font-mono">Impact</span>
            <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i <= data.impact ? 'bg-red-400 shadow-sm shadow-red-400/50 scale-110' : 'bg-slate-200'}`} />)}</div>
          </div>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <Edit3 size={16} className="text-slate-300 hover:text-indigo-600" />
      </div>
    </div>
  );
};

const SpofItem: React.FC<{ label: string; status: string; color: string }> = ({ label, status, color }) => (
  <li className="flex items-center justify-between border-b border-slate-800/50 pb-4 last:border-none last:pb-0">
    <span className="text-sm font-bold text-slate-400 tracking-tight uppercase">{label}</span>
    <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</span>
  </li>
);

export default IntelligenceModule;
