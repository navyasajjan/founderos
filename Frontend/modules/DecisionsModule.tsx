
import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ArrowRight,
  Calendar,
  History,
  Layers,
  Target,
  Plus,
  X,
  Save,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Loader2,
  Building2
} from 'lucide-react';
import { Decision, Company } from '../types';
import { api } from '../api';
import DeleteModal from '../components/DeleteModal';

interface DecisionsModuleProps {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

const DecisionsModule: React.FC<DecisionsModuleProps> = ({ activeCompanyId, setActiveCompanyId }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formDecision, setFormDecision] = useState<Partial<Decision>>({
    title: '',
    area: 'Strategy',
    description: '',
    tradeOffs: '',
    mentalModels: [],
    outcome: 'Pending',
    reviewDate: '',
    linkedRecordIds: []
  });

  const [modelsInput, setModelsInput] = useState('');

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
      const data = await api.decisions.list(companyId);
      setDecisions(data);
    } catch (err) {
      console.error("Failed to load strategic nodes from pulse.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setFormDecision({
      title: '',
      area: 'Strategy',
      description: '',
      tradeOffs: '',
      mentalModels: [],
      outcome: 'Pending',
      reviewDate: '',
      linkedRecordIds: []
    });
    setModelsInput('');
    setIsEditing(false);
    setIsAdding(true);
  };

  const openEditForm = (decision: Decision, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormDecision({ ...decision });
    setModelsInput(decision.mentalModels.join(', '));
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleSaveDecision = async () => {
    if (!activeCompanyId) return;
    if (!formDecision.title || !formDecision.description) {
      alert("Title and Description are required to capture logic.");
      return;
    }

    const models = modelsInput.split(',').map(m => m.trim()).filter(m => m !== '');
    
    const payload = {
      ...formDecision,
      companyId: activeCompanyId,
      mentalModels: models,
      updated_at: new Date().toISOString()
    };

    try {
      if (isEditing && formDecision._id) {
        await api.decisions.update(activeCompanyId, formDecision._id, payload);
      } else {
        await api.decisions.create(activeCompanyId, {
          ...payload,
          linkedRecordIds: []
        });
      }
      setIsAdding(false);
      setIsEditing(false);
      loadData(activeCompanyId);
    } catch (err) {
      alert("Strategic persistence failure.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !activeCompanyId) return;
    try {
      await api.decisions.delete(activeCompanyId, deleteTargetId);
      setDeleteTargetId(null);
      loadData(activeCompanyId);
    } catch (err) {
      alert("Deletions node failure.");
    }
  };

  const allModels = decisions.reduce((acc: Record<string, number>, d) => {
    d.mentalModels.forEach(m => {
      acc[m] = (acc[m] || 0) + 1;
    });
    return acc;
  }, {});

  const reviewsDue = decisions.filter(d => {
    if (!d.reviewDate) return false;
    return new Date(d.reviewDate) < new Date();
  });

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
        <p className="text-slate-500 font-medium">Please register a company entity to unlock the thinking vault.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1 font-mono">Module 04 // Cognitive Governance</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase">Thinking Vault</h2>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={activeCompanyId || ''} 
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} /> New Entry
          </button>
        </div>
      </div>

      <DeleteModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Logic Entry"
        message="Permanently remove this strategic entry? This will purge the trade-off logic and mental model tracking from the Thinking Vault."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {decisions.map((decision, idx) => (
            <div key={decision._id} className={`animate-in zoom-in-95 duration-500`} style={{ animationDelay: `${idx * 50}ms` }}>
              <DecisionCard 
                decision={decision}
                onEdit={() => openEditForm(decision)}
                onDelete={(e) => { e.stopPropagation(); setDeleteTargetId(decision._id); }}
              />
            </div>
          ))}
          {decisions.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 animate-in zoom-in-95 duration-500">
              <BrainCircuit size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-[10px]">The vault is empty</p>
              <button onClick={openAddForm} className="text-indigo-600 text-sm font-bold mt-2 hover:underline uppercase tracking-tighter active:scale-95 transition-all">Initialize First Logic Node</button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm animate-in zoom-in-95 duration-500 delay-150">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 font-mono border-b border-slate-50 pb-2">Mental Model Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(allModels).map(([model, count]) => (
                <span key={model} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold border border-indigo-100 flex items-center gap-2 uppercase tracking-tight shadow-sm hover:bg-indigo-100 transition-colors cursor-default">
                  {model} <span className="text-[9px] bg-white border border-indigo-200 px-1.5 rounded-full shadow-inner">{count}</span>
                </span>
              ))}
              {Object.keys(allModels).length === 0 && (
                <p className="text-[10px] text-slate-400 italic font-bold uppercase tracking-widest">No models mapped.</p>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative animate-in zoom-in-95 duration-500 delay-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="flex items-center gap-2 mb-6 text-indigo-200">
              <Target size={20} />
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">Impact Reviews Due</h4>
            </div>
            <p className="text-xs text-indigo-100 mb-8 leading-relaxed font-bold uppercase tracking-tight">
              System identified {reviewsDue.length} decision{reviewsDue.length !== 1 ? 's' : ''} where logical validity requires verification.
            </p>
            <div className="space-y-3">
              {reviewsDue.map(d => (
                <div 
                  key={d._id} 
                  onClick={() => openEditForm(d)}
                  className="flex items-center justify-between bg-indigo-700/50 p-4 rounded-2xl border border-indigo-500/30 group/item hover:bg-indigo-500 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  <span className="text-xs font-bold truncate pr-4 uppercase tracking-tight">{d.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={12} className="text-amber-300 animate-pulse" />
                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">Review</span>
                  </div>
                </div>
              ))}
              {reviewsDue.length === 0 && (
                <div className="p-4 bg-indigo-700/30 rounded-2xl border border-indigo-500/20 text-center">
                  <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">System Logical Integrity: Optimal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">{isEditing ? 'Update Logic Node' : 'Capture Thinking'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Persist strategic context to system vault.</p>
                </div>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-10 flex-1 animate-in zoom-in-95 duration-500">
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Cognitive Scope</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Logic Node Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pivot to Enterprise Distribution"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      value={formDecision.title || ''}
                      onChange={(e) => setFormDecision({...formDecision, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Decision Area</label>
                    <input 
                      type="text" 
                      placeholder="Strategy, Product..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold uppercase tracking-widest outline-none shadow-sm"
                      value={formDecision.area || ''}
                      onChange={(e) => setFormDecision({...formDecision, area: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Verification Loop</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black uppercase tracking-widest outline-none shadow-sm"
                      value={formDecision.outcome || ''}
                      onChange={(e) => setFormDecision({...formDecision, outcome: e.target.value})}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Success">Success</option>
                      <option value="Failure">Failure</option>
                      <option value="Pivoted">Pivoted</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">The Reasoning Layer</h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">The "What"</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe the decision logic being recorded..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm"
                    value={formDecision.description || ''}
                    onChange={(e) => setFormDecision({...formDecision, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Trade-offs ("The Why")</label>
                  <textarea 
                    rows={4}
                    placeholder="What was sacrificed for this path? Why this over the alternatives?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none resize-none italic shadow-sm"
                    value={formDecision.tradeOffs || ''}
                    onChange={(e) => setFormDecision({...formDecision, tradeOffs: e.target.value})}
                  />
                </div>
              </section>

              <section className="space-y-4 pb-10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Frameworks</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 flex items-center gap-2 font-mono uppercase tracking-widest ml-1"><Tag size={12} /> Models (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Inversion, First Principles"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold uppercase tracking-widest outline-none shadow-sm"
                      value={modelsInput}
                      onChange={(e) => setModelsInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 flex items-center gap-2 font-mono uppercase tracking-widest ml-1"><Clock size={12} /> Impact Audit Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono outline-none shadow-inner"
                      value={formDecision.reviewDate || ''}
                      onChange={(e) => setFormDecision({...formDecision, reviewDate: e.target.value})}
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDecision}
                className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Save size={18} />
                {isEditing ? 'Persist Logic Updates' : 'Commit Logic Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DecisionCardProps {
  decision: Decision;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onEdit, onDelete }) => (
  <div 
    onClick={onEdit}
    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm group hover:border-indigo-300 transition-all cursor-pointer relative"
  >
    <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90 shadow-sm"
      >
        <Edit3 size={18} />
      </button>
      <button 
        onClick={onDelete}
        className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90 shadow-sm"
      >
        <Trash2 size={18} />
      </button>
    </div>

    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">{decision.area}</span>
            {decision.outcome && (
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm ${
                decision.outcome.toLowerCase() === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'
              }`}>
                {decision.outcome}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight pr-12 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{decision.title}</h3>
        </div>
        <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110 transition-all shrink-0 self-start shadow-inner border border-slate-100">
          <ArrowRight size={24} />
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed font-bold whitespace-pre-wrap">{decision.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono"><Layers size={14} className="text-indigo-400" /> Strategic Trade-Offs</h4>
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 shadow-inner">
            <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap font-medium">
              {decision.tradeOffs || 'No logical sacrifices logged for this node.'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono"><BrainCircuit size={14} className="text-indigo-400" /> Mental Model Mapping</h4>
          <div className="flex flex-wrap gap-2.5">
            {decision.mentalModels.map(m => (
              <span key={m} className="px-2.5 py-1 bg-white text-slate-700 rounded-lg border border-slate-100 text-[10px] font-black uppercase tracking-tight shadow-sm transition-transform hover:scale-105">{m}</span>
            ))}
            {decision.mentalModels.length === 0 && (
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Standard Heuristics</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">
        <div className="flex flex-wrap items-center gap-6">
          {decision.reviewDate && (
            <div className={`flex items-center gap-2 ${new Date(decision.reviewDate) < new Date() ? 'text-red-500' : ''}`}>
              <Calendar size={14} className={new Date(decision.reviewDate) < new Date() ? 'animate-pulse' : ''} /> 
              Audit Target: {new Date(decision.reviewDate).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}
            </div>
          )}
          <div className="flex items-center gap-2 opacity-60">
            <History size={14} /> 
            Persistence Timestamp: {new Date(decision.updated_at).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DecisionsModule;
