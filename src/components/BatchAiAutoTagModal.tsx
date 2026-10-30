import React, { useState } from 'react';
import { DAMAsset, DetectedObject, DetectedFacesInfo, DominantColor } from '../types/dam';
import { 
  Sparkles, 
  X, 
  Check, 
  Loader2, 
  Tag, 
  Box, 
  Users, 
  Palette, 
  ArrowRight, 
  Layers, 
  AlertCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface BatchAiAutoTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: DAMAsset[];
  onApplyUpdates: (updatedAssets: DAMAsset[]) => void;
}

interface AssetProcessingState {
  id: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  originalTagCount: number;
  newTagsAdded: string[];
  detectedObjectsCount: number;
  hasPeopleDetected: boolean;
  error?: string;
}

// Convert image URL to Base64 for Gemini Vision payload
async function imageUrlToBase64(url: string): Promise<{ base64?: string; mimeType?: string }> {
  try {
    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      return { base64: parts[1], mimeType };
    }
    const res = await fetch(url);
    if (!res.ok) return {};
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.startsWith('data:')) {
          const parts = result.split(',');
          const mimeType = parts[0].match(/:(.*?);/)?.[1] || blob.type || 'image/jpeg';
          resolve({ base64: parts[1], mimeType });
        } else {
          resolve({});
        }
      };
      reader.onerror = () => resolve({});
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return {};
  }
}

