
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, BrainCircuit, ShieldAlert, Briefcase, Command } from 'lucide-react';

const GlobalSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose(); // In a real app this would toggle or open
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 md:p-20 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <Search size={24} className="text-slate-400" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across records, decisions, notes..."
            className="flex-1 bg-transparent border-none text-lg font-medium outline-none text-slate-900 placeholder-slate-300"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-400">
            <Command size={10} />
            <span>K</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query ? (
            <div className="p-4 space-y-1">
              <SearchResult icon={<FileText size={16} />} title="Google Workspace" type="Record" />
              <SearchResult icon={<BrainCircuit size={16} />} title="Q1 Pivot Strategy" type="Decision" />
              <SearchResult icon={<ShieldAlert size={16} />} title="CTO Departure Risk" type="Risk" />
              <SearchResult icon={<Briefcase size={16} />} title="Acme Technologies Pvt Ltd" type="Entity" />
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-400">Start typing to search your Founder OS...</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="p-0.5 bg-white border border-slate-200 rounded">Enter</span> to select</span>
            <span className="flex items-center gap-1"><span className="p-0.5 bg-white border border-slate-200 rounded">↑↓</span> to navigate</span>
          </div>
          <span>Found 4 results</span>
        </div>
      </div>
    </div>
  );
};

const SearchResult: React.FC<{ icon: React.ReactNode; title: string; type: string }> = ({ icon, title, type }) => (
  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-[10px] font-medium text-slate-400 uppercase">{type}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
  </button>
);

const ChevronRight = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default GlobalSearch;
