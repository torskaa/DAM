import React, { useState } from 'react';
import { DAMAsset, Collection } from '../types/dam';
import { AssetCard } from './AssetCard';
import { BulkRenameModal, BulkRenameUpdate } from './BulkRenameModal';
import { 
  LayoutGrid, 
  Grid3X3, 
  List, 
  Download, 
  Share2, 
  Sparkles, 
  X, 
  ArrowUpDown,
  FileCode,
  CheckSquare,
  Square,
  FolderPlus,
  Trash2,
  Star,
  Type
} from 'lucide-react';

interface AssetGridProps {
  assets: DAMAsset[];
  selectedIds: string[];
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenDetail: (asset: DAMAsset) => void;
  onBatchShare: (selectedAssets: DAMAsset[]) => void;
  onBatchDownload: (selectedAssets: DAMAsset[]) => void;
  onBatchAiTag: (selectedAssets: DAMAsset[]) => void;
  onBatchAddToCollection?: (selectedAssets: DAMAsset[]) => void;
  onBatchDelete?: (selectedIds: string[]) => void;
  onBatchRename?: (updates: BulkRenameUpdate[]) => void;
  onShareSingle: (asset: DAMAsset, e: React.MouseEvent) => void;
  onDownloadSingle: (asset: DAMAsset, e: React.MouseEvent) => void;
  semanticMatchScores?: Map<string, { score: number; reason: string }>;
  canDelete?: boolean;
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenDetail,
  onBatchShare,
  onBatchDownload,
  onBatchAiTag,
  onBatchAddToCollection,
  onBatchDelete,
  onBatchRename,
  onShareSingle,
  onDownloadSingle,
  semanticMatchScores,
  canDelete = false,
  activeCategory = 'ALL',
  onSelectCategory,
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'compact' | 'table'>('visual');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'size' | 'downloads'>('relevance');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const selectedAssets = assets.filter((a) => selectedIds.includes(a.id));
  const isAllSelected = assets.length > 0 && selectedIds.length === assets.length;

  // Spacebar Quick-View support: if user presses spacebar and has a selected asset, open detail
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        if (selectedAssets.length > 0) {
          e.preventDefault();
          onOpenDetail(selectedAssets[0]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAssets, onOpenDetail]);

  // Fastwork-style Category Ribbon options
  const categoryRibbon = [
    { id: 'ALL', label: 'All Items' },
    { id: 'Logos & Identity', label: 'Logos & Identity' },
    { id: 'Packaging', label: 'Packaging & Dielines' },
    { id: 'Campaign Imagery', label: 'Campaign Visuals' },
    { id: 'POSM & Retail', label: 'POSM & Retail' },
    { id: 'Guidelines & Print', label: 'Guidelines & Print' },
  ];

