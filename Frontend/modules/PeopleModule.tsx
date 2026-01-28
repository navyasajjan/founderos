
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  ChevronRight, 
  Search, 
  Plus, 
  X, 
  Save, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Link as LinkIcon,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Person, RoleDef, EmploymentType, Role, Record, Decision } from '../types';
import { api } from '../api';
import DeleteModal from '../components/DeleteModal';

const PeopleModule: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);

  // Delete States
  const [deleteTargetPersonId, setDeleteTargetPersonId] = useState<string | null>(null);
  const [deleteTargetRoleId, setDeleteTargetRoleId] = useState<string | null>(null);

  /**
   * HELPERS: DATE FORMATTING (dd-mm-yyyy <-> yyyy-mm-dd)
   */
  // const formatDateToDisplay = (dateStr?: string) => {
  //   if (!dateStr) return 'N/A';
  //   if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) return dateStr.substring(0, 10);
  //   const d = new Date(dateStr);
  //   if (isNaN(d.getTime())) return dateStr;
  //   const day = String(d.getDate()).padStart(2, '0');
  //   const month = String(d.getMonth() + 1).padStart(2, '0');
  //   const year = d.getFullYear();
  //   return `${day}-${month}-${year}`;
  // };

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

  const formatDateToPayload = (dateStr?: string) => {
      if (!dateStr) return undefined;

  // Handles YYYY-MM-DD (from <input type="date">)
  const date = new Date(dateStr);

  return isNaN(date.getTime()) ? undefined : date;
  };

  // Form States
  const [formPerson, setFormPerson] = useState<Partial<Person>>({
    employmentType: EmploymentType.EMPLOYEE,
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    linkedAssetIds: [],
    linkedDecisionIds: []
  });

  const [formRole, setFormRole] = useState<Partial<RoleDef>>({
    accessLevel: Role.VIEWER,
    responsibilities: [],
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [peopleData, rolesData, recordsData] = await Promise.all([
        api.people.list(),
        api.people.roles.list(),
        api.records.list(),
        // api.decisions.list()
      ]);

      setPeople(peopleData);
      setRoles(rolesData);
      setRecords(recordsData);
      // setDecisions(decisionsData);
    } catch (err) {
      console.error("Pulse sync failure in People module.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddPerson = () => {
    setFormPerson({
      employmentType: EmploymentType.EMPLOYEE,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      linkedAssetIds: [],
      linkedDecisionIds: []
    });
    setIsEditingPerson(false);
    setIsAddingPerson(true);
  };

  const handleOpenEditPerson = (person: Person) => {
    setFormPerson({
      ...person,
      startDate: formatDateToInput(person.startDate),
      endDate: formatDateToInput(person.endDate)
    });
    setIsEditingPerson(true);
    setIsAddingPerson(true);
  };

  const handleSavePerson = async () => {
    if (!formPerson.name || !formPerson.email || !formPerson.roleId) {
      alert("Name, Email, and Role are mandatory.");
      return;
    }

    try {
      const payload = {
        ...formPerson,
        startDate: formatDateToPayload(formPerson.startDate),
        endDate: formatDateToPayload(formPerson.endDate),
        updated_at: new Date().toISOString()
      };

      if (isEditingPerson && formPerson._id) {
        await api.people.update(formPerson._id, payload);
      } else {
        await api.people.create({
          ...payload,
          linkedAssetIds: [],
          linkedDecisionIds: []
        });
      }
      
      setIsAddingPerson(false);
      setIsEditingPerson(false);
      await loadData();
      if (formPerson._id) {
        const updated = people.find(p => p._id === formPerson._id);
        if (updated) setSelectedPerson(updated);
      }
    } catch (err) {
      alert("Identity persistence failure.");
    }
  };

  const handleDeletePersonConfirm = async () => {
    if (!deleteTargetPersonId) return;
    try {
      await api.people.delete(deleteTargetPersonId);
      if (selectedPerson?._id === deleteTargetPersonId) setSelectedPerson(null);
      setDeleteTargetPersonId(null);
      await loadData();
    } catch (err) {
      alert("De-provisioning failed.");
    }
  };

  const handleSaveRole = async () => {
    if (!formRole.title) {
      alert("Role title is mandatory.");
      return;
    }

    try {
      const payload = {
        ...formRole,
        updated_at: new Date().toISOString()
      };

      if (isEditingRole && formRole._id) {
        await api.people.roles.update(formRole._id, payload);
      } else {
        await api.people.roles.create(payload);
      }

      setIsAddingRole(false);
      setIsEditingRole(false);
      await loadData();
    } catch (err) {
      alert("Strategic pattern persistence failure.");
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!deleteTargetRoleId) return;
    if (people.some(p => p.roleId === deleteTargetRoleId)) {
      alert("BLOCK: Assigned team members exist for this role. Reassign them first.");
      setDeleteTargetRoleId(null);
      return;
    }
    try {
      await api.people.roles.delete(deleteTargetRoleId);
      setDeleteTargetRoleId(null);
      await loadData();
    } catch (err) {
      alert("Role deletion failed.");
    }
  };

  const openEditRole = (role: RoleDef) => {
    setFormRole({ ...role });
    setIsEditingRole(true);
    setIsAddingRole(true);
  };

  const getRoleTitle = (id: string) => roles.find(r => r._id === id)?.title || 'Unassigned Role';
  
  const getSPOFAssets = (personId: string) => records.filter(r => r.primaryOwner === personId && !r.backupOwner);

  const handleOffboard = async (person: Person) => {
    const spofs = getSPOFAssets(person._id);
    if (spofs.length > 0) {
      alert(`OFFBOARDING BLOCKED: This person is the sole owner of ${spofs.length} critical asset(s). Reassign ownership in Records & Assets first.`);
      return;
    }
    
    try {
      await api.people.update(person._id, { 
        status: 'INACTIVE', 
        endDate: formatDateToPayload(new Date().toISOString().split('T')[0])
      });
      await loadData();
      const updated = people.find(p => p._id === person._id);
      if (updated) setSelectedPerson(updated);
    } catch (err) {
      alert("Offboarding state update failed.");
    }
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
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1 font-mono">Module 05</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">People & Roles</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setFormRole({ accessLevel: Role.VIEWER, responsibilities: [], description: '' }); setIsEditingRole(false); setIsAddingRole(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ShieldCheck size={18} />
            Define Role
          </button>
          <button 
            onClick={handleOpenAddPerson}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <UserPlus size={18} />
            Add Person
          </button>
        </div>
      </div>

      <DeleteModal 
        isOpen={!!deleteTargetPersonId}
        onClose={() => setDeleteTargetPersonId(null)}
        onConfirm={handleDeletePersonConfirm}
        title="Remove Team Member"
        message="Permanently erase this person's record? All historical context and linking data will be detached from the system pulse."
      />

      <DeleteModal 
        isOpen={!!deleteTargetRoleId}
        onClose={() => setDeleteTargetRoleId(null)}
        onConfirm={handleDeleteRoleConfirm}
        title="Delete Role Definition"
        message="Remove this strategic role from the matrix? This will clear the associated responsibilities and OS access defaults."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search team identity..." 
                className="flex-1 bg-transparent border-none text-sm outline-none placeholder-slate-400 font-medium"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Identity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right font-mono">Pulse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {people.map(person => (
                    <tr 
                      key={person._id} 
                      onClick={() => setSelectedPerson(person)}
                      className={`group hover:bg-slate-50 cursor-pointer transition-colors ${selectedPerson?._id === person._id ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all shadow-sm ${person.status === 'ACTIVE' ? 'bg-white border border-slate-200 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-slate-50 text-slate-300 opacity-50'}`}>
                            {person.name[0]?.toUpperCase()}
                          </div>
                          <div className={person.status === 'INACTIVE' ? 'opacity-50' : ''}>
                            <p className="text-sm font-bold text-slate-900 tracking-tight">{person.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{person.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-xs font-bold text-slate-700 ${person.status === 'INACTIVE' ? 'line-through opacity-40' : ''}`}>{getRoleTitle(person.roleId)}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-medium">{person.employmentType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          person.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${person.status === 'ACTIVE' ? 'bg-green-500 animate-pulse shadow-sm shadow-green-500/50' : 'bg-slate-400'}`} />
                          {person.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {getSPOFAssets(person._id).length > 0 && person.status === 'ACTIVE' && (
                             <div className="p-1.5 bg-red-50 text-red-500 rounded-lg shadow-sm" title="Single Point of Failure Detected">
                               <ShieldAlert size={14} />
                             </div>
                           )}
                           <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-1" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {people.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm font-medium">No team members registered in pulse.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {selectedPerson ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8 animate-in slide-in-from-right-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <div className="flex items-start justify-between relative">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${selectedPerson.status === 'ACTIVE' ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-slate-200 text-slate-400'}`}>
                    {selectedPerson.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedPerson.name}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-70">{getRoleTitle(selectedPerson.roleId)}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleOpenEditPerson(selectedPerson)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18} /></button>
                  <button onClick={() => setDeleteTargetPersonId(selectedPerson._id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>

              <section className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Asset Ownership</h4>
                <div className="space-y-2.5">
                  {records.filter(r => r.primaryOwner === selectedPerson._id).map(asset => (
                    <div key={asset._id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <LinkIcon size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-800">{asset.name}</span>
                      </div>
                      <span className="text-[9px] font-black bg-white px-2 py-1 rounded-lg text-slate-400 uppercase shadow-inner border border-slate-50">{asset.type}</span>
                    </div>
                  ))}
                  {records.filter(r => r.primaryOwner === selectedPerson._id).length === 0 && (
                    <p className="text-xs text-slate-400 italic font-medium px-2">No critical records owned.</p>
                  )}
                </div>
              </section>

              {getSPOFAssets(selectedPerson._id).length > 0 && selectedPerson.status === 'ACTIVE' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2 shadow-sm animate-pulse">
                  <div className="flex items-center gap-2 text-red-700">
                    <ShieldAlert size={16} />
                    <h5 className="text-[10px] font-black uppercase tracking-widest">SPOF ALERT</h5>
                  </div>
                  <p className="text-[11px] text-red-600 leading-relaxed font-bold">
                    Solo owner of {getSPOFAssets(selectedPerson._id).length} assets. High systemic risk if unavailability occurs.
                  </p>
                </div>
              )}

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Institutional Context</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4 font-medium">
                  {selectedPerson.notes || 'No human context logged.'}
                </p>
              </section>

              <div className="pt-6 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 font-mono">
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2"><Calendar size={14} /> Joined: {(selectedPerson.startDate)}</div>
                  {selectedPerson.endDate && <div className="flex items-center gap-2 text-red-400"><X size={14} /> Terminated: {(selectedPerson.endDate)}</div>}
                </div>
                {selectedPerson.status === 'ACTIVE' && <button onClick={() => handleOffboard(selectedPerson)} className="text-red-500 font-black hover:underline hover:text-red-600 transition-colors">Offboard</button>}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-center">
              <Users size={48} className="mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Select Identity<br/>to map dependencies</p>
            </div>
          )}
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="text-indigo-600" size={24} />
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Strategic Role Gallery</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role._id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group relative animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg uppercase tracking-widest font-mono border border-indigo-200/50 shadow-sm">{role.accessLevel}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEditRole(role)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm transition-all"><Edit3 size={14} /></button>
                  <button onClick={() => setDeleteTargetRoleId(role._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg shadow-sm transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{role.title}</h4>
              <p className="text-xs text-slate-500 mb-5 line-clamp-2 font-medium leading-relaxed">{role.description}</p>
              <div className="space-y-2.5 pt-4 border-t border-slate-200/60">
                {role.responsibilities?.slice(0, 3).map(resp => (
                  <div key={resp.id} className="flex items-center gap-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                    <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    <span className="truncate">{resp.text}</span>
                  </div>
                ))}
                {(!role.responsibilities || role.responsibilities.length === 0) && <p className="text-[10px] text-slate-400 italic">No specific logic defined.</p>}
              </div>
            </div>
          ))}
          <button 
            onClick={() => { setFormRole({ accessLevel: Role.VIEWER, responsibilities: [], description: '' }); setIsEditingRole(false); setIsAddingRole(true); }}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all group shadow-inner"
          >
            <Plus size={32} className="mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Define Role Pattern</span>
          </button>
        </div>
      </section>

      {isAddingPerson && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddingPerson(false)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{isEditingPerson ? 'Edit Identity' : 'New Team Identity'}</h3>
                  <p className="text-xs text-slate-500 font-medium">Capture human logic nodes for the OS.</p>
                </div>
              </div>
              <button onClick={() => setIsAddingPerson(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="p-8 space-y-10 flex-1">
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Strategic Role</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Identity Name *</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold" value={formPerson.name || ''} onChange={(e) => setFormPerson({...formPerson, name: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Email Identity *</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={formPerson.email || ''} onChange={(e) => setFormPerson({...formPerson, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Role Type</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none shadow-sm" value={formPerson.roleId || ''} onChange={(e) => setFormPerson({...formPerson, roleId: e.target.value})}>
                      <option value="">Select Role...</option>
                      {roles.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Engagement</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none shadow-sm" value={formPerson.employmentType} onChange={(e) => setFormPerson({...formPerson, employmentType: e.target.value as EmploymentType})}>
                      {Object.values(EmploymentType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-mono">Institutional Memory</h4>
                <textarea rows={4} placeholder="Key expertise areas or succession risks..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none italic font-medium" value={formPerson.notes || ''} onChange={(e) => setFormPerson({...formPerson, notes: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Start Date</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none shadow-sm" value={formPerson.startDate || ''} onChange={(e) => setFormPerson({...formPerson, startDate: e.target.value})} />
                  </div>
                </div>
              </section>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3"><button onClick={() => setIsAddingPerson(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button><button onClick={handleSavePerson} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"><Save size={18} />Persist Identity</button></div>
          </div>
        </div>
      )}

      {isAddingRole && (
        <div className="fixed inset-0 z-[110] flex justify-center items-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h3 className="text-lg font-bold text-slate-900">{isEditingRole ? 'Edit Role Pattern' : 'Define Role Template'}</h3>
               <button onClick={() => setIsAddingRole(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Role Title *</label>
                <input type="text" placeholder="e.g. Head of Growth" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none font-bold" value={formRole.title || ''} onChange={(e) => setFormRole({...formRole, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Logic Scope</label>
                <textarea rows={2} placeholder="Describe the outcome expected from this role..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none resize-none font-medium" value={formRole.description || ''} onChange={(e) => setFormRole({...formRole, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">System Access</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none shadow-sm font-bold" value={formRole.accessLevel} onChange={(e) => setFormRole({...formRole, accessLevel: e.target.value as Role})}>
                  {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={handleSaveRole} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/30 active:scale-95 uppercase tracking-widest text-xs"><Save size={18} /> Commit Strategic Pattern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleModule;
