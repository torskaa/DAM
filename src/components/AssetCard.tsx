import React from 'react';
import { DAMAsset } from '../types/dam';
import { Eye, Download, Share2, Sparkles, Check, FileCode, Users } from 'lucide-react';

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
  return (
    <div
      onClick={() => onOpenDetail(asset)}
      className={`group relative bg-white rounded-[12px] border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSelected
          ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-xs'
          : 'border-black/[0.08] hover:border-black/[0.18] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-4/3 w-full bg-paper-warmth overflow-hidden">
        {asset.previewUrl ? (
          <img
            src={asset.previewUrl}
            alt={asset.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-paper-warmth text-stone gap-2">
            <FileCode className="w-8 h-8 stroke-[1.25]" />
            <span className="text-[11px] font-mono uppercase tracking-wider">{asset.fileFormat} Asset</span>
          </div>
        )}

        {/* Curator Relevance & Status Indicators */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10 pointer-events-none">
          {matchScore !== undefined && (
            <div className="bg-charcoal/90 backdrop-blur-md text-white text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-[4px] shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
              <span>{matchScore}% match</span>
            </div>
          )}
          {asset.approvalStatus && asset.approvalStatus !== 'Approved' && (
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-xs uppercase tracking-wider ${
              asset.approvalStatus === 'In Review'
                ? 'bg-marigold text-charcoal'
                : 'bg-charcoal/85 text-white'
            }`}>
              {asset.approvalStatus}
            </div>
          )}
          {asset.rights?.rightsStatus === 'Expiring Soon' && (
            <div className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-xs bg-coral text-white uppercase tracking-wider">
              Expiring Soon
            </div>
          )}
        </div>

        {/* Checkbox for Multi-select */}
        <div
          onClick={(e) => onToggleSelect(asset.id, e)}
          className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all z-20 ${
            isSelected
              ? 'bg-notion-blue border-notion-blue text-white scale-100 shadow-xs'
              : 'bg-white/95 backdrop-blur-xs border-stone/50 text-transparent opacity-0 group-hover:opacity-100 hover:border-notion-blue'
          }`}
          title={isSelected ? "Deselect asset" : "Select asset"}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>

        {/* Subtle Scrim & Studio Quick Actions on Hover */}
        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-4 z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(asset);
            }}
            className="px-2.5 py-1.5 bg-white text-charcoal hover:bg-sky-tint hover:text-notion-blue rounded-[8px] text-xs font-medium transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            title="Inspect Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={(e) => onShareSingle(asset, e)}
            className="p-1.5 bg-white text-charcoal hover:text-notion-blue hover:bg-sky-tint rounded-[8px] transition-colors cursor-pointer shadow-md"
            title="Create Share Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => onDownloadSingle(asset, e)}
            className="p-1.5 bg-white text-charcoal hover:bg-notion-blue hover:text-white rounded-[8px] transition-colors cursor-pointer shadow-md"
            title="Download Master"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Subjects / Composition note */}
        {asset.detectedFaces.hasPeople && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[4px] bg-charcoal/80 backdrop-blur-xs text-white text-[10px] flex items-center gap-1.5 font-medium">
            <Users className="w-3 h-3 text-stone" />
            <span>{asset.detectedFaces.count} {asset.detectedFaces.count === 1 ? 'Person' : 'People'}</span>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2 bg-white">
        <div>
          <h4 className="text-[13px] font-semibold text-charcoal truncate leading-snug group-hover:text-notion-blue transition-colors" title={asset.title}>
            {asset.title}
          </h4>
          <p className="text-[11px] text-stone font-mono truncate mt-0.5">
            {asset.filename}
          </p>
        </div>

        {/* Clean unboxed metadata with typographic separators */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone font-mono tabular-nums pt-2 border-t border-black/[0.06]">
          <span className="font-semibold text-charcoal uppercase">.{asset.fileFormat}</span>
          <span aria-hidden="true" className="text-black/20">·</span>
          <span>{asset.fileSize}</span>
          <span aria-hidden="true" className="text-black/20">·</span>
          <span>{asset.dimensions.width}×{asset.dimensions.height}</span>
          {asset.brand && (
            <>
              <span aria-hidden="true" className="text-black/20">·</span>
              <span className="font-sans font-medium text-graphite">{asset.brand}</span>
            </>
          )}
        </div>

        {/* Rights Territory & Expiry Status */}
        {asset.rights && (
          <div className="flex items-center justify-between text-[10px] text-stone font-mono pt-1">
            <span className="truncate">Rights: {asset.rights.rightsStatus} ({asset.rights.usageTerritory})</span>
            {asset.rights.rightsStatus === 'Expiring Soon' && (
              <span className="text-coral font-bold shrink-0">Exp: {asset.rights.licenseExpiresAt}</span>
            )}
          </div>
        )}

        {/* Curator match reason note */}
        {matchReason && (
          <p className="text-[11px] text-graphite line-clamp-1 italic pt-0.5 border-t border-black/[0.04]">
            "{matchReason}"
          </p>
        )}
      </div>
    </div>
  );
};
