import React, { useState, useMemo } from 'react';
import { DAMAsset } from '../types/dam';
import { 
  Type, 
  Hash, 
  Replace, 
  Sparkles, 
  X, 
  ArrowRight, 
  FileText, 
  Check, 
  AlertCircle,
  HelpCircle,
  Layers,
  Wand2
} from 'lucide-react';

export interface BulkRenameUpdate {
  id: string;
  newTitle: string;
  newFilename: string;
}

interface BulkRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: DAMAsset[];
  onApplyRename: (updates: BulkRenameUpdate[]) => void;
}

type RenameMode = 'prefix_suffix' | 'sequence' | 'find_replace' | 'pattern';

export const BulkRenameModal: React.FC<BulkRenameModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onApplyRename,
}) => {
  const [mode, setMode] = useState<RenameMode>('sequence');

  // Mode: Prefix & Suffix
  const [prefix, setPrefix] = useState('Singha_');
  const [suffix, setSuffix] = useState('_Final');

  // Mode: Sequential Numbering
  const [baseName, setBaseName] = useState('Singha_Brand_Asset');
  const [startIndex, setStartIndex] = useState<number>(1);
  const [paddingDigits, setPaddingDigits] = useState<number>(2); // 2 => 01, 02; 3 => 001
  const [separator, setSeparator] = useState<string>('_');

  // Mode: Find and Replace
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);

  // Mode: Custom Pattern
  // Tags: {brand}, {original}, {n}, {category}, {ext}
  const [customPattern, setCustomPattern] = useState('{brand}_{original}_{n}');

  // Global modifiers
  const [caseFormat, setCaseFormat] = useState<'none' | 'upper' | 'lower' | 'title' | 'snake' | 'kebab'>('none');
  const [applyToTitle, setApplyToTitle] = useState(true);
  const [applyToFilename, setApplyToFilename] = useState(true);

  // Excluded asset IDs in this bulk operation (if user unchecks a row)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // Helper to get extension
  const getExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot) : '';
  };

  const getBaseFilename = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(0, lastDot) : filename;
  };

  // Helper for case formatting
  const applyCasing = (str: string, format: typeof caseFormat): string => {
    if (format === 'none') return str;
    if (format === 'upper') return str.toUpperCase();
    if (format === 'lower') return str.toLowerCase();
    if (format === 'title') {
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    if (format === 'snake') {
      return str
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
    }
    if (format === 'kebab') {
      return str
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
    }
    return str;
  };

  // Compute preview for all selected assets
  const previewUpdates = useMemo<BulkRenameUpdate[]>(() => {
    let counter = startIndex;

    return selectedAssets.map((asset) => {
      if (excludedIds.has(asset.id)) {
        return {
          id: asset.id,
          newTitle: asset.title,
          newFilename: asset.filename,
        };
      }

      const ext = getExtension(asset.filename);
      const originalBase = getBaseFilename(asset.filename);
      const originalTitle = asset.title;

      let computedTitle = originalTitle;
      let computedBaseFilename = originalBase;

      // Sequential formatting: e.g. 1 with padding 2 => "01"
      const paddedNum = String(counter).padStart(paddingDigits, '0');

      if (mode === 'prefix_suffix') {
        computedTitle = `${prefix}${originalTitle}${suffix}`;
        computedBaseFilename = `${prefix}${originalBase}${suffix}`;
      } else if (mode === 'sequence') {
        computedTitle = `${baseName}${separator}${paddedNum}`;
        computedBaseFilename = `${baseName}${separator}${paddedNum}`;
      } else if (mode === 'find_replace') {
        if (findText.length > 0) {
          try {
            const regex = new RegExp(
              findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              isCaseSensitive ? 'g' : 'gi'
            );
            computedTitle = originalTitle.replace(regex, replaceText);
            computedBaseFilename = originalBase.replace(regex, replaceText);
          } catch (e) {
            computedTitle = originalTitle;
            computedBaseFilename = originalBase;
          }
        }
      } else if (mode === 'pattern') {
        const replaceTokens = (sourceTemplate: string, originalText: string) => {
          return sourceTemplate
            .replace(/{brand}/gi, asset.brand)
            .replace(/{original}/gi, originalText)
            .replace(/{n}/gi, paddedNum)
            .replace(/{category}/gi, asset.category.replace(/[^a-zA-Z0-9]/g, '_'))
            .replace(/{ext}/gi, ext.replace('.', ''));
        };
        computedTitle = replaceTokens(customPattern, originalTitle);
        computedBaseFilename = replaceTokens(customPattern, originalBase);
      }

      // Apply case transformation
      computedTitle = applyCasing(computedTitle, caseFormat);
      computedBaseFilename = applyCasing(computedBaseFilename, caseFormat);

      // Final results depending on checkboxes
      const finalTitle = applyToTitle ? (computedTitle.trim() || asset.title) : asset.title;
      const finalFilename = applyToFilename 
        ? `${computedBaseFilename.trim() || originalBase}${ext}` 
        : asset.filename;

      counter++;

      return {
        id: asset.id,
        newTitle: finalTitle,
        newFilename: finalFilename,
      };
    });
  }, [
    selectedAssets,
    excludedIds,
    mode,
    prefix,
    suffix,
    baseName,
    startIndex,
    paddingDigits,
    separator,
    findText,
    replaceText,
    isCaseSensitive,
    customPattern,
    caseFormat,
    applyToTitle,
    applyToFilename,
  ]);

  if (!isOpen) return null;

  const activeCount = selectedAssets.filter((a) => !excludedIds.has(a.id)).length;

  const handleToggleExclude = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApply = () => {
    const validUpdates = previewUpdates.filter((u) => !excludedIds.has(u.id));
    onApplyRename(validUpdates);
    onClose();
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'campaign' | 'timestamp' | 'clean' | 'brand_prefix') => {
    if (preset === 'campaign') {
      setMode('sequence');
      setBaseName('Singha_Global_2026');
      setStartIndex(1);
      setPaddingDigits(2);
      setSeparator('_');
    } else if (preset === 'brand_prefix') {
      setMode('prefix_suffix');
      setPrefix('SINGHA_');
      setSuffix('_APPROVED');
    } else if (preset === 'clean') {
      setMode('find_replace');
      setFindText(' ');
      setReplaceText('_');
      setCaseFormat('none');
    } else if (preset === 'timestamp') {
      setMode('pattern');
      const year = new Date().getFullYear();
      setCustomPattern(`Singha_${year}_{original}_{n}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-neutral-900"
        style={{ fontFamily: 'var(--font-notioninter, sans-serif)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)] bg-[#fdfdfd]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#e6f3fe] text-[#0075de] flex items-center justify-center">
              <Type className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-neutral-900">
                  Bulk Rename Assets
                </h2>
                <span className="text-[11px] font-medium bg-[#e6f3fe] text-[#0075de] px-2 py-0.5 rounded-full">
                  {selectedAssets.length} Selected
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Apply consistent naming conventions, sequential numbers, or replacements across assets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-600">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <Wand2 className="w-3.5 h-3.5 text-[#0075de]" /> Quick Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('campaign')}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors font-medium text-[11px]"
            >
              Singha_Global_##
            </button>
            <button
              type="button"
              onClick={() => applyPreset('brand_prefix')}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors font-medium text-[11px]"
            >
              SINGHA_..._APPROVED
            </button>
            <button
              type="button"
              onClick={() => applyPreset('clean')}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors font-medium text-[11px]"
            >
              Replace Spaces with Underscores
            </button>
            <button
              type="button"
              onClick={() => applyPreset('timestamp')}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors font-medium text-[11px]"
            >
              Year Pattern
            </button>
          </div>

          {/* Mode Selector Tabs (Notion Pill/Tab style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f6f5f4] p-1 rounded-lg border border-[rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => setMode('sequence')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-xs font-medium transition-all ${
                mode === 'sequence'
                  ? 'bg-white text-neutral-900 shadow-xs border border-[rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Hash className="w-3.5 h-3.5 text-[#0075de]" />
              Sequential Numbering
            </button>

            <button
              type="button"
              onClick={() => setMode('prefix_suffix')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-xs font-medium transition-all ${
                mode === 'prefix_suffix'
                  ? 'bg-white text-neutral-900 shadow-xs border border-[rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-amber-500" />
              Prefix & Suffix
            </button>

            <button
              type="button"
              onClick={() => setMode('find_replace')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-xs font-medium transition-all ${
                mode === 'find_replace'
                  ? 'bg-white text-neutral-900 shadow-xs border border-[rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Replace className="w-3.5 h-3.5 text-emerald-600" />
              Find & Replace
            </button>

            <button
              type="button"
              onClick={() => setMode('pattern')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[6px] text-xs font-medium transition-all ${
                mode === 'pattern'
                  ? 'bg-white text-neutral-900 shadow-xs border border-[rgba(0,0,0,0.08)]'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Pattern Builder
            </button>
          </div>

          {/* Mode Configuration Form */}
          <div className="bg-[#fafafa] rounded-[10px] p-4 border border-[rgba(0,0,0,0.06)] space-y-4">
            {mode === 'sequence' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Base Name
                  </label>
                  <input
                    type="text"
                    value={baseName}
                    onChange={(e) => setBaseName(e.target.value)}
                    placeholder="e.g. Singha_Packaging_Can"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Base name applied to all items, followed by the sequential number.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={startIndex}
                    onChange={(e) => setStartIndex(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Padding & Separator
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={paddingDigits}
                      onChange={(e) => setPaddingDigits(parseInt(e.target.value))}
                      className="w-1/2 px-2 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de]"
                      title="Digit padding (e.g. 01 vs 001)"
                    >
                      <option value="1">1, 2, 3</option>
                      <option value="2">01, 02 (2 digits)</option>
                      <option value="3">001, 002 (3 digits)</option>
                      <option value="4">0001 (4 digits)</option>
                    </select>

                    <select
                      value={separator}
                      onChange={(e) => setSeparator(e.target.value)}
                      className="w-1/2 px-2 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de]"
                      title="Separator between base name and number"
                    >
                      <option value="_">_ (Underscore)</option>
                      <option value="-">- (Hyphen)</option>
                      <option value=" ">Space</option>
                      <option value="">No separator</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {mode === 'prefix_suffix' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Prefix (Add to beginning)
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. SINGHA_2026_"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Suffix (Add to end before extension)
                  </label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g. _Approved_v2"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                  />
                </div>
              </div>
            )}

            {mode === 'find_replace' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Find Text
                  </label>
                  <input
                    type="text"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="e.g. draft or 2025"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                  />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="case-sensitive"
                      checked={isCaseSensitive}
                      onChange={(e) => setIsCaseSensitive(e.target.checked)}
                      className="rounded text-[#0075de] focus:ring-[#0075de] cursor-pointer"
                    />
                    <label htmlFor="case-sensitive" className="text-[11px] text-neutral-600 cursor-pointer">
                      Match case strictly
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                    Replace With
                  </label>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="e.g. final or 2026"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]"
                  />
                </div>
              </div>
            )}

            {mode === 'pattern' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Custom Pattern Template
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="{brand}_{category}_{n}"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de] font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-600">Available tokens:</span>
                  <button
                    type="button"
                    onClick={() => setCustomPattern((p) => p + '{brand}')}
                    className="px-1.5 py-0.5 bg-neutral-200 hover:bg-neutral-300 rounded font-mono text-[10px]"
                  >
                    {'{brand}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPattern((p) => p + '_{original}')}
                    className="px-1.5 py-0.5 bg-neutral-200 hover:bg-neutral-300 rounded font-mono text-[10px]"
                  >
                    {'{original}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPattern((p) => p + '_{n}')}
                    className="px-1.5 py-0.5 bg-neutral-200 hover:bg-neutral-300 rounded font-mono text-[10px]"
                  >
                    {'{n}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomPattern((p) => p + '_{category}')}
                    className="px-1.5 py-0.5 bg-neutral-200 hover:bg-neutral-300 rounded font-mono text-[10px]"
                  >
                    {'{category}'}
                  </button>
                </div>
              </div>
            )}

            {/* Additional formatting options */}
            <div className="pt-3 border-t border-[rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToTitle}
                    onChange={(e) => setApplyToTitle(e.target.checked)}
                    className="rounded text-[#0075de] focus:ring-[#0075de]"
                  />
                  <span className="text-neutral-700">Apply to Asset Title</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyToFilename}
                    onChange={(e) => setApplyToFilename(e.target.checked)}
                    className="rounded text-[#0075de] focus:ring-[#0075de]"
                  />
                  <span className="text-neutral-700">Apply to Filename (keeps file extension)</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-medium text-[11px]">Casing:</span>
                <select
                  value={caseFormat}
                  onChange={(e) => setCaseFormat(e.target.value as any)}
                  className="px-2 py-1 text-xs bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] focus:outline-none focus:border-[#0075de]"
                >
                  <option value="none">Preserve Original Case</option>
                  <option value="lower">lowercase</option>
                  <option value="upper">UPPERCASE</option>
                  <option value="title">Title Case</option>
                  <option value="snake">snake_case</option>
                  <option value="kebab">kebab-case</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Comparison Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Live Preview Table
                </h3>
                <span className="text-[11px] text-neutral-400">
                  ({activeCount} of {selectedAssets.length} will be renamed)
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                Uncheck any asset to exclude it from renaming
              </span>
            </div>

            <div className="border border-[rgba(0,0,0,0.08)] rounded-[8px] overflow-hidden bg-white shadow-xs">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f6f5f4] text-neutral-600 font-semibold border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <Check className="w-3.5 h-3.5 mx-auto text-neutral-400" />
                      </th>
                      <th className="py-2.5 px-3">Original Asset</th>
                      <th className="py-2.5 px-3 text-center w-8"></th>
                      <th className="py-2.5 px-3">New Result Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.05)]">
                    {previewUpdates.map((update, idx) => {
                      const asset = selectedAssets.find((a) => a.id === update.id);
                      if (!asset) return null;
                      const isExcluded = excludedIds.has(asset.id);

                      return (
                        <tr
                          key={asset.id}
                          className={`hover:bg-neutral-50/80 transition-colors ${
                            isExcluded ? 'opacity-40 bg-neutral-50' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={!isExcluded}
                              onChange={() => handleToggleExclude(asset.id)}
                              className="rounded text-[#0075de] focus:ring-[#0075de] cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2.5">
                              {asset.previewUrl ? (
                                <img
                                  src={asset.previewUrl}
                                  alt=""
                                  className="w-7 h-7 rounded object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {asset.fileFormat}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-medium text-neutral-900 truncate max-w-[200px]">
                                  {asset.title}
                                </div>
                                <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[200px]">
                                  {asset.filename}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2 px-1 text-center text-neutral-300">
                            <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                          </td>

                          <td className="py-2 px-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-neutral-900 truncate max-w-[280px] flex items-center gap-1.5">
                                <span>{update.newTitle}</span>
                                {update.newTitle !== asset.title && (
                                  <span className="text-[9px] bg-[#e6f3fe] text-[#0075de] font-mono px-1 rounded font-normal">
                                    title changed
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#0075de] font-mono truncate max-w-[280px]">
                                {update.newFilename}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(0,0,0,0.08)] bg-[#fdfdfd]">
          <div className="text-xs text-neutral-500">
            Applying to <span className="font-bold text-neutral-800">{activeCount}</span> assets. Original files are safely preserved.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={activeCount === 0}
              className="px-4 py-2 rounded-[8px] text-xs font-semibold bg-[#0075de] text-white hover:bg-[#0060b9] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Rename ({activeCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
