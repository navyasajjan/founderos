
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Trash2, 
  X, 
  Save, 
  Edit3, 
  Loader2,
  Tag,
  CreditCard,
  Info,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { RecordStatus, Person, Record as IRecord, RecordType, Company } from '../types';
import { api } from '../api';
import DeleteModal from '../components/DeleteModal';

interface RecordsModuleProps {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

const RecordsModule: React.FC<RecordsModuleProps> = ({ activeCompanyId, setActiveCompanyId }) => {
  const [records, setRecords] = useState<IRecord[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<IRecord | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Helper: Convert any date string to DD-MM-YYYY for display/payload
  const formatDateToDisplay = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) return dateStr.substring(0, 10);
      return dateStr;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper: Convert DD-MM-YYYY or ISO to YYYY-MM-DD for <input type="date">
  const formatDateToInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Helper: Convert YYYY-MM-DD (input value) to ISO string for payload
  const formatDateToPayload = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toISOString();
  };

  const [formRecord, setFormRecord] = useState<Partial<IRecord>>({
    name: '',
    category: '',
    type: RecordType.SUBSCRIPTION,
    status: RecordStatus.ACTIVE,
    cost: 0,
    billingCycle: 'MONTHLY',
    paymentMethod: '',
    primaryOwner: 'Founder',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: '',
    notes: '',
    tags: []
  });

