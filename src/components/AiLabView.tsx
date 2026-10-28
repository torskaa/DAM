import React, { useState } from 'react';
import { DAMAsset } from '../types/dam';
import { 
  Sparkles, 
  Search, 
  Box, 
  Users, 
  Tag, 
  Loader2, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Eye,
  FileCode
} from 'lucide-react';

interface AiLabViewProps {
  assets: DAMAsset[];
  onOpenDetail: (asset: DAMAsset) => void;
}

export const AiLabView: React.FC<AiLabViewProps> = ({ assets, onOpenDetail }) => {
  const [testQuery, setTestQuery] = useState('รูปคนชนแก้วเบียร์สิงห์บนดาดฟ้าตอนเย็น');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedDemoAsset, setSelectedDemoAsset] = useState<DAMAsset>(assets[0] || null);

  const handleTestSemanticSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testQuery,
          assets,
        }),
      });
      const data = await res.json();
      if (data.success && data.matches) {
        setSearchResults(data.matches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="notion-pill bg-[#ffb110] text-black">
              Gemini 3.8 Flash Vision & Semantic Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight mt-1.5">
            AI Auto-Tagging & Natural Language Search Lab
          </h1>
          <p className="text-sm text-[#615d59] mt-1 max-w-2xl font-['Lyon_Text',Georgia,serif]">
            Test and inspect multimodal object recognition, facial expression and crowd detection, and bilingual semantic understanding across your entire Singha media library.
          </p>
        </div>
      </div>

      {/* Grid: 2 Columns - Left: Natural Language Query Sandbox, Right: Vision Recognition Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Natural Language Semantic Query Tester */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-black flex items-center gap-2">
                <Search className="w-4 h-4 text-[#0075de]" />
                <span>Natural Language Semantic Search Engine</span>
              </h2>
              <span className="text-[11px] font-mono text-[#757575]">Thai & English NLP</span>
            </div>
            <p className="text-xs text-[#615d59] mb-4 font-['Lyon_Text',Georgia,serif]">
              Users can search with descriptive Thai conversational sentences without knowing exact tags or filenames.
            </p>

            <form onSubmit={handleTestSemanticSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g. 'กระป๋องบนน้ำแข็งบด', 'ขวดเบียร์สีอำพันบนเคาน์เตอร์ไม้'..."
                  className="w-full px-3.5 py-2.5 bg-[#f6f5f4] border border-[rgba(0,0,0,0.12)] rounded-[8px] text-xs text-black focus:border-[#0075de] outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#757575]">Quick tests:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestQuery('รูปคนชนแก้วเบียร์สิงห์บนดาดฟ้าตอนเย็น');
                    }}
                    className="text-[11px] text-[#0075de] hover:underline cursor-pointer"
                  >
                    คนชนแก้วบนดาดฟ้า
                  </button>
                  <span className="text-[#757575]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestQuery('กระป๋องเบียร์สิงห์สีทองบนน้ำแข็งเย็นฉ่ำ');
                    }}
                    className="text-[11px] text-[#0075de] hover:underline cursor-pointer"
                  >
                    กระป๋องบนน้ำแข็ง
                  </button>
                  <span className="text-[#757575]">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestQuery('dark market logo กฎหมายโฆษณา');
                    }}
                    className="text-[11px] text-[#0075de] hover:underline cursor-pointer"
                  >
                    Dark Market
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="notion-btn-primary flex items-center gap-1.5 text-xs disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Evaluate Match</span>
                </button>
              </div>
            </form>

            {/* Results Display */}
            <div className="mt-5 space-y-2.5">
              <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block">
                Ranked Relevance Output ({searchResults.length > 0 ? searchResults.length : 'Click Evaluate'})
              </span>

              {isSearching ? (
                <div className="py-8 text-center text-xs text-neutral-600 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Gemini reasoning across media catalog...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {searchResults.map((match: any) => {
                    const matchedAsset = assets.find((a) => a.id === match.id);
                    if (!matchedAsset) return null;

                    return (
                      <div
                        key={match.id}
                        onClick={() => onOpenDetail(matchedAsset)}
                        className="p-2.5 bg-neutral-50 hover:bg-amber-50/50 border border-neutral-200 hover:border-amber-300 rounded-lg transition-all flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={matchedAsset.previewUrl}
                            alt={matchedAsset.title}
                            className="w-10 h-10 rounded object-cover border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-neutral-900 truncate">
                              {matchedAsset.title}
                            </p>
                            <p className="text-[11px] text-neutral-600 truncate">
                              {match.matchReasonTh || match.matchReasonEn}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-amber-600">
                            {match.relevanceScore}%
                          </span>
                          <span className="text-[10px] text-neutral-600 block">Relevance</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-neutral-600 bg-neutral-50 rounded-lg border border-neutral-100">
                  Click "Evaluate Match" above to see real-time semantic scoring and Thai rationale.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module 2: Vision Object & Face Recognition Inspector */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-500" />
              <span>Multimodal Vision Recognition Inspector</span>
            </h2>
            <select
              value={selectedDemoAsset?.id || ''}
              onChange={(e) => {
                const found = assets.find((a) => a.id === e.target.value);
                if (found) setSelectedDemoAsset(found);
              }}
              className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-xs text-neutral-800 outline-none"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {selectedDemoAsset && (
            <div className="space-y-4 text-xs">
              {/* Asset Preview Stage with Bounding Box overlays */}
              <div className="relative aspect-16/9 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800">
                <img
                  src={selectedDemoAsset.previewUrl}
                  alt={selectedDemoAsset.title}
                  className="w-full h-full object-cover"
                />

                {selectedDemoAsset.detectedObjects.map((obj, i) => {
                  if (!obj.box) return null;
                  const [top, left, width, height] = obj.box;
                  return (
                    <div
                      key={i}
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                      }}
                      className="absolute border border-amber-400 bg-amber-400/20 rounded-xs flex items-start p-1 pointer-events-none"
                    >
                      <span className="bg-amber-400 text-neutral-950 text-[9px] font-bold px-1 rounded-xs">
                        {obj.label} ({Math.round(obj.confidence * 100)}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detected Entities List */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
                    <Box className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Detected Objects ({selectedDemoAsset.detectedObjects.length})</span>
                  </span>
                  <div className="space-y-1">
                    {selectedDemoAsset.detectedObjects.map((o, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-neutral-800">{o.label}</span>
                        <span className="font-mono tabular-nums font-bold text-amber-600">
                          {Math.round(o.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
                    <Users className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Faces & Atmosphere</span>
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Count:</span>
                      <span className="font-semibold text-neutral-800">
                        {selectedDemoAsset.detectedFaces.count} People
                      </span>
                    </div>
                    {selectedDemoAsset.detectedFaces.expression && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Expression:</span>
                        <span className="font-semibold text-neutral-800 truncate max-w-[120px]">
                          {selectedDemoAsset.detectedFaces.expression}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Category:</span>
                      <span className="font-semibold text-neutral-800">{selectedDemoAsset.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onOpenDetail(selectedDemoAsset)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold rounded text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Inspector</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
