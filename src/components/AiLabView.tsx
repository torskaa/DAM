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
  Palette,
  Cpu,
  Scan,
  ShieldCheck
} from 'lucide-react';
import { BentoGrid, BentoCard } from './ui/bento-grid';

interface AiLabViewProps {
  assets: DAMAsset[];
  onOpenDetail: (asset: DAMAsset) => void;
}

export const AiLabView: React.FC<AiLabViewProps> = ({ assets, onOpenDetail }) => {
  const [testQuery, setTestQuery] = useState('รูปคนชนแก้วเบียร์สิงห์บนดาดฟ้าตอนเย็น');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedDemoAsset, setSelectedDemoAsset] = useState<DAMAsset>(assets[0] || null);
  const [showBoxes, setShowBoxes] = useState(true);

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
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-black/[0.08] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-sky-tint text-notion-blue">
              Gemini 2.5 Flash Vision
            </span>
            <span className="text-xs text-stone font-mono">Bento Intelligence Sandbox</span>
          </div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight font-heading">
            AI Auto-Tagging & Natural Language Search Lab
          </h1>
          <p className="text-xs text-graphite mt-1 max-w-2xl">
            Test and inspect multimodal object recognition, facial expression and crowd detection, and bilingual semantic understanding across your Singha media library.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-charcoal bg-paper-warmth px-3 py-1.5 rounded-[8px] border border-black/[0.08] flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-notion-blue" />
            <span>Active Model: Gemini 2.5 Flash</span>
          </span>
        </div>
      </div>

      {/* BENTO GRID OF AI CAPABILITIES */}
      <BentoGrid className="lg:grid-cols-3">
        
        {/* Bento 1: Multimodal Vision Stage (2 Cols) */}
        <div className="group relative col-span-3 lg:col-span-2 flex flex-col justify-between overflow-hidden rounded-[12px] bg-white border border-black/[0.08] p-6 shadow-xs hover:border-notion-blue/30 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-sky-tint text-notion-blue flex items-center justify-center">
                <Scan className="w-4 h-4 text-notion-blue" />
              </div>
              <h2 className="text-sm font-bold text-charcoal font-heading">
                Multimodal Vision & Object Detection Stage
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBoxes(!showBoxes)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-colors cursor-pointer border ${
                  showBoxes ? 'bg-sky-tint text-notion-blue border-notion-blue/30' : 'bg-paper-warmth text-stone border-black/[0.08]'
                }`}
              >
                {showBoxes ? 'Boxes: ON' : 'Boxes: OFF'}
              </button>

              <select
                value={selectedDemoAsset?.id || ''}
                onChange={(e) => {
                  const found = assets.find((a) => a.id === e.target.value);
                  if (found) setSelectedDemoAsset(found);
                }}
                className="px-2.5 py-1 bg-paper-warmth border border-black/[0.08] rounded-[6px] text-xs text-charcoal font-medium outline-none cursor-pointer max-w-[200px]"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedDemoAsset && (
            <div className="space-y-4">
              {/* Image Preview with Bounding Box overlays */}
              <div className="relative aspect-16/9 max-h-64 bg-charcoal rounded-[8px] overflow-hidden border border-black/[0.08]">
                <img
                  src={selectedDemoAsset.previewUrl}
                  alt={selectedDemoAsset.title}
                  className="w-full h-full object-cover"
                />

                {showBoxes && selectedDemoAsset.detectedObjects.map((obj, i) => {
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
                      className="absolute border-2 border-marigold bg-marigold/15 rounded-[4px] flex items-start p-1 pointer-events-none"
                    >
                      <span className="bg-charcoal text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] shadow-sm font-mono">
                        {obj.label} ({Math.round(obj.confidence * 100)}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detected Tags Pills Strip */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-stone">AI Tags:</span>
                  {selectedDemoAsset.tags.slice(0, 6).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-[4px] bg-paper-warmth text-charcoal font-medium text-[10px] border border-black/[0.06]">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onOpenDetail(selectedDemoAsset)}
                  className="px-3 py-1.5 bg-paper-warmth hover:bg-black/5 text-charcoal border border-black/[0.08] font-semibold rounded-[8px] text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-notion-blue" />
                  <span>Inspect Asset</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bento 2: Natural Language Semantic Search Engine (1 Col) */}
        <div className="group relative col-span-3 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-[12px] bg-white border border-black/[0.08] p-6 shadow-xs hover:border-notion-blue/30 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-marigold/20 text-charcoal flex items-center justify-center">
                  <Search className="w-4 h-4 text-charcoal" />
                </div>
                <h2 className="text-sm font-bold text-charcoal font-heading">
                  Semantic Query Sandbox
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone bg-paper-warmth px-1.5 py-0.5 rounded">NLP Match</span>
            </div>

            <p className="text-xs text-stone mb-3">
              Search using descriptive Thai sentences without exact filenames.
            </p>

            <form onSubmit={handleTestSemanticSearch} className="space-y-2.5">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="e.g. 'คนชนแก้วเบียร์บนดาดฟ้า'..."
                className="w-full px-3 py-2 bg-paper-warmth border border-black/[0.08] rounded-[8px] text-xs text-charcoal focus:border-notion-blue outline-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-stone">
                  <span>Quick:</span>
                  <button
                    type="button"
                    onClick={() => setTestQuery('รูปคนชนแก้วเบียร์สิงห์บนดาดฟ้าตอนเย็น')}
                    className="text-notion-blue hover:underline cursor-pointer"
                  >
                    คนชนแก้ว
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTestQuery('กระป๋องเบียร์สิงห์สีทองบนน้ำแข็งเย็นฉ่ำ')}
                    className="text-notion-blue hover:underline cursor-pointer"
                  >
                    บนน้ำแข็ง
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="notion-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Evaluate</span>
                </button>
              </div>
            </form>

            {/* Results Stream */}
            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {isSearching ? (
                <div className="py-6 text-center text-xs text-stone flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-notion-blue" />
                  <span>Computing semantic match...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.slice(0, 3).map((match: any) => {
                  const matchedAsset = assets.find((a) => a.id === match.id);
                  if (!matchedAsset) return null;

                  return (
                    <div
                      key={match.id}
                      onClick={() => onOpenDetail(matchedAsset)}
                      className="p-2 bg-paper-warmth hover:bg-sky-tint/50 border border-black/[0.06] hover:border-notion-blue/20 rounded-[8px] transition-all flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={matchedAsset.previewUrl}
                          alt=""
                          className="w-8 h-8 rounded-[4px] object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-charcoal truncate">{matchedAsset.title}</p>
                          <p className="text-[10px] text-stone truncate">{match.matchReasonTh || match.matchReasonEn}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-notion-blue shrink-0">
                        {match.relevanceScore}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-[11px] text-stone bg-paper-warmth rounded-[8px]">
                  Click "Evaluate" to run semantic inference.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento 3: Dominant Color Palette Extractor (1 Col) */}
        <div className="group relative col-span-3 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-[12px] bg-white border border-black/[0.08] p-6 shadow-xs hover:border-notion-blue/30 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-[8px] bg-paper-warmth text-charcoal flex items-center justify-center">
                <Palette className="w-4 h-4 text-charcoal" />
              </div>
              <h2 className="text-sm font-bold text-charcoal font-heading">
                Palette & Pantone Extraction
              </h2>
            </div>
            <p className="text-xs text-stone mb-4">
              AI color extraction verifying Boon Rawd gold & dark market compliance.
            </p>

            {selectedDemoAsset && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {selectedDemoAsset.dominantColors.map((color, idx) => (
                    <div key={idx} className="flex-1 space-y-1">
                      <div 
                        className="h-9 rounded-[6px] border border-black/[0.1] shadow-xs"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name}: ${color.hex}`}
                      />
                      <div className="text-[10px] text-charcoal font-mono text-center font-bold">
                        {color.hex}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-[8px] bg-paper-warmth border border-black/[0.06] text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone">Color Space:</span>
                    <span className="font-mono font-semibold text-charcoal">{selectedDemoAsset.colorSpace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone">Resolution:</span>
                    <span className="font-mono font-semibold text-charcoal">{selectedDemoAsset.resolutionDpi} DPI Print Master</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento 4: Facial Analysis & Talent Release Check (1 Col) */}
        <div className="group relative col-span-3 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-[12px] bg-white border border-black/[0.08] p-6 shadow-xs hover:border-notion-blue/30 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-charcoal font-heading">
                Talent Release & Crowd Radar
              </h2>
            </div>
            <p className="text-xs text-stone mb-4">
              Facial presence detection for model rights and advertising clearance.
            </p>

            {selectedDemoAsset && (
              <div className="p-3 rounded-[8px] bg-paper-warmth border border-black/[0.06] text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone">Detected People:</span>
                  <span className="font-bold text-charcoal">{selectedDemoAsset.detectedFaces.count} Persons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Expression / Mood:</span>
                  <span className="font-semibold text-charcoal">{selectedDemoAsset.detectedFaces.expression || 'Lifestyle Celebration'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Talent Clearance:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{selectedDemoAsset.rights?.talentName ? 'Model Released' : 'Standard Commercial'}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento 5: Batch Metadata Pipeline (1 Col) */}
        <div className="group relative col-span-3 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-[12px] bg-white border border-black/[0.08] p-6 shadow-xs hover:border-notion-blue/30 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-[8px] bg-sky-tint text-notion-blue flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-notion-blue" />
              </div>
              <h2 className="text-sm font-bold text-charcoal font-heading">
                Autonomous Vision Pipeline
              </h2>
            </div>
            <p className="text-xs text-stone mb-4">
              Gemini continuously extracts metadata, tags, and rights health on ingest.
            </p>

            <div className="p-3 rounded-[8px] bg-paper-warmth border border-black/[0.06] text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone">Catalog Auto-tagged:</span>
                <span className="font-mono font-bold text-charcoal">100% ({assets.length}/{assets.length})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Language Pair:</span>
                <span className="font-semibold text-notion-blue">TH (Thai) + EN (English)</span>
              </div>
            </div>
          </div>
        </div>

      </BentoGrid>
    </div>
  );
};