export const BatchAiAutoTagModal: React.FC<BatchAiAutoTagModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onApplyUpdates,
}) => {
  if (!isOpen || selectedAssets.length === 0) return null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAssetIndex, setCurrentAssetIndex] = useState<number>(-1);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');
  const [updateDescriptions, setUpdateDescriptions] = useState(true);
  const [updateColors, setUpdateColors] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Track progress and result for each asset
  const [assetStates, setAssetStates] = useState<Record<string, AssetProcessingState>>(() => {
    const initial: Record<string, AssetProcessingState> = {};
    selectedAssets.forEach((a) => {
      initial[a.id] = {
        id: a.id,
        status: 'idle',
        originalTagCount: a.tags.length,
        newTagsAdded: [],
        detectedObjectsCount: a.detectedObjects.length,
        hasPeopleDetected: a.detectedFaces.hasPeople,
      };
    });
    return initial;
  });

  // Staged updated assets list
  const [stagedAssets, setStagedAssets] = useState<DAMAsset[]>(selectedAssets);

  // Execute Batch Auto-Tagging
  const handleStartAutoTagging = async () => {
    setIsProcessing(true);
    setIsFinished(false);
    const updatedList: DAMAsset[] = [...stagedAssets];

    for (let i = 0; i < selectedAssets.length; i++) {
      const asset = selectedAssets[i];
      setCurrentAssetIndex(i);
      setProgressStatus(`Analyzing ${i + 1}/${selectedAssets.length}: "${asset.title}" with Gemini Vision...`);

      setAssetStates((prev) => ({
        ...prev,
        [asset.id]: { ...prev[asset.id], status: 'processing' },
      }));

      try {
        // Try to fetch image base64 if available
        let imageBase64: string | undefined = undefined;
        let mimeType: string | undefined = undefined;
        if (asset.previewUrl) {
          const imgData = await imageUrlToBase64(asset.previewUrl);
          imageBase64 = imgData.base64;
          mimeType = imgData.mimeType;
        }

        const res = await fetch('/api/ai/analyze-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: asset.title,
            description: asset.descriptionEn || asset.descriptionTh,
            category: asset.category,
            brand: asset.brand,
            imageBase64,
            mimeType,
          }),
        });

        const data = await res.json();

        if (data.success && data.analysis) {
          const analysis = data.analysis;

          // Merge or replace tags
          const returnedTags: string[] = Array.isArray(analysis.autoTags) ? analysis.autoTags : [];
          let finalTags: string[] = [];
          let addedTags: string[] = [];

          if (mergeMode === 'merge') {
            const existingSet = new Set(asset.tags.map((t) => t.toLowerCase()));
            addedTags = returnedTags.filter((t) => !existingSet.has(t.toLowerCase()));
            finalTags = Array.from(new Set([...asset.tags, ...returnedTags]));
          } else {
            finalTags = returnedTags;
            addedTags = returnedTags;
          }

          // Merge objects
          const returnedObjects: DetectedObject[] = Array.isArray(analysis.detectedObjects)
            ? analysis.detectedObjects.map((o: any) => ({
                label: o.label || 'Entity',
                confidence: typeof o.confidence === 'number' ? o.confidence : 0.95,
                category: o.category || 'Product',
                box: o.box,
              }))
            : asset.detectedObjects;

          // Merge detected faces
          const returnedFaces: DetectedFacesInfo = analysis.detectedFaces
            ? {
                count: typeof analysis.detectedFaces.count === 'number' ? analysis.detectedFaces.count : 0,
                hasPeople: Boolean(analysis.detectedFaces.hasPeople),
                expression: analysis.detectedFaces.expression || asset.detectedFaces.expression,
                sceneContext: analysis.detectedFaces.sceneContext || asset.detectedFaces.sceneContext,
              }
            : asset.detectedFaces;

          // Merge dominant colors
          let returnedColors: DominantColor[] = asset.dominantColors;
          if (updateColors && Array.isArray(analysis.dominantColors)) {
            const colorList: DominantColor[] = analysis.dominantColors.map((hex: string, idx: number) => ({
              hex,
              name: idx === 0 ? 'Primary Brand Hue' : idx === 1 ? 'Secondary Accent' : 'Tertiary Tone',
            }));
            if (colorList.length > 0) {
              returnedColors = colorList;
            }
          }

          // Descriptions
          const descEn = updateDescriptions && analysis.contentSummaryEn ? analysis.contentSummaryEn : asset.descriptionEn;
          const descTh = updateDescriptions && analysis.contentSummaryTh ? analysis.contentSummaryTh : asset.descriptionTh;

          // Build modified asset
          const updatedAsset: DAMAsset = {
            ...asset,
            tags: finalTags,
            detectedObjects: returnedObjects.length > 0 ? returnedObjects : asset.detectedObjects,
            detectedFaces: returnedFaces,
            dominantColors: returnedColors,
            descriptionEn: descEn,
            descriptionTh: descTh,
            marketSuitability: analysis.marketSuitability || asset.marketSuitability,
          };

          // Update in array
          const targetIdx = updatedList.findIndex((a) => a.id === asset.id);
          if (targetIdx !== -1) {
            updatedList[targetIdx] = updatedAsset;
          }

          // Update progress record
          setAssetStates((prev) => ({
            ...prev,
            [asset.id]: {
              ...prev[asset.id],
              status: 'done',
              newTagsAdded: addedTags,
              detectedObjectsCount: returnedObjects.length,
              hasPeopleDetected: returnedFaces.hasPeople,
            },
          }));
        } else {
          setAssetStates((prev) => ({
            ...prev,
            [asset.id]: { ...prev[asset.id], status: 'error', error: 'AI response incomplete' },
          }));
        }
      } catch (err: any) {
        console.error('Error auto-tagging asset:', err);
        setAssetStates((prev) => ({
          ...prev,
          [asset.id]: { ...prev[asset.id], status: 'error', error: err?.message || 'Network error' },
        }));
      }

      // Small throttle between calls for clean visualization
      await new Promise((r) => setTimeout(r, 400));
    }

    setStagedAssets(updatedList);
    setIsProcessing(false);
    setIsFinished(true);
    setCurrentAssetIndex(-1);
    setProgressStatus('AI Vision auto-tagging completed across all selected assets!');
  };

  const handleApplyAndSave = () => {
    onApplyUpdates(stagedAssets);
    onClose();
  };

  const totalNewTagsCount = Object.values(assetStates).reduce(
    (sum, s) => sum + s.newTagsAdded.length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-[var(--surface-card)] text-[var(--text-primary)] w-full max-w-3xl max-h-[92vh] rounded-[12px] shadow-2xl flex flex-col overflow-hidden border border-[var(--border-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--color-brand)]/20 text-[var(--color-brand)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">
                  AI Auto-Tagging & Vision Extraction
                </h2>
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {selectedAssets.length} Assets Selected
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                Multimodal Gemini 3.8 Flash Vision Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[8px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-[var(--text-primary)]">
          
          {/* Options Panel */}
          <div className="p-4 bg-[var(--surface-subtle)] rounded-[8px] border border-[var(--border-card)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider font-['Bricolage_Grotesque',sans-serif]">
                Vision Auto-Tagging Preferences
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-mono">Bilingual Thai / English</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-[var(--surface-card)] rounded-[6px] border border-[var(--border-card)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-[11px]">Tagging Mode</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {mergeMode === 'merge' ? 'Append new tags' : 'Overwrite old tags'}
                  </div>
                </div>
                <select
                  disabled={isProcessing || isFinished}
                  value={mergeMode}
                  onChange={(e) => setMergeMode(e.target.value as any)}
                  className="bg-[var(--surface-subtle)] px-2 py-1 rounded text-[11px] font-medium border border-[var(--border-card)] text-[var(--text-primary)] cursor-pointer"
                >
                  <option value="merge">Merge</option>
                  <option value="replace">Replace</option>
                </select>
              </div>

              <label className="p-2.5 bg-[var(--surface-card)] rounded-[6px] border border-[var(--border-card)] flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-[11px]">Bilingual Summaries</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Generate Thai & English</div>
                </div>
                <input
                  type="checkbox"
                  disabled={isProcessing || isFinished}
                  checked={updateDescriptions}
                  onChange={(e) => setUpdateDescriptions(e.target.checked)}
                  className="accent-[var(--color-brand)] cursor-pointer"
                />
              </label>

              <label className="p-2.5 bg-[var(--surface-card)] rounded-[6px] border border-[var(--border-card)] flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-[11px]">Color Breakdown</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Extract palette & hex</div>
                </div>
                <input
                  type="checkbox"
                  disabled={isProcessing || isFinished}
                  checked={updateColors}
                  onChange={(e) => setUpdateColors(e.target.checked)}
                  className="accent-[var(--color-brand)] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Real-time Progress Bar */}
          {isProcessing && (
            <div className="p-3.5 bg-[var(--surface-subtle)] border border-[var(--color-brand)]/30 rounded-[8px] space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--color-brand)] flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand)]" />
                  <span>{progressStatus}</span>
                </span>
                <span className="font-mono text-[var(--text-secondary)] text-[11px]">
                  {Math.round(((currentAssetIndex + 1) / selectedAssets.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[var(--surface-card)] rounded-full h-2 overflow-hidden border border-[var(--border-card)]">
                <div
                  className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentAssetIndex + 1) / selectedAssets.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Finished Success Banner */}
          {isFinished && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-[8px] flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-400 text-xs font-['Bricolage_Grotesque',sans-serif]">
                    Auto-Tagging Complete!
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Added {totalNewTagsCount} new vision tags and recognized beverage entities across {selectedAssets.length} assets.
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-[6px] bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                100% Processed
              </span>
            </div>
          )}

          {/* Assets Queue List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              <span>Selected Assets Queue</span>
              <span>Vision Status</span>
            </div>

            <div className="divide-y divide-[var(--border-card)] border border-[var(--border-card)] rounded-[8px] max-h-[300px] overflow-y-auto">
              {selectedAssets.map((asset, index) => {
                const state = assetStates[asset.id];
                const isCurrent = currentAssetIndex === index;

                return (
                  <div
                    key={asset.id}
                    className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-[var(--surface-hover)]'
                        : state?.status === 'done'
                        ? 'bg-emerald-500/5'
                        : 'hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[var(--surface-subtle)] border border-[var(--border-card)] shrink-0 relative">
                        <img src={asset.previewUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-white font-mono text-[8px] px-0.5">
                          .{asset.fileFormat}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[240px]">
                            {asset.title}
                          </h4>
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                            {asset.brand}
                          </span>
                        </div>

                        {/* Existing vs Added tags preview */}
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                          <span>{state?.originalTagCount || asset.tags.length} existing tags</span>
                          {state?.newTagsAdded && state.newTagsAdded.length > 0 && (
                            <>
                              <span className="opacity-40">·</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                +{state.newTagsAdded.length} new AI tags
                              </span>
                            </>
                          )}
                        </div>

                        {/* New tags chips preview */}
                        {state?.newTagsAdded && state.newTagsAdded.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {state.newTagsAdded.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.2 bg-[var(--surface-card)] text-[var(--text-primary)] rounded border border-[var(--border-card)] text-[9px] font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                            {state.newTagsAdded.length > 4 && (
                              <span className="text-[9px] text-[var(--text-secondary)] font-mono self-center">
                                +{state.newTagsAdded.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {state?.status === 'idle' && (
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono bg-[var(--surface-subtle)] px-2 py-0.5 rounded-[4px] border border-[var(--border-card)]">
                          Ready
                        </span>
                      )}
                      {state?.status === 'processing' && (
                        <span className="text-[10px] text-[var(--color-brand)] font-bold flex items-center gap-1 bg-[var(--color-brand)]/10 px-2 py-0.5 rounded-[4px] border border-[var(--color-brand)]/30">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Scanning...</span>
                        </span>
                      )}
                      {state?.status === 'done' && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-[4px] border border-emerald-500/30">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Analyzed</span>
                        </span>
                      )}
                      {state?.status === 'error' && (
                        <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-[4px] border border-red-500/30">
                          Error
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--border-card)] bg-[var(--surface-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!isFinished ? (
              <button
                type="button"
                onClick={handleStartAutoTagging}
                disabled={isProcessing}
                className="px-4 py-2 bg-[var(--color-brand)] hover:opacity-90 text-white text-xs font-semibold rounded-[8px] shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Vision Tags...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Trigger AI Auto-Tagging</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyAndSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-[8px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Apply & Save {totalNewTagsCount} Tags to DAM</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
