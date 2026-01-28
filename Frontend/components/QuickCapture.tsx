
import React, { useState } from 'react';
import { X, Cpu, Loader2, CheckCircle2, AlertTriangle, Lightbulb, ListChecks, Users, Save } from 'lucide-react';
import { analyzeQuickCapture } from '../geminiService';
import { QuickCaptureSuggestion, Record, RecordType, RecordStatus, Decision, Risk, Person, EmploymentType } from '../types';
import { persistence } from '../persistence';

const QuickCapture: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<(QuickCaptureSuggestion & { checked: boolean })[]>([]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeQuickCapture(text);
    setSuggestions(result.map(s => ({ ...s, checked: true })));
    setIsAnalyzing(false);
  };

  const handleCommit = () => {
    const checked = suggestions.filter(s => s.checked);
    if (checked.length === 0) return;

    // 1. Decisions
    const decisions: Decision[] = checked.filter(s => s.type === 'DECISION').map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      title: s.title,
      area: 'General',
      description: s.content,
      tradeOffs: 'Captured via text dump.',
      mentalModels: [],
      linkedRecordIds: [],
      updated_at: new Date().toISOString()
    }));
    if (decisions.length > 0) persistence.saveDecisions([...decisions, ...persistence.getDecisions()]);

    // 2. Risks
    const risks: Risk[] = checked.filter(s => s.type === 'RISK').map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      type: 'Captured',
      probability: 3,
      impact: 3,
      mitigationPlan: s.content,
      owner: 'Founder',
      status: 'OPEN',
      updated_at: new Date().toISOString()
    }));
    if (risks.length > 0) persistence.saveRisks([...risks, ...persistence.getRisks()]);

    // 3. Assets/Tasks
    const records: Record[] = checked.filter(s => s.type === 'ASSET' || s.type === 'TASK').map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      name: s.title,
      category: 'Captured',
      type: s.type === 'ASSET' ? RecordType.ASSET : RecordType.TASK,
      status: RecordStatus.ACTIVE,
      startDate: new Date().toISOString().split('T')[0],
      cost: 0,
      billingCycle: 'ONE_TIME',
      paymentMethod: 'N/A',
      primaryOwner: 'Founder',
      tags: ['Captured'],
      notes: s.content,
      decisionLog: [],
      risks: [],
      alternatives: [],
      links: [],
      updated_at: new Date().toISOString()
    }));
    if (records.length > 0) persistence.saveRecords([...records, ...persistence.getRecords()]);

    // 4. People
    const people: Person[] = checked.filter(s => s.type === 'PERSON').map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      name: s.title,
      email: 'pending@startup.co',
      roleId: 'unassigned',
      employmentType: EmploymentType.EMPLOYEE,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      notes: s.content,
      linkedAssetIds: [],
      linkedDecisionIds: [],
      updated_at: new Date().toISOString()
    }));
    if (people.length > 0) persistence.savePeople([...people, ...persistence.getPeople()]);

    alert(`Successfully committed ${checked.length} entities to Founder OS.`);
    reset();
    onClose();
  };

  const reset = () => {
    setText('');
    setSuggestions([]);
    setIsAnalyzing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quick Capture Intelligence</h3>
              <p className="text-xs text-slate-500 font-medium">Unstructured thought to structured OS entries.</p>
            </div>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 space-y-4 border-r border-slate-100 flex flex-col">
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Input Notes / Brain Dump</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="We decided to move away from AWS and try GCP for cost savings. Also worried about Joe leaving next month, need a backup for the DNS settings. Assigned Ramesh to manage the server credentials..."
                className="flex-1 w-full bg-slate-50 border-none rounded-xl p-6 text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 resize-none font-mono min-h-[300px]"
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <><Loader2 className="animate-spin" size={20} />Analyzing with Gemini...</>
              ) : 'Extract Structures'}
            </button>
          </div>

          <div className="p-8 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">AI Structured Suggestions</h4>
            {suggestions.length === 0 && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <Lightbulb size={48} className="mb-4 text-slate-300" /><p className="text-sm font-medium max-w-xs">Enter your notes and click Extract to see structured suggestions.</p>
              </div>
            )}
            <div className="space-y-4">
              {suggestions.map((s, i) => (
                <SuggestionCard 
                  key={i} 
                  suggestion={s} 
                  onToggle={() => setSuggestions(prev => prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item))} 
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
          <p className="text-xs text-slate-400">Review and select suggestions to commit to the database.</p>
          <div className="flex gap-3">
            <button onClick={reset} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800">Clear</button>
            <button 
              onClick={handleCommit}
              disabled={suggestions.filter(s => s.checked).length === 0}
              className="px-8 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} /> Commit Selected to OS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{ suggestion: QuickCaptureSuggestion & { checked: boolean }; onToggle: () => void }> = ({ suggestion, onToggle }) => {
  const icons = {
    DECISION: <CheckCircle2 className="text-indigo-600" size={18} />,
    RISK: <AlertTriangle className="text-amber-600" size={18} />,
    ASSET: <ListChecks className="text-green-600" size={18} />,
    TASK: <ListChecks className="text-blue-600" size={18} />,
    PERSON: <Users className="text-indigo-600" size={18} />
  };

  const bgColors = {
    DECISION: 'bg-indigo-50 border-indigo-100',
    RISK: 'bg-amber-50 border-amber-100',
    ASSET: 'bg-green-50 border-green-100',
    TASK: 'bg-blue-50 border-blue-100',
    PERSON: 'bg-indigo-50 border-indigo-200 shadow-sm'
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${suggestion.checked ? bgColors[suggestion.type] : 'bg-white border-slate-200 opacity-60'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icons[suggestion.type]}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{suggestion.type}</span>
        </div>
        <input 
          type="checkbox" 
          checked={suggestion.checked} 
          onChange={onToggle}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
        />
      </div>
      <h5 className="text-sm font-bold text-slate-800 mb-1">{suggestion.title}</h5>
      <p className="text-xs text-slate-600 leading-relaxed">{suggestion.content}</p>
    </div>
  );
};

export default QuickCapture;