  const [tagsInput, setTagsInput] = useState('');

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
      const [recordsData, peopleData] = await Promise.all([
        api.records.list(companyId),
        api.people.list()
      ]);
      setRecords(recordsData);
      setPeople(peopleData);
    } catch (err) {
      console.error("Failed to load records from OS pulse.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormRecord({
      name: '',
      category: '',
      type: RecordType.SUBSCRIPTION,
      status: RecordStatus.ACTIVE,
      cost: 0,
      billingCycle: 'MONTHLY',
      paymentMethod: '',
      primaryOwner: 'Founder',
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: '',
      notes: '',
      tags: []
    });
    setTagsInput('');
    setIsEditing(false);
    setIsAdding(true);
  };

  const handleOpenEdit = (record: IRecord) => {
    setFormRecord({
      ...record,
      startDate: formatDateToInput(record.startDate),
      renewalDate: formatDateToInput(record.renewalDate)
    });
    setTagsInput(record.tags.join(', '));
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleSaveRecord = async () => {
    if (!formRecord.name) return alert("Record name is mandatory.");
    if (!activeCompanyId) return alert("No active entity selected.");
    
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    
    const payload = {
      ...formRecord,
      companyId: activeCompanyId,
      startDate: formatDateToPayload(formRecord.startDate),
      renewalDate: formatDateToPayload(formRecord.renewalDate),
      tags,
      updated_at: new Date().toISOString()
    };

    try {
      if (isEditing && formRecord._id) {
        await api.records.update(formRecord._id, payload);
      } else {
        await api.records.create({
          ...payload,
          risks: [], decisionLog: [], alternatives: [], links: []
        });
      }
      setIsAdding(false);
      setIsEditing(false);
      loadData(activeCompanyId);
    } catch (err) {
      alert("Persistence failure.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !activeCompanyId) return;
    try {
      await api.records.delete(deleteTargetId, activeCompanyId);
      loadData(activeCompanyId);
      setDeleteTargetId(null);
      if (selectedRecord?._id === deleteTargetId) setSelectedRecord(null);
    } catch (err) {
      alert("Deletions node failure.");
    }
  };

  const getOwnerName = (id: string) => {
    if (id === 'Founder') return 'Founder (Admin)';
    return people.find(p => p._id === id)?.name || id;
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
        <p className="text-slate-500 font-medium">Please register a company entity to unlock the asset vault.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1 font-mono">Module 03 // Asset Inventory</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase">Records & Assets</h2>
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
            onClick={handleOpenAdd} 
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} /> New Record
          </button>
        </div>
      </div>

      {!activeCompanyId ? (
        <div className="h-96 flex flex-col items-center justify-center opacity-50 space-y-4">
          <Building2 size={48} className="text-slate-300" />
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Select Entity for Asset Vault</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in zoom-in-95 duration-500">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={18} />
              <h4 className="font-bold text-slate-800 uppercase text-sm tracking-tight">Active Nodes</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{records.length} Monitored Assets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Record Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Type / Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Owner</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right font-mono">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map(record => (
                  <tr 
                    key={record._id} 
                    className={`group hover:bg-slate-50 cursor-pointer transition-all ${selectedRecord?._id === record._id ? 'bg-indigo-50/40' : ''}`} 
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 tracking-tight uppercase">{record.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold">START: {formatDateToDisplay(record.startDate)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700 tracking-tight">{record.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{record.category || 'Uncategorized'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        record.status === RecordStatus.ACTIVE ? 'bg-green-50 text-green-700' : 
                        record.status === RecordStatus.RENEWAL_SOON ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${record.status === RecordStatus.ACTIVE ? 'bg-green-500' : record.status === RecordStatus.RENEWAL_SOON ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100 shadow-inner">
                          {getOwnerName(record.primaryOwner)[0]}
                        </div>
                        <span className="text-xs text-slate-600 font-bold uppercase tracking-tight">{getOwnerName(record.primaryOwner)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleOpenEdit(record)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-90"><Edit3 size={16} /></button>
                        <button onClick={() => setDeleteTargetId(record._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm transition-all active:scale-90"><Trash2 size={16} /></button>
                        <ChevronRight size={16} className="text-slate-300 ml-2" />
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic text-sm font-medium">No record nodes detected in the asset vault.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteModal 
        isOpen={!!deleteTargetId} 
        onClose={() => setDeleteTargetId(null)} 
        onConfirm={handleDeleteConfirm} 
        title="Purge Record"
        message="Permanently remove this asset from the inventory? This will clear all linked logic and metadata."
      />

      {/* Side-over Details View */}
      {selectedRecord && !isAdding && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Record Profile</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asset Detail View</p>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="p-10 space-y-12 flex-1 animate-in zoom-in-95 duration-500">
              <section className="space-y-6">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2 font-mono">Entity Label</label>
                  <p className="text-2xl font-bold text-slate-900 leading-none uppercase">{selectedRecord.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2 font-mono">Structure Type</label>
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{selectedRecord.type}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2 font-mono">Current Pulse</label>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      selectedRecord.status === RecordStatus.ACTIVE ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-y-10 gap-x-12 pt-10 border-t border-slate-50">
                <InfoBox label="Deployment Date" value={formatDateToDisplay(selectedRecord.startDate)} />
                <InfoBox label="Renewal Target" value={formatDateToDisplay(selectedRecord.renewalDate)} />
                <InfoBox label="Primary Owner" value={getOwnerName(selectedRecord.primaryOwner)} />
                <InfoBox label="Payment Handle" value={selectedRecord.paymentMethod || 'N/A'} />
              </section>

              <section className="pt-10 border-t border-slate-50 space-y-4">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block font-mono">Internal Logic // Notes</label>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4 font-medium">
                  {selectedRecord.notes || 'No contextual logic defined for this asset.'}
                </p>
              </section>

              <section className="pt-10 border-t border-slate-50 space-y-4 pb-10">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block font-mono">Metadata Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-tight shadow-sm">
                      {tag}
                    </span>
                  ))}
                  {selectedRecord.tags.length === 0 && <p className="text-xs text-slate-300">No tags assigned.</p>}
                </div>
              </section>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
               <button onClick={() => { handleOpenEdit(selectedRecord); setSelectedRecord(null); }} className="flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Edit Node</button>
               <button onClick={() => { setDeleteTargetId(selectedRecord._id); setSelectedRecord(null); }} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-90"><Trash2 size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Form View */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg">
                  {isEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">{isEditing ? 'Update Logic Node' : 'Initialize Asset'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Persist identity nodes to system core.</p>
                </div>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all active:scale-90">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 animate-in zoom-in-95 duration-500">
              {/* Section 1: Identification */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Identity Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Asset Label *</label>
                    <input value={formRecord.name} onChange={e => setFormRecord({...formRecord, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold shadow-sm" placeholder="e.g. Google Cloud Platform" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Structure Type</label>
                    <select value={formRecord.type} onChange={e => setFormRecord({...formRecord, type: e.target.value as RecordType})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm uppercase tracking-widest text-xs font-black">
                      {Object.values(RecordType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Logic Category</label>
                    <input value={formRecord.category} onChange={e => setFormRecord({...formRecord, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm text-sm" placeholder="Infrastructure, Legal..." />
                  </div>
                </div>
              </div>

              {/* Section 2: Financial & Ownership */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Control & Economics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Pulse Status</label>
                    <select value={formRecord.status} onChange={e => setFormRecord({...formRecord, status: e.target.value as RecordStatus})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm uppercase tracking-widest text-xs font-black">
                      {Object.values(RecordStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Monthly Cost (₹)</label>
                    <input type="number" value={formRecord.cost} onChange={e => setFormRecord({...formRecord, cost: parseFloat(e.target.value) || 0})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Billing Loop</label>
                    <select value={formRecord.billingCycle} onChange={e => setFormRecord({...formRecord, billingCycle: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm uppercase tracking-widest text-xs font-black">
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUAL">Annual</option>
                      <option value="ONE_TIME">One Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Payment Method</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input value={formRecord.paymentMethod} onChange={e => setFormRecord({...formRecord, paymentMethod: e.target.value})} className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm text-sm" placeholder="Card / Bank" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Primary Controller</label>
                    <select value={formRecord.primaryOwner} onChange={e => setFormRecord({...formRecord, primaryOwner: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm text-sm font-bold">
                      <option value="Founder">Founder (Admin)</option>
                      {people.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Timeline & Intelligence */}
              <div className="space-y-4 pb-10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 font-mono">Intelligence Loop</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Deployment Date</label>
                    <input type="date" value={formRecord.startDate} onChange={e => setFormRecord({...formRecord, startDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-sm shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Next Renewal</label>
                    <input type="date" value={formRecord.renewalDate} onChange={e => setFormRecord({...formRecord, renewalDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-sm shadow-inner" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Tags (Comma Sep)</label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm text-sm" placeholder="operational, saas, critical..." />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-widest ml-1">Institutional Context</label>
                    <textarea value={formRecord.notes} onChange={e => setFormRecord({...formRecord, notes: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none shadow-sm resize-none h-32 text-sm italic font-medium" placeholder="Describe the strategic logic for this asset node..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-2xl transition-all active:scale-95">Cancel</button>
              <button onClick={handleSaveRecord} className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Save size={18} /> {isEditing ? 'Persist Updates' : 'Commit Asset Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5 font-mono">{label}</p>
    <p className="text-sm font-bold text-slate-800 break-all leading-none tracking-tight uppercase">{value}</p>
  </div>
);

export default RecordsModule;
