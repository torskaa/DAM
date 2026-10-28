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
    <div className="w-full bg-white border border-black/[0.08] rounded-[12px] p-4 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone">
            {isAiSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-notion-blue" />
            ) : (
              <Search className="w-4 h-4 text-stone" />
            )}
          </div>

          <input
            type="text"
            value={localInput}
            onChange={(e) => {
              setLocalInput(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="Search by visual mood, setting, or campaign (e.g. 'friends toasting rooftop sunset', 'ขวดเบียร์หยดน้ำบนเคาน์เตอร์ไม้')..."
            className="w-full pl-10 pr-10 py-2.5 text-[13px] bg-paper-warmth hover:bg-black/[0.03] focus:bg-white border border-black/[0.08] focus:border-notion-blue focus:ring-3 focus:ring-notion-blue/15 rounded-[8px] transition-all outline-none text-charcoal placeholder:text-stone font-sans"
          />

          {localInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone hover:text-charcoal cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isAiSearching}
          className="notion-btn-primary h-[42px] px-4 py-2.5 rounded-[8px] flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
        >
          <span>Find Assets</span>
          <kbd className="hidden sm:inline-block text-[10px] text-white/80 font-mono bg-white/20 px-1.5 py-0.5 rounded">↵</kbd>
        </button>
      </form>

      {/* Suggested Creative Query Inspirations */}
      <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-stone">
        <span className="font-medium text-graphite whitespace-nowrap">Suggested moods:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {samplePrompts.map((p, idx) => (
            <React.Fragment key={idx}>
              <button
                type="button"
                onClick={() => handlePickSample(p.query)}
                className="text-graphite hover:text-notion-blue hover:underline transition-colors cursor-pointer text-[12px]"
              >
                {p.label}
              </button>
              {idx < samplePrompts.length - 1 && (
                <span className="text-black/20 select-none">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Active Curator Context Analysis */}
      {activeAiInterpretation && (
        <div className="mt-3.5 pt-3 border-t border-black/[0.06] flex items-start gap-2.5 text-xs text-graphite animate-in fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-notion-blue mt-1.5 shrink-0" />
          <div className="flex-1 leading-relaxed">
            <strong className="text-charcoal font-semibold">Curator Interpretation:</strong> {activeAiInterpretation}
            <span className="ml-2 text-stone font-mono tabular-nums">({totalResults} matches found)</span>
          </div>
        </div>
      )}
    </div>
  );
};
