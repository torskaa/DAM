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
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'compact' | 'table'>('visual');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'size' | 'downloads'>('relevance');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const selectedAssets = assets.filter((a) => selectedIds.includes(a.id));
  const isAllSelected = assets.length > 0 && selectedIds.length === assets.length;

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
      {/* Grid Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        
        {/* Left: Total Results count & Select All */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-neutral-600 font-mono tabular-nums">
            {assets.length} Results
          </span>

          <button
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Square className="w-3.5 h-3.5 text-neutral-600" />
            )}
            <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        {/* Right: Sort By & View Modes */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-neutral-800 border-none outline-none cursor-pointer pr-2"
            >
              <option value="relevance">Most Relevant / AI Rank</option>
              <option value="newest">Newest Uploads</option>
              <option value="size">File Size (Largest)</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>

          <div className="h-4 w-px bg-neutral-200" />

          {/* View Mode Segmented Controls */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-md">
            <button
              onClick={() => setViewMode('visual')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Visual Cards (Dash.app Style)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Compact Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Spreadsheet / Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Batch Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 bg-charcoal text-white rounded-[12px] border border-stone/30 p-2.5 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold font-mono tabular-nums">
              {selectedIds.length} {selectedIds.length === 1 ? 'asset' : 'assets'} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-stone hover:text-white text-xs underline cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onBatchShare(selectedAssets)}
              className="px-3 py-1.5 bg-marigold hover:bg-saffron text-charcoal font-bold text-xs rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Create Expiring Share Link</span>
            </button>

            <button
              onClick={() => onBatchDownload(selectedAssets)}
              className="px-3 py-1.5 bg-charcoal hover:bg-black text-white border border-stone/40 text-xs font-medium rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.ZIP)</span>
            </button>

            {onBatchAddToCollection && (
              <button
                onClick={() => onBatchAddToCollection(selectedAssets)}
                className="px-3 py-1.5 bg-charcoal hover:bg-black text-white border border-stone/40 text-xs font-medium rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add to Collection</span>
              </button>
            )}

            <button
              onClick={() => onBatchAiTag(selectedAssets)}
              className="px-3 py-1.5 bg-charcoal hover:bg-black text-marigold border border-stone/40 text-xs font-medium rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Re-Scan</span>
            </button>

            {onBatchRename && (
              <button
                onClick={() => setIsRenameModalOpen(true)}
                className="px-3 py-1.5 bg-notion-blue hover:bg-signal-blue text-white text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Bulk rename selected assets"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Bulk Rename</span>
              </button>
            )}

            {canDelete && onBatchDelete && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedIds.length} assets?`)) {
                    onBatchDelete(selectedIds);
                  }
                }}
                className="px-3 py-1.5 bg-coral/20 hover:bg-coral/30 text-coral border border-coral/40 text-xs font-medium rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
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
        <div className="bg-white border border-black/[0.08] rounded-[12px] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-paper-warmth border-b border-black/[0.08] text-stone font-semibold">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={isAllSelected ? onClearSelection : onSelectAll}
                    className="rounded border-black/20 text-notion-blue focus:ring-notion-blue"
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
            <tbody className="divide-y divide-black/[0.04]">
              {sortedAssets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                return (
                  <tr
                    key={asset.id}
                    onClick={() => onOpenDetail(asset)}
                    className={`hover:bg-paper-warmth cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-tint/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggleSelect(asset.id, e as any)}
                        className="rounded border-black/20 text-notion-blue focus:ring-notion-blue"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={asset.previewUrl}
                          alt={asset.title}
                          className="w-9 h-9 rounded object-cover border border-neutral-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate max-w-[200px]">{asset.title}</p>
                          <p className="text-[11px] text-neutral-600 font-mono truncate">{asset.filename}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{asset.brand}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{asset.category}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-700">.{asset.fileFormat}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600">{asset.fileSize}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600">
                      {asset.dimensions.width}x{asset.dimensions.height}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                      {asset.downloadsCount}
                    </td>
                    <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => onShareSingle(asset, e)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 cursor-pointer"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDownloadSingle(asset, e)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 cursor-pointer"
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