  // Sorting
  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'relevance' && semanticMatchScores) {
      const scoreA = semanticMatchScores.get(a.id)?.score || 0;
      const scoreB = semanticMatchScores.get(b.id)?.score || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }
    if (sortBy === 'newest') {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
    if (sortBy === 'size') {
      return b.fileSizeBytes - a.fileSizeBytes;
    }
    if (sortBy === 'downloads') {
      return b.downloadsCount - a.downloadsCount;
    }
    return 0;
  });

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Fastwork.co Style Horizontal Category Ribbon */}
      {onSelectCategory && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-card)]">
          {categoryRibbon.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[var(--color-brand)] text-white shadow-xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid Controls Header (Dub.co Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-card)]">
        
        {/* Left: Total Results count & Select All */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--text-secondary)] font-mono tabular-nums">
            {assets.length} {assets.length === 1 ? 'file' : 'files'}
          </span>

          <span className="opacity-20">·</span>

          <button
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-[var(--color-brand)]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            )}
            <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        {/* Right: Sort By & View Density Modes (Dub.co Style) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-medium text-[var(--text-primary)] border-none outline-none cursor-pointer pr-1"
            >
              <option value="relevance" className="bg-[var(--surface-card)] text-[var(--text-primary)]">Sort: AI Relevance</option>
              <option value="newest" className="bg-[var(--surface-card)] text-[var(--text-primary)]">Sort: Newest Uploads</option>
              <option value="size" className="bg-[var(--surface-card)] text-[var(--text-primary)]">Sort: File Size</option>
              <option value="downloads" className="bg-[var(--surface-card)] text-[var(--text-primary)]">Sort: Most Downloaded</option>
            </select>
          </div>

          <div className="h-3.5 w-px bg-[var(--border-card)]" />

          {/* View Mode Segmented Controls (Dub.co Style) */}
          <div className="flex items-center p-0.5 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-card)]">
            <button
              onClick={() => setViewMode('visual')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-[var(--surface-card)] text-[var(--color-brand)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Comfortable Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-[var(--surface-card)] text-[var(--color-brand)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Compact Grid"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--surface-card)] text-[var(--color-brand)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="List & Spreadsheet View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Batch Selection Bar (Dub.co Island Style) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-[#170345] text-white rounded-xl border border-[#3410D5] p-2.5 px-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold font-mono tabular-nums bg-white/15 px-2 py-0.5 rounded-md text-[#CAEB0E]">
              {selectedIds.length} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-[#CCC6FB] hover:text-white text-xs underline cursor-pointer"
            >
              Deselect
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onBatchShare(selectedAssets)}
              className="px-3 py-1.5 bg-[var(--color-brand)] hover:brightness-110 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Expiring Link</span>
            </button>

            <button
              onClick={() => onBatchDownload(selectedAssets)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.ZIP)</span>
            </button>

            {onBatchAddToCollection && (
              <button
                onClick={() => onBatchAddToCollection(selectedAssets)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add to Kit</span>
              </button>
            )}

            <button
              onClick={() => onBatchAiTag(selectedAssets)}
              className="px-3 py-1.5 bg-[#CAEB0E]/20 hover:bg-[#CAEB0E]/30 text-[#CAEB0E] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Trigger AI vision auto-tagging for selected assets"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#CAEB0E]" />
              <span>AI Auto-Tag</span>
            </button>

            {onBatchRename && (
              <button
                onClick={() => setIsRenameModalOpen(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>
            )}

            {canDelete && onBatchDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedIds.length} assets?`)) {
                    onBatchDelete(selectedIds);
                  }
                }}
                className="px-3 py-1.5 bg-[#E03434]/20 hover:bg-[#E03434]/30 text-[#E03434] text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedAssets.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[12px] border border-black/[0.08] p-8">
          <FileCode className="w-12 h-12 text-stone mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-base font-bold text-charcoal">No assets match your search or filters</h3>
          <p className="text-xs text-graphite max-w-md mx-auto mt-1 mb-5">
            Try adjusting your search query, clearing the AI object filter, or selecting "All Categories".
          </p>
          <button
            onClick={onClearSelection}
            className="notion-btn-primary rounded-[8px] cursor-pointer"
          >
            Show All Assets
          </button>
        </div>
      )}

      {/* View Mode: Visual Cards Grid (Dash.app Style) */}
      {viewMode === 'visual' && sortedAssets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedAssets.map((asset) => {
            const matchInfo = semanticMatchScores?.get(asset.id);
            return (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedIds.includes(asset.id)}
                onToggleSelect={onToggleSelect}
                onOpenDetail={onOpenDetail}
                onShareSingle={onShareSingle}
                onDownloadSingle={onDownloadSingle}
                matchScore={matchInfo?.score}
                matchReason={matchInfo?.reason}
              />
            );
          })}
        </div>
      )}

      {/* View Mode: Compact Grid */}
      {viewMode === 'compact' && sortedAssets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sortedAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isSelected={selectedIds.includes(asset.id)}
              onToggleSelect={onToggleSelect}
              onOpenDetail={onOpenDetail}
              onShareSingle={onShareSingle}
              onDownloadSingle={onDownloadSingle}
            />
          ))}
        </div>
      )}

      {/* View Mode: Spreadsheet / Table View with Tabular Figures */}
      {viewMode === 'table' && sortedAssets.length > 0 && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-card)] text-[var(--text-secondary)] font-semibold">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={isAllSelected ? onClearSelection : onSelectAll}
                    className="rounded border-[var(--border-card)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                  />
                </th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3 text-right">Size</th>
                <th className="py-2.5 px-3 text-right">Resolution</th>
                <th className="py-2.5 px-3 text-right">Downloads</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-card)]/40">
              {sortedAssets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                return (
                  <tr
                    key={asset.id}
                    onClick={() => onOpenDetail(asset)}
                    className={`hover:bg-[var(--surface-hover)] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[var(--surface-subtle)]/70' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggleSelect(asset.id, e as any)}
                        className="rounded border-[var(--border-card)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={asset.previewUrl}
                          alt={asset.title}
                          className="w-9 h-9 rounded object-cover border border-[var(--border-card)] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--text-primary)] truncate max-w-[200px]">{asset.title}</p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">{asset.filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[var(--text-primary)]">{asset.brand}</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">{asset.category}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--text-primary)]">.{asset.fileFormat}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--text-secondary)]">{asset.fileSize}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                      {asset.dimensions.width}x{asset.dimensions.height}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[var(--text-primary)] font-semibold">
                      {asset.downloadsCount}
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBatchAiTag([asset]);
                          }}
                          className="p-1.5 hover:bg-[var(--surface-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--color-brand)] cursor-pointer transition-colors"
                          title="Trigger AI Auto-Tagging"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#CAEB0E]" />
                        </button>
                        <button
                          onClick={(e) => onShareSingle(asset, e)}
                          className="p-1.5 hover:bg-[var(--surface-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDownloadSingle(asset, e)}
                          className="p-1.5 hover:bg-[var(--surface-subtle)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {onBatchRename && isRenameModalOpen && (
        <BulkRenameModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          selectedAssets={selectedAssets}
          onApplyRename={onBatchRename}
        />
      )}
    </div>
  );
};
