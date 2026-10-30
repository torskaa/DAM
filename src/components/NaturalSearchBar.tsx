import React, { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface NaturalSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExecuteSearch: (query: string) => void;
  isAiSearching: boolean;
  activeAiInterpretation?: string | null;
  totalResults: number;
}

export const NaturalSearchBar: React.FC<NaturalSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  isAiSearching,
  activeAiInterpretation,
  totalResults,
}) => {
  const [localInput, setLocalInput] = useState(searchQuery);

  const samplePrompts = [
    { label: '🍻 คนชนแก้วบนดาดฟ้า', query: 'รูปคนชนแก้วเบียร์สังสรรค์บนดาดฟ้าแสงสีทอง' },
    { label: '🧊 กระป๋องบนน้ำแข็ง', query: 'กระป๋องเบียร์สีทองบนน้ำแข็งบดพร้อมหยดน้ำ' },
    { label: '🪵 ขวดแก้วบนเคาน์เตอร์ไม้', query: 'ขวดแก้วสีอำพันเย็นฉ่ำบนเคาน์เตอร์ไม้สัก' },
    { label: '🛡️ โลโก้ Dark Market', query: 'dark market logo สำหรับตลาดควบคุมโฆษณา' },
    { label: '🎉 คอนเสิร์ตเฟสติวัล', query: 'งานดนตรีคอนเสิร์ตคนชูแก้วเบียร์ฉลอง' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim()) {
      onExecuteSearch(localInput.trim());
    }
  };

  const handleClear = () => {
    setLocalInput('');
    onSearchChange('');
    onExecuteSearch('');
  };

  const handlePickSample = (query: string) => {
    setLocalInput(query);
    onSearchChange(query);
    onExecuteSearch(query);
  };

  return (
    <div className="w-full bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-3 sm:p-4 mb-5 shadow-xs">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
            {isAiSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand)]" />
            ) : (
              <Search className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </div>

          <input
            type="text"
            value={localInput}
            onChange={(e) => {
              setLocalInput(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="Search by visual mood, setting, or campaign (e.g. 'friends toasting rooftop sunset', 'ขวดเบียร์หยดน้ำ')..."
            className="w-full pl-10 pr-10 py-2.5 text-[13px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-card)] border border-[var(--border-card)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 rounded-lg transition-all outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-sans"
          />

          {localInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isAiSearching}
          className="bg-[var(--color-brand)] hover:brightness-110 text-white h-[42px] px-4 rounded-lg flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50 text-xs font-medium shadow-xs"
        >
          <span>Find Assets</span>
          <kbd className="hidden sm:inline-block text-[10px] text-white/80 font-mono bg-white/20 px-1.5 py-0.5 rounded">↵</kbd>
        </button>
      </form>

      {/* Suggested Creative Query Inspirations (Fastwork style quick tags) */}
      <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
        <span className="text-[11px] font-medium text-[var(--text-secondary)] whitespace-nowrap">Suggested moods:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePickSample(p.query)}
              className="px-2 py-0.5 rounded-md text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Curator Context Analysis */}
      {activeAiInterpretation && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border-card)] flex items-start gap-2.5 text-xs text-[var(--text-secondary)] animate-in fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] mt-1.5 shrink-0" />
          <div className="flex-1 leading-relaxed">
            <strong className="text-[var(--text-primary)] font-semibold">AI Curator Analysis:</strong> {activeAiInterpretation}
            <span className="ml-2 text-[var(--text-muted)] font-mono tabular-nums">({totalResults} matches found)</span>
          </div>
        </div>
      )}
    </div>
  );
};
