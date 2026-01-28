
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  X, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  ListChecks, 
  BrainCircuit, 
  Loader2,
  Save,
  Trash2,
  Edit3,
  Undo2,
  Pause,
  Play,
  History,
  Clock,
  AlertCircle,
  Merge,
  Users,
  IndianRupee
} from 'lucide-react';
import { startLiveTranscription, structureLiveTranscript } from '../geminiService';
import { DraftCard, LiveSession, TranscriptSegment, Record, RecordType, RecordStatus, Decision, Risk, Assumption, Person, EmploymentType, Expense, ExpenseCategory } from '../types';
import { persistence } from '../persistence';
import DeleteModal from './DeleteModal';

interface LiveCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

type SessionStatus = 'IDLE' | 'RECORDING' | 'PAUSED' | 'STOPPED';

const LiveCapture: React.FC<LiveCaptureProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SessionStatus>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [draftCards, setDraftCards] = useState<DraftCard[]>([]);
  const [isStructuring, setIsStructuring] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  
  // Delete States
  const [showDiscardSessionModal, setShowDiscardSessionModal] = useState(false);
  const [cardToDeleteId, setCardToDeleteId] = useState<string | null>(null);

  const stopFnRef = useRef<(() => void) | null>(null);
  const transcriptBufferRef = useRef('');
  const lastAnalyzedTranscriptRef = useRef('');
  const isPausedRef = useRef(false);

  const [bars, setBars] = useState<number[]>(new Array(20).fill(20));
  
  useEffect(() => {
    let interval: any;
    if (status === 'RECORDING') {
      interval = setInterval(() => {
        setBars(new Array(20).fill(0).map(() => Math.random() * 40 + 5));
      }, 100);
    } else {
      setBars(new Array(20).fill(5));
    }
    return () => clearInterval(interval);
  }, [status]);

  const startSession = async () => {
    setTranscript('');
    setSegments([]);
    setError(null);
    transcriptBufferRef.current = '';
    lastAnalyzedTranscriptRef.current = '';
    setDraftCards([]);
    setSelectedForMerge([]);
    setStartTime(new Date().toISOString());
    setStatus('RECORDING');
    isPausedRef.current = false;
    
    try {
      const { stop } = await startLiveTranscription({
        onTranscription: (text) => {
          if (isPausedRef.current) return;
          const timestamp = new Date().toLocaleTimeString();
          setTranscript(prev => prev + ' ' + text);
          setSegments(prev => [...prev, { timestamp, text }]);
          transcriptBufferRef.current += ' ' + text;
        },
        onError: (message) => {
          setError(message);
          setStatus('IDLE');
          if (stopFnRef.current) {
            stopFnRef.current();
            stopFnRef.current = null;
          }
        }
      });
      stopFnRef.current = stop;
    } catch (err) {
      setStatus('IDLE');
    }
  };

  const pauseSession = () => {
    isPausedRef.current = true;
    setStatus('PAUSED');
  };

  const resumeSession = () => {
    isPausedRef.current = false;
    setStatus('RECORDING');
  };

  const stopSession = () => {
    if (stopFnRef.current) {
      stopFnRef.current();
      stopFnRef.current = null;
    }
    setStatus('STOPPED');
  };

  const handleDiscardConfirm = () => {
    if (stopFnRef.current) {
      stopFnRef.current();
      stopFnRef.current = null;
    }
    resetState();
    onClose();
    setShowDiscardSessionModal(false);
  };

  const resetState = () => {
    setStatus('IDLE');
    setError(null);
    setTranscript('');
    setSegments([]);
    setDraftCards([]);
    setStartTime(null);
    transcriptBufferRef.current = '';
    lastAnalyzedTranscriptRef.current = '';
  };

  useEffect(() => {
    const analyzeIfNeeded = async () => {
      const current = transcriptBufferRef.current;
      const last = lastAnalyzedTranscriptRef.current;
      if (current.length - last.length > 80 && !isStructuring && status === 'RECORDING') {
        setIsStructuring(true);
        const newSegment = current.slice(last.length);
        const newCards = await structureLiveTranscript(newSegment);
        setDraftCards(prev => [...prev, ...newCards]);
        lastAnalyzedTranscriptRef.current = current;
        setIsStructuring(false);
      }
    };
    const timer = setTimeout(analyzeIfNeeded, 2500);
    return () => clearTimeout(timer);
  }, [transcript, isStructuring, status]);

  const finalizeSession = () => {
    const approvedCards = draftCards.filter(c => c.approved);
    
    // 1. Convert approved TASKS
    const taskRecords: Record[] = approvedCards
      .filter(c => c.type === 'TASK')
      .map(c => ({
        id: Math.random().toString(36).substr(2, 9),
        name: c.summary,
        category: 'Action Item',
        type: RecordType.TASK,
        status: RecordStatus.ACTIVE,
        startDate: new Date().toISOString().split('T')[0],
        cost: 0,
        billingCycle: 'ONE_TIME',
        paymentMethod: 'N/A',
        primaryOwner: 'Founder',
        tags: ['Voice Capture', 'Task'],
        notes: c.details,
        decisionLog: [],
        risks: [],
        alternatives: [],
        links: [],
        updated_at: new Date().toISOString()
      }));
    if (taskRecords.length > 0) persistence.saveRecords([...taskRecords, ...persistence.getRecords()]);

    const decisions: Decision[] = approvedCards
      .filter(c => c.type === 'DECISION')
      .map(c => ({
        id: Math.random().toString(36).substr(2, 9),
        title: c.summary,
        area: 'Strategy',
        description: c.details,
        tradeOffs: 'Discussed in session.',
        mentalModels: [],
        linkedRecordIds: [],
        updated_at: new Date().toISOString()
      }));
    if (decisions.length > 0) persistence.saveDecisions([...decisions, ...persistence.getDecisions()]);

    const risks: Risk[] = approvedCards
      .filter(c => c.type === 'RISK')
      .map(c => ({
        id: Math.random().toString(36).substr(2, 9),
        type: 'Operational',
        probability: 3,
        impact: 4,
        mitigationPlan: c.details,
        owner: 'Founder',
        status: 'OPEN',
        updated_at: new Date().toISOString()
      }));
    if (risks.length > 0) persistence.saveRisks([...risks, ...persistence.getRisks()]);

    const expenses: Expense[] = approvedCards
      .filter(c => c.type === 'EXPENSE')
      .map(c => {
        const amountMatch = c.details.match(/\d+/);
        const amount = amountMatch ? parseInt(amountMatch[0]) : 0;
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: c.summary,
          amount: amount,
          type: 'RECURRING',
          category: ExpenseCategory.OTHER,
          billingCycle: 'MONTHLY',
          startDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Pending',
          notes: c.details,
          updated_at: new Date().toISOString()
        };
      });
    if (expenses.length > 0) persistence.saveExpenses([...expenses, ...persistence.getExpenses()]);

    const session: LiveSession = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: startTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      transcript: transcript,
      segments: segments,
      draftCards: approvedCards
    };
    
    persistence.saveSession(session);
    resetState();
    onClose();
  };

  const approveCard = (id: string) => {
    setDraftCards(prev => prev.map(c => c.id === id ? { ...c, approved: !c.approved } : c));
  };

  const discardCardConfirm = () => {
    if (!cardToDeleteId) return;
    setDraftCards(prev => prev.filter(c => c.id !== cardToDeleteId));
    setSelectedForMerge(prev => prev.filter(mid => mid !== cardToDeleteId));
    setCardToDeleteId(null);
  };

  const updateCard = (id: string, updates: Partial<DraftCard>) => {
    setDraftCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleMergeSelection = (id: string) => {
    setSelectedForMerge(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };

  const mergeSelectedCards = () => {
    if (selectedForMerge.length < 2) return;
    const cardsToMerge = draftCards.filter(c => selectedForMerge.includes(c.id));
    const firstCard = cardsToMerge[0];
    const mergedCard: DraftCard = {
      ...firstCard,
      id: Math.random().toString(36).substr(2, 9),
      summary: `Merged: ${cardsToMerge.map(c => c.summary).join(' & ')}`,
      details: cardsToMerge.map(c => c.details).join('\n\n---\n\n'),
      confidence: Math.max(...cardsToMerge.map(c => c.confidence)),
      approved: false
    };
    setDraftCards(prev => [...prev.filter(c => !selectedForMerge.includes(c.id)), mergedCard]);
    setSelectedForMerge([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/20">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl text-white transition-colors duration-500 ${
              error ? 'bg-red-500' :
              status === 'RECORDING' ? 'bg-red-500 animate-pulse' : 
              status === 'PAUSED' ? 'bg-amber-500' : 
              status === 'STOPPED' ? 'bg-green-600' : 'bg-slate-400'
            }`}>
              {error ? <AlertCircle size={20} /> : <Mic size={20} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Live OS Stream</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                {error ? 'Interrupted' :
                 status === 'IDLE' ? 'Awaiting Stream' : 
                 status === 'RECORDING' ? 'Streaming PCM...' : 
                 status === 'PAUSED' ? 'Buffered' : 'Stream Closed'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>

        <DeleteModal 
          isOpen={showDiscardSessionModal}
          onClose={() => setShowDiscardSessionModal(false)}
          onConfirm={handleDiscardConfirm}
          title="Discard Session"
          message="Discard the entire current stream and all structured intelligence cards? This cannot be undone."
        />

        <DeleteModal 
          isOpen={!!cardToDeleteId}
          onClose={() => setCardToDeleteId(null)}
          onConfirm={discardCardConfirm}
          title="Discard Card"
          message="Remove this intelligence card from the session draft?"
        />

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 border-r border-slate-100 flex flex-col bg-white overflow-hidden">
             {/* Transcript Area */}
             <div className="flex-1 bg-slate-50/50 rounded-3xl p-6 font-mono text-sm text-slate-700 leading-relaxed overflow-y-auto border border-slate-100 shadow-inner">
              {segments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center uppercase tracking-widest font-black"><Mic size={40} className="mb-4" />No Stream Data</div>
              ) : (
                <div className="space-y-4">
                  {segments.map((seg, i) => (
                    <div key={i} className="flex gap-4 animate-in fade-in duration-300">
                      <span className="text-[10px] text-slate-300 font-bold shrink-0 mt-1">{seg.timestamp}</span>
                      <span className="text-slate-700 font-medium">{seg.text}</span>
                    </div>
                  ))}
                  {status === 'RECORDING' && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse rounded-sm align-middle" />}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex items-end gap-1.5 h-10">
                {bars.map((height, i) => (
                  <div key={i} className={`w-2 rounded-full transition-all duration-100 ${status === 'RECORDING' ? 'bg-indigo-500' : 'bg-slate-200'}`} style={{ height: `${height}px`, opacity: status === 'RECORDING' ? 1 : 0.2 }} />
                ))}
              </div>
              <div className="flex items-center gap-6">
                {(status === 'IDLE' || error) && <button onClick={startSession} className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"><Mic size={24} /><span>Initialize Stream</span></button>}
                {(status === 'RECORDING' || status === 'PAUSED') && (
                  <>
                    <button onClick={status === 'RECORDING' ? pauseSession : resumeSession} className={`flex items-center justify-center w-20 h-20 rounded-full transition-all border-4 ${status === 'RECORDING' ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'}`}>{status === 'RECORDING' ? <Pause size={32} /> : <Play size={32} />}</button>
                    <button onClick={stopSession} className="flex items-center justify-center w-20 h-20 bg-red-500 text-white rounded-full shadow-2xl hover:bg-red-600 transition-all active:scale-95 border-4 border-red-300/20"><Square size={32} className="fill-current" /></button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50/30 overflow-hidden flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 font-mono">DRAFT INTELLIGENCE ({draftCards.length})</h4>
            <div className="flex-1 overflow-y-auto space-y-4">
              {draftCards.map((card) => (
                <DraftCardComponent 
                  key={card.id} 
                  card={card} 
                  onApprove={() => approveCard(card.id)}
                  onDiscard={() => setCardToDeleteId(card.id)}
                  onUpdate={(updates) => updateCard(card.id, updates)}
                  isMerging={selectedForMerge.includes(card.id)}
                  onToggleMerge={() => toggleMergeSelection(card.id)}
                />
              ))}
              {draftCards.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-40 font-bold uppercase text-[10px] tracking-widest text-slate-500">Extracting Logic...</div>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between px-10">
          <div className="flex items-center gap-6">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"><span className="text-slate-900">{draftCards.filter(c => c.approved).length}</span> Approved</div>
             {(status === 'RECORDING' || status === 'PAUSED' || status === 'STOPPED') && <button onClick={() => setShowDiscardSessionModal(true)} className="flex items-center gap-2 text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest"><Trash2 size={14} /> Discard Stream</button>}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800">Close</button>
            <button onClick={finalizeSession} disabled={status === 'IDLE' || draftCards.filter(c => c.approved).length === 0} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-2">
              <Save size={18} /> Persist Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DraftCardComponentProps {
  card: DraftCard;
  onApprove: () => void;
  onDiscard: () => void;
  onUpdate: (updates: Partial<DraftCard>) => void;
  isMerging: boolean;
  onToggleMerge: () => void;
}

const DraftCardComponent: React.FC<DraftCardComponentProps> = ({ 
  card, onApprove, onDiscard, onUpdate, isMerging, onToggleMerge
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const icons = {
    DECISION: <CheckCircle2 className="text-indigo-600" size={18} />,
    TASK: <ListChecks className="text-blue-600" size={18} />,
    RISK: <AlertTriangle className="text-amber-600" size={18} />,
    ASSUMPTION: <BrainCircuit className="text-purple-600" size={18} />,
    PERSON: <Users className="text-indigo-600" size={18} />,
    EXPENSE: <IndianRupee className="text-red-600" size={18} />
  };
  const bgColors = {
    DECISION: 'bg-indigo-50 border-indigo-100',
    TASK: 'bg-blue-50 border-blue-100',
    RISK: 'bg-amber-50 border-amber-100',
    ASSUMPTION: 'bg-purple-50 border-purple-100',
    PERSON: 'bg-indigo-50 border-indigo-200',
    EXPENSE: 'bg-red-50 border-red-100'
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-300 relative group ${
      card.approved ? 'border-green-400 bg-white shadow-lg ring-1 ring-green-100' : bgColors[card.type] + ' border-transparent'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">{icons[card.type]}<span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{card.type}</span></div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDiscard} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
          <button onClick={onApprove} className={`p-1.5 rounded-lg transition-all ${card.approved ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>{card.approved ? <Check size={14} strokeWidth={3} /> : <Check size={14} />}</button>
        </div>
      </div>
      <div className="pl-4">
        <h5 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{card.summary}</h5>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{card.details}</p>
      </div>
    </div>
  );
};

export default LiveCapture;
