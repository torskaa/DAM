import React, { useState } from 'react';
import { DAMAsset } from '../types/dam';
import { Eye, Download, Share2, Sparkles, Check, FileCode, Users, Copy, CheckCheck } from 'lucide-react';

interface AssetCardProps {
  asset: DAMAsset;
  isSelected: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onOpenDetail: (asset: DAMAsset) => void;
  onShareSingle: (asset: DAMAsset, e: React.MouseEvent) => void;
  onDownloadSingle: (asset: DAMAsset, e: React.MouseEvent) => void;
  matchScore?: number;
  matchReason?: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onToggleSelect,
  onOpenDetail,
  onShareSingle,
  onDownloadSingle,
  matchScore,
  matchReason,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleQuickCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/share/quick-${asset.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <div
      onClick={() => onOpenDetail(asset)}
      className={`group relative bg-[var(--surface-card)] rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSelected
          ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-sm'
          : 'border-[var(--border-card)] hover:border-[var(--color-brand)]/40 hover:shadow-[0_8px_24px_rgba(89,69,241,0.08)]'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-4/3 w-full bg-[var(--surface-subtle)] overflow-hidden select-none">
        {asset.previewUrl ? (
          <img
            src={asset.previewUrl}
            alt={asset.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--surface-subtle)] text-[var(--text-secondary)] gap-2">
            <FileCode className="w-8 h-8 stroke-[1.25]" />
            <span className="text-[11px] font-mono uppercase tracking-wider">.{asset.fileFormat} File</span>
          </div>
        )}

        {/* Top Badges: Match Score & Clean Status Indicator (Fastwork style) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10 pointer-events-none">
          {matchScore !== undefined && (
            <div className="bg-black/80 backdrop-blur-md text-white text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CAEB0E]" />
              <span>{matchScore}% match</span>
            </div>
          )}

          {/* Minimal status indicator with subtle dot */}
          {asset.approvalStatus && asset.approvalStatus !== 'Approved' && (
            <div className="bg-[var(--surface-card)]/90 backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-card)] text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${asset.approvalStatus === 'In Review' ? 'bg-[#CAEB0E]' : 'bg-[var(--text-muted)]'}`} />
              <span>{asset.approvalStatus}</span>
            </div>
          )}

          {asset.rights?.rightsStatus === 'Expiring Soon' && (
            <div className="bg-[#E03434]/95 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Expiring Rights</span>
            </div>
          )}
        </div>

        {/* Multi-select Checkbox (Dub.co style top-left) */}
        <div
          onClick={(e) => onToggleSelect(asset.id, e)}
          className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all z-20 ${
            isSelected
              ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white scale-100 shadow-xs'
              : 'bg-[var(--surface-card)]/90 backdrop-blur-xs border-[var(--border-card)] text-transparent opacity-0 group-hover:opacity-100 hover:border-[var(--color-brand)]'
          }`}
          title={isSelected ? "Deselect" : "Select"}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>

        {/* Floating Action Island on Hover (Dub.co Style) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(asset);
            }}
            className="px-2.5 py-1 bg-[var(--surface-card)]/95 text-[var(--text-primary)] hover:text-[var(--color-brand)] border border-[var(--border-card)] backdrop-blur-xs rounded-md text-[11px] font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            title="Inspect Asset (Space to Quick View)"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span>Preview</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleQuickCopy}
              className="p-1.5 bg-[var(--surface-card)]/95 text-[var(--text-primary)] hover:text-[var(--color-brand)] border border-[var(--border-card)] backdrop-blur-xs rounded-md transition-colors cursor-pointer shadow-sm"
              title={copiedLink ? "Link Copied!" : "Copy Quick Link"}
            >
              {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => onShareSingle(asset, e)}
              className="p-1.5 bg-[var(--surface-card)]/95 text-[var(--text-primary)] hover:text-[var(--color-brand)] border border-[var(--border-card)] backdrop-blur-xs rounded-md transition-colors cursor-pointer shadow-sm"
              title="Share Expiring Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => onDownloadSingle(asset, e)}
              className="p-1.5 bg-[var(--surface-card)]/95 text-[var(--text-primary)] hover:text-[var(--color-brand)] border border-[var(--border-card)] backdrop-blur-xs rounded-md transition-colors cursor-pointer shadow-sm"
              title="Download Master"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Person count indicator */}
        {asset.detectedFaces.hasPeople && (
          <div className="absolute top-2.5 left-9 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1 pointer-events-none opacity-90 group-hover:opacity-0 transition-opacity">
            <Users className="w-3 h-3 text-stone-300" />
            <span>{asset.detectedFaces.count}</span>
          </div>
        )}
      </div>

      {/* Card Content & Zero-Pill Typography */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-[var(--surface-card)]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[13px] font-semibold text-[var(--text-primary)] truncate leading-tight group-hover:text-[var(--color-brand)] transition-colors" title={asset.title}>
              {asset.title}
            </h4>
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase shrink-0">
              .{asset.fileFormat}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate mt-0.5">
            {asset.filename}
          </p>
        </div>

        {/* Clean unboxed metadata line with typographic separators (anti-slop rule) */}
        <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono tabular-nums">
          <div className="flex items-center gap-1.5 truncate">
            <span>{asset.brand}</span>
            <span aria-hidden="true" className="opacity-30">·</span>
            <span>{asset.fileSize}</span>
            <span aria-hidden="true" className="opacity-30">·</span>
            <span>{asset.dimensions.width}×{asset.dimensions.height}</span>
          </div>

          <div className="text-[10px] text-[var(--text-muted)] shrink-0 pl-1 font-sans">
            {asset.downloadsCount > 0 && (
              <span>{asset.downloadsCount} dl</span>
            )}
          </div>
        </div>

        {/* Rights Territory / DRM state */}
        {asset.rights && (
          <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono pt-1 border-t border-[var(--border-card)]/50">
            <span className="truncate">Rights: {asset.rights.usageTerritory}</span>
            {asset.rights.rightsStatus === 'Expiring Soon' ? (
              <span className="text-[#E03434] font-semibold">Exp: {asset.rights.licenseExpiresAt}</span>
            ) : (
              <span className="text-[var(--text-muted)]">Cleared</span>
            )}
          </div>
        )}

        {/* Match reason from AI semantic search */}
        {matchReason && (
          <p className="text-[11px] text-[var(--color-brand)] line-clamp-1 italic pt-1 border-t border-[var(--border-card)] bg-[var(--surface-subtle)] -mx-3.5 -mb-3.5 p-2 px-3.5">
            "{matchReason}"
          </p>
        )}
      </div>
    </div>
  );
};
