import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Users, 
  FileCheck,
  Building2,
  ExternalLink,
  Plus,
  X,
  Save,
  Trash2,
  ChevronRight,
  UserPlus,
  Edit3,
  Settings2,
  UserCheck,
  Loader2,
  ArrowUpRight
} from 'lucide-react';
import { EntityType, Company, Advisor } from '../types';
import DeleteModal from '../components/DeleteModal';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

interface CompanyModuleProps {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

const CompanyModule: React.FC<CompanyModuleProps> = ({ activeCompanyId, setActiveCompanyId }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [formCompany, setFormCompany] = useState<Partial<Company>>({
    name: '',
    entityType: EntityType.PVT_LTD,
    founders: [{ name: '', share: 100 }],
    advisors: [{ name: '', type: '', firm: '' }],
    complianceChecklist: [],
    incorporationDate: new Date().toISOString().split('T')[0],
    registeredAddress: '',
    cin: '',
    pan: '',
    tan: '',
    gstin: ''
  });

  const activeCompany = companies.find(c => c._id.toString() === activeCompanyId);

  const openAddForm = () => {
    setFormCompany({
      name: '',
      entityType: EntityType.PVT_LTD,
      founders: [{ name: '', share: 100 }],
      advisors: [{ name: '', type: '', firm: '' }],
      complianceChecklist: [],
      incorporationDate: new Date().toISOString().split('T')[0],
      registeredAddress: '',
      cin: '',
      pan: '',
      tan: '',
      gstin: ''
    });
    setIsEditing(false);
    setIsAdding(true);
  };

  const openEditForm = (company: Company, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormCompany({ ...company });
    setIsEditing(true);
    setIsAdding(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.companies.list();
      setCompanies(data);
      if (data.length > 0 && !activeCompanyId) {
        setActiveCompanyId(data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load entity nodes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntity = async () => {
    if (!formCompany.name) return alert("Company Name required.");
    try {
      if (isEditing && formCompany._id) {
        await api.companies.update(formCompany._id, formCompany);
      } else {
        const newEntity = await api.companies.create({
          ...formCompany,
          updated_at: new Date().toISOString()
        });
        if (!activeCompanyId) setActiveCompanyId(newEntity._id);
      }
      setIsAdding(false);
      setIsEditing(false);
      await loadData();
    } catch (err) {
      alert("Save operation failed.");
    }
  };
  
  const navigate = useNavigate();

  const handleDeleteConfirm = async() => {
    if (!deleteTargetId) return;
    try {
      await api.companies.delete(deleteTargetId);
      const updatedList = companies.filter(c => c._id !== deleteTargetId);
      setCompanies(updatedList);
      
      if (activeCompanyId === deleteTargetId) {
        setActiveCompanyId(updatedList[0]?._id || null);
      }
      
      setDeleteTargetId(null);
      if (updatedList.length === 0) navigate('/');
    } catch (err) {
      alert("Deletions node failure.");
    }
  };

  const addFounderRow = () => {
    setFormCompany({
      ...formCompany,
      founders: [...(formCompany.founders || []), { name: '', share: 0 }]
    });
  };

  const updateFounder = (index: number, field: 'name' | 'share', value: string | number) => {
    const updatedFounders = [...(formCompany.founders || [])];
    updatedFounders[index] = { ...updatedFounders[index], [field]: value };
    setFormCompany({ ...formCompany, founders: updatedFounders });
  };

  const removeFounder = (index: number) => {
    const updatedFounders = (formCompany.founders || []).filter((_, i) => i !== index);
    setFormCompany({ ...formCompany, founders: updatedFounders });
  };

  const addAdvisorRow = () => {
    setFormCompany({
      ...formCompany,
      advisors: [...(formCompany.advisors || []), { name: '', type: '', firm: '' }]
    });
  };

  const updateAdvisor = (index: number, field: keyof Advisor, value: string) => {
    const updatedAdvisors = [...(formCompany.advisors || [])];
    updatedAdvisors[index] = { ...updatedAdvisors[index], [field]: value };
    setFormCompany({ ...formCompany, advisors: updatedAdvisors });
  };

  const removeAdvisor = (index: number) => {
    const updatedAdvisors = (formCompany.advisors || []).filter((_, i) => i !== index);
    setFormCompany({ ...formCompany, advisors: updatedAdvisors });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1 font-mono">Module 01 // Structural Governance</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase">Entity & Compliance</h2>
        </div>
        <div className="flex items-center gap-3">
          {companies.length > 1 && (
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all"
              value={activeCompanyId || ''}
              onChange={(e) => setActiveCompanyId(e.target.value)}
            >
              {companies.map(c => (
                <option key={c._id} value={c._id.toString()}>{c.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} /> New Entity
          </button>
        </div>
      </div>

      <DeleteModal 
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Legal Entity"
        message="Permanently remove this company structure? All compliance history and linked founder records will be purged."
      />

      {!activeCompany ? (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 animate-in zoom-in-95 duration-500">
          <Building2 size={48} className="mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-[10px]">No Entities Registered</p>
          <button onClick={openAddForm} className="text-indigo-600 text-sm font-bold mt-2 hover:underline uppercase tracking-tighter active:scale-95 transition-all">Initialize First Node</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Core Identity Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative group hover:border-indigo-300 transition-all duration-300 animate-in zoom-in-95 duration-500">
                <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={() => openEditForm(activeCompany)}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                    title="Edit Entity"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteTargetId(activeCompany._id); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                    title="Delete Entity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Building2 size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 leading-none tracking-tighter uppercase">{activeCompany.name}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                        Live Entity
                      </p>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">
                        {activeCompany.entityType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12">
                  <InfoBox label="CIN // Identifier" value={activeCompany.cin || 'NOT_FOUND'} delay={50} />
                  <InfoBox label="Incorp Date" value={ activeCompany.incorporationDate ? new Date(activeCompany.incorporationDate).toLocaleDateString('en-IN', {day: '2-digit', month: 'short',year: 'numeric',}) : '-'} delay={100}/> 
                  <InfoBox label="PAN // Revenue" value={activeCompany.pan || 'NOT_FOUND'} delay={150} />
                  <InfoBox label="GSTIN // Indirect" value={activeCompany.gstin || 'NOT_FOUND'} delay={200} />
                  <InfoBox label="TAN // Deductions" value={activeCompany.tan || 'NOT_FOUND'} delay={250} />
                  <InfoBox label="Pulse Status" value="SYSTEM_VERIFIED" isStatus delay={300} />
                </div>

                <div className="mt-12 pt-10 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-500 fill-mode-both">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-slate-400" />
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registered HQ</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl whitespace-pre-line font-bold">
                    {activeCompany.registeredAddress}
                  </p>
                </div>
              </div>

              {/* Ownership Summary */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 hover:border-indigo-200 transition-all animate-in zoom-in-95 duration-500 delay-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-indigo-600" />
                    <h4 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Cap Table Snapshot</h4>
                  </div>
                  <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all">
                    Manage Equity <ChevronRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeCompany.founders.map((f, i) => (
                    <Shareholder key={i} name={f.name} share={f.share} role={i === 0 ? "Primary Founder" : "Co-founder"} delay={i * 100} />
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 overflow-hidden relative group animate-in zoom-in-95 duration-500 delay-150">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="flex items-center gap-2 mb-8 text-indigo-400">
                  <ShieldCheck size={20} />
                  <h4 className="text-lg font-bold text-white uppercase tracking-tight italic">Governance Pulse</h4>
                </div>
                <div className="flex items-center gap-6 mb-10">
                  <div className="text-5xl font-black text-white tracking-tighter">
                    {activeCompany.complianceChecklist.length > 0 
                      ? Math.round((activeCompany.complianceChecklist.filter(c => c.status === 'DONE').length / activeCompany.complianceChecklist.length) * 100) 
                      : 100}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    {activeCompany.complianceChecklist.filter(c => c.status === 'PENDING').length} Filings Due<br />
                    0 Overdue Nodes
                  </div>
                </div>
                <div className="space-y-3">
                  {activeCompany.complianceChecklist.length > 0 ? activeCompany.complianceChecklist.map((item, idx) => (
                    <CheckItem key={item.id} label={item.name} status={item.status} deadline={item.deadline} delay={idx * 75} />
                  )) : (
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest py-2">Standard logic applied.</div>
                  )}
                </div>
                <button className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-700 transition-all rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-slate-700 active:scale-95 shadow-lg shadow-black/20">
                  Execute Compliance Audit
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in zoom-in-95 duration-500 delay-200">
                <div className="flex items-center gap-3 mb-8">
                  <FileCheck size={20} className="text-indigo-600" />
                  <h4 className="text-lg font-bold text-slate-800 uppercase tracking-tight italic">Advisory Nodes</h4>
                </div>
                <div className="space-y-6">
                  {activeCompany.advisors?.length > 0 ? activeCompany.advisors.map((adv, idx) => (
                    <AdvisorBox key={idx} name={adv.name} type={adv.type} firm={adv.firm} delay={idx * 100} />
                  )) : (
                    <div className="text-xs text-slate-400 font-medium">No legal/financial advisors mapped.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Entity Registry Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500 delay-300">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <Settings2 size={18} className="text-slate-400" />
            <h4 className="font-bold text-slate-800 uppercase text-sm tracking-tight">Structural Registry</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{companies.length} Registered Nodes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Entity Label</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Structure</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Incorp Node</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right font-mono">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {companies.map((c, idx) => (
                <tr 
                  key={c._id} 
                  className={`group hover:bg-slate-50 cursor-pointer transition-all animate-in zoom-in-95 duration-500 ${activeCompanyId === c._id ? 'bg-indigo-50/40' : ''}`}
                  onClick={() => setActiveCompanyId(c._id)}
                  /* Corrected: Use animationFillMode instead of fillMode in React style objects */
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 tracking-tight uppercase">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{c.cin || 'NO_IDENTIFIER'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-widest">{c.entityType}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase tracking-tight">
                    {c.incorporationDate ? new Date(c.incorporationDate).toLocaleDateString('en-IN', {day: '2-digit', month: 'short',year: 'numeric',}) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={(e) => openEditForm(c, e)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-90"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteTargetId(c._id); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Registration Form */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight italic">{isEditing ? 'Update Logic Node' : 'Initialize Entity'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Persist legal structure to system core.</p>
                </div>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-10 flex-1 animate-in zoom-in-95 duration-500">
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Identity Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Official Entity Label *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ACME TECHNOLOGIES PVT LTD"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                      value={formCompany.name || ''}
                      onChange={(e) => setFormCompany({...formCompany, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Structure Type</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold uppercase tracking-widest outline-none shadow-sm"
                      value={formCompany.entityType}
                      onChange={(e) => setFormCompany({...formCompany, entityType: e.target.value as EntityType})}
                    >
                      {Object.values(EntityType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Incorp Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono outline-none shadow-sm"
                      value={formCompany.incorporationDate || ''}
                      onChange={(e) => setFormCompany({...formCompany, incorporationDate: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Statutory Identifiers</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">CIN</label>
                    <input 
                      type="text" 
                      placeholder="U72900..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-mono uppercase font-bold"
                      value={formCompany.cin || ''}
                      onChange={(e) => setFormCompany({...formCompany, cin: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">PAN</label>
                    <input 
                      type="text" 
                      placeholder="ABCDE1234F"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-mono uppercase font-bold"
                      value={formCompany.pan || ''}
                      onChange={(e) => setFormCompany({...formCompany, pan: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">GSTIN</label>
                    <input 
                      type="text" 
                      placeholder="29ABCDE..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-mono uppercase font-bold"
                      value={formCompany.gstin || ''}
                      onChange={(e) => setFormCompany({...formCompany, gstin: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">TAN</label>
                    <input 
                      type="text" 
                      placeholder="BLRA12345C"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none font-mono uppercase font-bold"
                      value={formCompany.tan || ''}
                      onChange={(e) => setFormCompany({...formCompany, tan: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">HQ Context</h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 font-mono uppercase tracking-widest ml-1">Registered Address *</label>
                  <textarea 
                    rows={3}
                    placeholder="Complete address as per official registration"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm"
                    value={formCompany.registeredAddress || ''}
                    onChange={(e) => setFormCompany({...formCompany, registeredAddress: e.target.value})}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Founding Nodes</h4>
                  <button 
                    onClick={addFounderRow}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <UserPlus size={14} /> Add Founder
                  </button>
                </div>
                <div className="space-y-3">
                  {formCompany.founders?.map((founder, index) => (
                    <div key={index} className="flex gap-3 items-end group bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200">
                      <div className="flex-[3]">
                        <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Identity Name</label>
                        <input 
                          type="text" 
                          placeholder="Full Name"
                          className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-sm font-bold outline-none shadow-inner"
                          value={founder.name}
                          onChange={(e) => updateFounder(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Share %</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-sm font-bold outline-none shadow-inner"
                          value={founder.share}
                          onChange={(e) => updateFounder(index, 'share', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <button 
                        onClick={() => removeFounder(index)}
                        className="p-2.5 text-slate-300 hover:text-red-500 transition-colors active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4 pb-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] font-mono">Expert Advisor Nodes</h4>
                  <button 
                    onClick={addAdvisorRow}
                    className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <UserCheck size={14} /> Add Advisor
                  </button>
                </div>
                <div className="space-y-4">
                  {formCompany.advisors?.map((advisor, index) => (
                    <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative group hover:border-indigo-200 transition-all shadow-sm">
                      <button 
                        onClick={() => removeAdvisor(index)}
                        className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-red-500 transition-colors active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Advisor Identity</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Rajesh Kumar"
                            className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-sm font-bold outline-none shadow-inner"
                            value={advisor.name}
                            onChange={(e) => updateAdvisor(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Type (CA, Law)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Legal Counsel"
                            className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-sm font-bold outline-none shadow-inner"
                            value={advisor.type}
                            onChange={(e) => updateAdvisor(index, 'type', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Firm Label</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Kumar & Assoc"
                            className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-sm font-bold outline-none shadow-inner"
                            value={advisor.firm}
                            onChange={(e) => updateAdvisor(index, 'firm', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                onClick={handleSaveEntity}
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Save size={18} />
                {isEditing ? 'Persist Updates' : 'Commit Entity Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBox: React.FC<{ label: string; value: string; isStatus?: boolean; delay?: number }> = ({ label, value, isStatus, delay = 0 }) => (
  <div className="animate-in zoom-in-95 duration-500" /* Corrected: Use animationFillMode instead of fillMode in React style objects */ style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 font-mono">{label}</p>
    {isStatus ? (
       <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-indigo-600 tracking-tighter uppercase">{value}</span>
       </div>
    ) : (
      <p className="text-sm font-bold text-slate-800 break-all leading-none tracking-tight uppercase">{value}</p>
    )}
  </div>
);

const Shareholder: React.FC<{ name: string; share: number; role: string; delay?: number }> = ({ name, share, role, delay = 0 }) => (
  <div 
    className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all shadow-sm group animate-in zoom-in-95 duration-500"
    /* Corrected: Use animationFillMode instead of fillMode in React style objects */
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-500 shadow-inner group-hover:rotate-6 group-hover:scale-110 transition-transform">
        {name?.[0]?.toUpperCase() || '?'}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 tracking-tight uppercase">{name || 'UNDEFINED FOUNDER'}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-0.5">{role}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-lg font-black text-indigo-600 leading-none">{share}%</p>
      <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden shadow-inner">
        <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${share}%` }} />
      </div>
    </div>
  </div>
);

const CheckItem: React.FC<{ label: string; status: 'DONE' | 'PENDING'; deadline?: string; delay?: number }> = ({ label, status, deadline, delay = 0 }) => (
  <div 
    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800/60 group hover:bg-slate-800 transition-all cursor-default animate-in zoom-in-95 duration-300"
    /* Corrected: Use animationFillMode instead of fillMode in React style objects */
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${status === 'DONE' ? 'bg-indigo-400 shadow-indigo-400/50' : 'bg-amber-400 shadow-amber-400/50 animate-pulse'}`} />
      <span className="text-[11px] font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{label}</span>
    </div>
    {deadline && (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/50 border border-slate-700/30">
        <Calendar size={10} className="text-slate-500" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">T-{deadline}</span>
      </div>
    )}
  </div>
);

const AdvisorBox: React.FC<{ name: string; type: string; firm: string; delay?: number }> = ({ name, type, firm, delay = 0 }) => (
  <div 
    className="group cursor-pointer p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-300 animate-in zoom-in-95 duration-300"
    /* Corrected: Use animationFillMode instead of fillMode in React style objects */
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{name}</p>
      <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
    <div className="flex items-center gap-2">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{type}</p>
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{firm}</p>
    </div>
  </div>
);

export default CompanyModule;