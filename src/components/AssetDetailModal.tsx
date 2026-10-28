import React, { useState } from 'react';
import { DAMAsset, UserSession, RolePermissions, AssetComment, ApprovalStatus } from '../types/dam';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Users, 
  Box, 
  Layers, 
  Calendar, 
  FileCode, 
  Clock, 
  RotateCcw,
  Palette,
  Star,
  MessageSquare,
  Send,
  Lock,
  Plus,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface AssetDetailModalProps {
  asset: DAMAsset | null;
  onClose: () => void;
  onOpenShare: (asset: DAMAsset) => void;
  onTagClick: (tag: string) => void;
  userSession: UserSession;
  userPermissions: RolePermissions;
  onToggleFavorite?: (assetId: string) => void;
  onAddComment?: (assetId: string, comment: AssetComment) => void;
  onRestoreVersion?: (assetId: string, versionNumber: string) => void;
  onUploadNewVersion?: (assetId: string, notes: string) => void;
  onUpdateApprovalStatus?: (assetId: string, status: ApprovalStatus) => void;
  onLaunchWatermark?: (asset: DAMAsset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onOpenShare,
  onTagClick,
  userSession,
  userPermissions,
  onToggleFavorite,
  onAddComment,
  onRestoreVersion,
  onUploadNewVersion,
  onUpdateApprovalStatus,
  onLaunchWatermark,
}) => {
  if (!asset) return null;

  const [activeTab, setActiveTab] = useState<'ai' | 'specs' | 'crop' | 'versions' | 'comments' | 'rights'>('ai');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isApprovalDropdownOpen, setIsApprovalDropdownOpen] = useState(false);
  const [rightsExtensionRequested, setRightsExtensionRequested] = useState(false);
  const [newVersionNotes, setNewVersionNotes] = useState('');
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleDownloadPreset = (presetName: string, isMaster = false) => {
    if (isMaster && !userPermissions.canDownloadMasterRaw) {
      alert(`Access Restricted: Your current role (${userSession.role}) is not authorized to download RAW vector source files. Switch to Brand Administrator or Content Creator.`);
      return;
    }

    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);

      const link = document.createElement('a');
      link.href = asset.previewUrl || '#';
      link.download = `${asset.title.replace(/\s+/g, '_')}_${presetName.toLowerCase()}.${asset.fileFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;

    const newComment: AssetComment = {
      id: `comm-${Date.now()}`,
      author: userSession.name,
      authorRole: userSession.role,
      text: commentText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today',
    };

    onAddComment(asset.id, newComment);
    setCommentText('');
  };

  const handleCommitNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNotes.trim() || !onUploadNewVersion) return;

    onUploadNewVersion(asset.id, newVersionNotes.trim());
    setNewVersionNotes('');
    setIsAddingVersion(false);
    setNotification('New version revision successfully committed!');
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-[12px] shadow-2xl flex flex-col overflow-hidden border border-black/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-paper-warmth">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
              .{asset.fileFormat}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-neutral-900 truncate" title={asset.title}>
                {asset.title}
              </h2>
              <p className="text-[11px] text-neutral-600 font-mono truncate">
                {asset.filename} · Brand: {asset.brand}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Approval Status Lifecycle Badge & Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (userPermissions.canApproveAssets || userSession.role === 'Global Brand Director' || userSession.role === 'Brand Administrator') {
                    setIsApprovalDropdownOpen(!isApprovalDropdownOpen);
                  }
                }}
                className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  asset.approvalStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : asset.approvalStatus === 'In Review'
                    ? 'bg-marigold/20 text-charcoal font-bold border-marigold/40'
                    : 'bg-paper-warmth text-stone border-black/[0.1]'
                }`}
                title="Governance Approval Status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{asset.approvalStatus || 'Approved'}</span>
                {(userPermissions.canApproveAssets || userSession.role === 'Global Brand Director' || userSession.role === 'Brand Administrator') && (
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                )}
              </button>

              {isApprovalDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsApprovalDropdownOpen(false)} />
                  <div className="absolute right-0 top-8 w-44 bg-white border border-black/[0.08] rounded-[10px] shadow-xl z-50 py-1 flex flex-col text-xs animate-in fade-in zoom-in-95">
                    <span className="px-3 py-1 text-[10px] font-bold text-stone uppercase tracking-wider">
                      Set Lifecycle Status
                    </span>
                    {(['Approved', 'In Review', 'Draft', 'Archived'] as ApprovalStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          if (onUpdateApprovalStatus) onUpdateApprovalStatus(asset.id, st);
                          setIsApprovalDropdownOpen(false);
                          setNotification(`Asset status updated to ${st}`);
                          setTimeout(() => setNotification(null), 2500);
                        }}
                        className={`px-3 py-1.5 text-left flex items-center justify-between hover:bg-paper-warmth transition-colors cursor-pointer ${
                          asset.approvalStatus === st ? 'text-notion-blue font-bold bg-sky-tint/50' : 'text-graphite'
                        }`}
                      >
                        <span>{st}</span>
                        {asset.approvalStatus === st && <Check className="w-3.5 h-3.5 text-notion-blue" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Launch Dynamic Watermark Studio Button */}
            {onLaunchWatermark && (
              <button
                onClick={() => onLaunchWatermark(asset)}
                className="px-2.5 py-1.5 text-xs font-semibold text-charcoal bg-white border border-black/[0.1] hover:bg-paper-warmth rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open Dynamic Watermark Studio"
              >
                <Sliders className="w-3.5 h-3.5 text-notion-blue" />
                <span>Watermark</span>
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(asset.id)}
                className={`p-1.5 rounded-[8px] border transition-colors cursor-pointer ${
                  asset.isFavorite
                    ? 'bg-amber-50 border-amber-300 text-amber-500'
                    : 'border-black/[0.08] text-stone hover:bg-paper-warmth hover:text-charcoal'
                }`}
                title={asset.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            {userPermissions.canCreateShareLinks ? (
              <button
                onClick={() => onOpenShare(asset)}
                className="px-3 py-1.5 text-xs font-semibold text-charcoal bg-white border border-black/[0.08] hover:bg-paper-warmth rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-graphite" />
                <span>Share Link</span>
              </button>
            ) : (
              <div 
                title="Sharing restricted for your role"
                className="px-3 py-1.5 text-xs font-semibold text-stone bg-paper-warmth border border-black/[0.08] rounded-[8px] flex items-center gap-1.5 cursor-not-allowed"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Share (Locked)</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone hover:text-charcoal hover:bg-paper-warmth rounded-[8px] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {notification && (
          <div className="px-6 py-2 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Modal Body: Left Preview, Right Inspector */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* Left Preview Pane */}
          <div className="lg:w-7/12 bg-neutral-950 flex flex-col justify-between relative overflow-hidden select-none">
            {/* Zoom Controls */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-xs rounded-md p-1 border border-white/10 text-white">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                className="p-1 hover:bg-white/20 rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1 hover:bg-white/20 rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:bg-white/20 rounded text-[10px] font-mono ml-0.5 cursor-pointer"
                title="Reset Zoom"
              >
                1:1
              </button>
            </div>

            {/* Image Stage */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div 
                className="relative transition-transform duration-200 origin-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={asset.previewUrl}
                  alt={asset.title}
                  className="max-h-[55vh] max-w-full object-contain rounded shadow-2xl"
                />

                {/* Object Detection Overlay Bounding Boxes */}
                {activeTab === 'ai' &&
                  asset.detectedObjects.map((obj, i) => {
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
                        className="absolute border border-amber-400 bg-amber-400/10 pointer-events-none rounded-xs flex items-start justify-start p-1"
                      >
                        <span className="bg-amber-400 text-neutral-950 text-[9px] font-bold px-1 rounded-xs tracking-tighter">
                          {obj.label} ({Math.round(obj.confidence * 100)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="bg-black/80 px-4 py-2 border-t border-white/10 text-white/70 text-[11px] font-mono flex items-center justify-between">
              <span>{asset.dimensions.width} × {asset.dimensions.height} PX</span>
              <span>{asset.colorSpace}</span>
              <span>{asset.resolutionDpi} DPI</span>
            </div>
          </div>

          {/* Right Inspector Tabs */}
          <div className="lg:w-5/12 flex flex-col bg-white border-l border-black/[0.08]">
            {/* Tab Navigation */}
            <div className="flex items-center border-b border-black/[0.08] px-4 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-3 px-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'ai'
                    ? 'border-notion-blue text-charcoal font-bold'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Insights</span>
              </button>

              <button
                onClick={() => setActiveTab('rights')}
                className={`py-3 px-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'rights'
                    ? 'border-notion-blue text-charcoal font-bold'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-notion-blue" />
                <span>Rights & DRM</span>
              </button>

              <button
                onClick={() => setActiveTab('crop')}
                className={`py-3 px-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'crop'
                    ? 'border-notion-blue text-charcoal font-bold'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>

              <button
                onClick={() => setActiveTab('specs')}
                className={`py-3 px-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-notion-blue text-charcoal font-bold'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>EXIF & Specs</span>
              </button>

              <button
                onClick={() => setActiveTab('versions')}
                className={`py-3 px-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'versions'
                    ? 'border-notion-blue text-charcoal font-bold'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>History ({asset.versions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'comments'
                    ? 'border-notion-blue text-charcoal font-bold'
                    : 'border-transparent text-stone hover:text-charcoal'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Notes ({asset.comments?.length || 0})</span>
              </button>
            </div>

            {/* Tab Content Container */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
              
              {/* TAB 1: AI Recognition & Insights */}
              {activeTab === 'ai' && (
                <div className="space-y-5">
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gemini Auto-Analysis</span>
                    </div>
                    <p className="text-neutral-800 leading-relaxed mb-1.5">{asset.descriptionTh}</p>
                    <p className="text-neutral-600 leading-relaxed italic">{asset.descriptionEn}</p>
                  </div>

                  {/* Detected Objects with Confidences */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-neutral-900 flex items-center gap-1">
                        <Box className="w-3.5 h-3.5 text-neutral-600" />
                        <span>Detected Objects & Entities</span>
                      </span>
                      <span className="text-[11px] text-neutral-600 font-mono">
                        {asset.detectedObjects.length} identified
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {asset.detectedObjects.map((obj, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-150"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">{obj.label}</span>
                            <span className="text-[10px] text-neutral-600 px-1.5 py-0.2 bg-neutral-200 rounded">
                              {obj.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#F5B800] h-full rounded-full"
                                style={{ width: `${obj.confidence * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] tabular-nums font-semibold text-neutral-700">
                              {Math.round(obj.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Face & People Recognition */}
                  <div>
                    <div className="flex items-center gap-1 font-bold text-neutral-900 mb-2">
                      <Users className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Face & Demographics Analysis</span>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600">People Present:</span>
                        <span className="font-semibold text-neutral-900 font-mono">
                          {asset.detectedFaces.hasPeople
                            ? `${asset.detectedFaces.count} Detected`
                            : 'No People (Product Shot)'}
                        </span>
                      </div>
                      {asset.detectedFaces.expression && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Sentiment / Atmosphere:</span>
                          <span className="font-semibold text-neutral-900">
                            {asset.detectedFaces.expression}
                          </span>
                        </div>
                      )}
                      {asset.detectedFaces.sceneContext && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600">Context:</span>
                          <span className="font-semibold text-neutral-900">
                            {asset.detectedFaces.sceneContext}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Generated Semantic Tags */}
                  <div>
                    <span className="font-bold text-neutral-900 block mb-2">
                      Auto-Generated Search Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            onTagClick(tag);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-[#F5B800] hover:text-neutral-950 text-neutral-700 text-xs transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dominant Brand Colors */}
                  <div>
                    <span className="font-bold text-neutral-900 block mb-2 flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Extracted Color Palette</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {asset.dominantColors.map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => handleCopyHex(color.hex)}
                          className="flex items-center justify-between p-2 rounded border border-neutral-200 hover:bg-neutral-50 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded border border-black/10 shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div>
                              <p className="font-semibold text-neutral-900 leading-tight">{color.name}</p>
                              {color.pantoneMatch && (
                                <p className="text-[10px] text-neutral-600">{color.pantoneMatch}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-[11px] text-neutral-600 flex items-center gap-1">
                            {copiedHex === color.hex ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {color.hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: RIGHTS & DRM */}
              {activeTab === 'rights' && (
                <div className="space-y-4">
                  <div className="p-3 bg-sky-tint border border-notion-blue/20 rounded-[8px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-notion-blue text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Talent & Legal Usage Passport</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                        asset.rights?.rightsStatus === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : asset.rights?.rightsStatus === 'Expiring Soon'
                          ? 'bg-marigold/30 text-charcoal'
                          : 'bg-paper-warmth text-stone'
                      }`}>
                        {asset.rights?.rightsStatus || 'Perpetual'}
                      </span>
                    </div>
                    <p className="text-[11px] text-graphite leading-relaxed">
                      Governs commercial brand rights, talent releases, photographer master licensing, and authorized geographic media channels.
                    </p>
                  </div>

                  <div className="divide-y divide-black/[0.06] border border-black/[0.08] rounded-[8px] overflow-hidden text-xs">
                    <div className="flex justify-between p-2.5 bg-paper-warmth">
                      <span className="text-stone">Usage Territory</span>
                      <span className="font-semibold text-charcoal">{asset.rights?.usageTerritory || 'Global'}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-white">
                      <span className="text-stone">Talent / Model Release</span>
                      <span className="font-medium text-charcoal">{asset.rights?.talentName || 'Corporate Trademark'}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-paper-warmth">
                      <span className="text-stone">Photographer / Production</span>
                      <span className="font-medium text-charcoal">{asset.rights?.photographer || 'Boon Rawd Production Studio'}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-white">
                      <span className="text-stone">Agency Custodian</span>
                      <span className="font-medium text-charcoal">{asset.rights?.agencyOwner || 'Boon Rawd In-House Marketing'}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-paper-warmth">
                      <span className="text-stone">Contract Agreement Ref</span>
                      <span className="font-mono font-bold text-charcoal">{asset.rights?.contractReference || 'BR-DAM-2026-REF'}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-white">
                      <span className="text-stone">License Expiration</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-charcoal">{asset.rights?.licenseExpiresAt || '2099-12-31'}</span>
                        {asset.rights?.rightsStatus === 'Expiring Soon' && (
                          <div className="text-[10px] text-coral font-bold mt-0.5">Expires in under 30 days!</div>
                        )}
                      </div>
                    </div>
                    <div className="p-2.5 bg-paper-warmth">
                      <span className="text-stone block mb-1.5">Permitted Media Channels</span>
                      <div className="flex flex-wrap gap-1">
                        {(asset.rights?.mediaChannels || ['Digital & Social', 'Print & POSM']).map((ch) => (
                          <span key={ch} className="px-2 py-0.5 bg-white border border-black/[0.08] rounded-[4px] text-[11px] font-medium text-charcoal">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRightsExtensionRequested(true);
                        setNotification('Rights extension request transmitted to Global Legal & Corporate Affairs.');
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      disabled={rightsExtensionRequested}
                      className="w-full py-2 px-3 rounded-[8px] border border-black/[0.1] bg-paper-warmth hover:bg-white text-xs font-semibold text-charcoal flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {rightsExtensionRequested ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Renewal Request Logged (Pending Legal Approval)</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5 text-notion-blue" />
                          <span>Request Contract / Territory Extension</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPORT & CROP */}
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  {/* Dynamic Watermark Studio Banner */}
                  {onLaunchWatermark && (
                    <div className="p-3 bg-paper-warmth border border-black/[0.08] rounded-[8px] flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-charcoal text-xs mb-0.5">
                          <Sliders className="w-3.5 h-3.5 text-notion-blue" />
                          <span>Dynamic Watermark Studio</span>
                        </div>
                        <p className="text-[11px] text-stone leading-snug">
                          {userSession.role === 'Agency Partner' 
                            ? 'Mandatory agency watermark applied to preserve brand IP.'
                            : 'Render diagonal security text, viewer ID, or official seals directly onto canvas.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onLaunchWatermark(asset)}
                        className="px-3 py-1.5 bg-notion-blue hover:bg-notion-blue/90 text-white rounded-[6px] text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                      >
                        Launch Studio
                      </button>
                    </div>
                  )}

                  <p className="text-stone leading-snug text-xs">
                    Download this asset transformed for different marketing channels or export in custom resolutions.
                  </p>

                  <div className="space-y-2">
                    {[
                      { name: 'Original Master File', desc: `Full resolution .${asset.fileFormat} (${asset.fileSize})`, type: 'ORIGINAL', master: true },
                      { name: 'High-Res Print (300 DPI CMYK)', desc: 'Pre-press ready for catalogs, banners and billboards', type: 'PRINT', master: false },
                      { name: 'Web Optimized JPEG (1920px)', desc: 'Compressed for high-speed website and e-commerce display', type: 'WEB', master: false },
                      { name: 'Instagram & Facebook Post (1080×1080)', desc: '1:1 square crop optimized for mobile social feeds', type: 'INSTAGRAM', master: false },
                      { name: 'Story / TikTok Vertical (1080×1920)', desc: '9:16 vertical full screen mobile video/story frame', type: 'STORY', master: false },
                    ].map((preset) => (
                      <button
                        key={preset.type}
                        onClick={() => handleDownloadPreset(preset.name, preset.master)}
                        disabled={isDownloading}
                        className="w-full text-left p-3 rounded-[8px] border border-black/[0.08] hover:border-notion-blue hover:bg-sky-tint/30 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-charcoal group-hover:text-notion-blue flex items-center gap-1.5">
                            <span>{preset.name}</span>
                            {preset.master && !userPermissions.canDownloadMasterRaw && (
                              <span className="text-[10px] text-coral font-mono font-normal">
                                (Requires Director/Admin)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone">{preset.desc}</p>
                        </div>
                        <Download className="w-4 h-4 text-stone group-hover:text-notion-blue shrink-0" />
                      </button>
                    ))}
                  </div>

                  {downloadSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-[8px] flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Download initiated successfully!</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXIF & SPECS */}
              {activeTab === 'specs' && (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="flex justify-between p-2.5 bg-neutral-50/50">
                    <span className="text-neutral-600">Asset ID</span>
                    <span className="font-mono font-semibold text-neutral-800">{asset.id}</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-neutral-600">File Format</span>
                    <span className="font-mono font-bold text-neutral-900">.{asset.fileFormat}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50/50">
                    <span className="text-neutral-600">File Size</span>
                    <span className="font-mono tabular-nums text-neutral-900">{asset.fileSize}</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-neutral-600">Resolution</span>
                    <span className="font-mono tabular-nums text-neutral-900">
                      {asset.dimensions.width} × {asset.dimensions.height} px
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50/50">
                    <span className="text-neutral-600">Print DPI</span>
                    <span className="font-mono tabular-nums text-neutral-900">{asset.resolutionDpi} DPI</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-neutral-600">Color Profile</span>
                    <span className="font-semibold text-neutral-900">{asset.colorSpace}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50/50">
                    <span className="text-neutral-600">Legal Classification</span>
                    <span className="font-semibold text-neutral-900">{asset.marketSuitability}</span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-neutral-600">Uploaded Date</span>
                    <span className="font-mono text-neutral-900">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-neutral-50/50">
                    <span className="text-neutral-600">Uploaded By</span>
                    <span className="text-neutral-900">{asset.uploadedBy}</span>
                  </div>
                </div>
              )}

              {/* TAB 4: VERSION HISTORY */}
              {activeTab === 'versions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 block">Version History & Revisions</span>
                      <span className="text-[11px] text-neutral-600">Active Version: v{asset.version}</span>
                    </div>
                    {userPermissions.canUpload && (
                      <button
                        onClick={() => setIsAddingVersion(!isAddingVersion)}
                        className="px-2.5 py-1 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold rounded text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Upload New Version</span>
                      </button>
                    )}
                  </div>

                  {isAddingVersion && (
                    <form onSubmit={handleCommitNewVersion} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
                      <span className="font-bold text-amber-950 block">Commit New Revision Notes</span>
                      <input
                        type="text"
                        required
                        value={newVersionNotes}
                        onChange={(e) => setNewVersionNotes(e.target.value)}
                        placeholder="e.g. Color balance calibrated for Singapore dark market"
                        className="w-full px-2.5 py-1.5 border border-amber-300 rounded text-xs bg-white"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddingVersion(false)}
                          className="px-2.5 py-1 text-neutral-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-neutral-900 text-white font-bold rounded"
                        >
                          Save Revision
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {asset.versions.map((ver, idx) => (
                      <div
                        key={ver.version}
                        className={`p-3 rounded-lg border ${
                          idx === 0
                            ? 'border-amber-300 bg-amber-50/40'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-900">v{ver.version}</span>
                            {idx === 0 ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#F5B800] text-neutral-950 rounded">
                                ACTIVE
                              </span>
                            ) : (
                              onRestoreVersion && (
                                <button
                                  onClick={() => onRestoreVersion(asset.id, ver.version)}
                                  className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Restore this version</span>
                                </button>
                              )
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-600 font-mono">{ver.uploadedAt}</span>
                        </div>
                        <p className="text-neutral-700 text-xs mb-1">{ver.notes}</p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-1 border-t border-neutral-100">
                          <span>By {ver.uploadedBy}</span>
                          <span className="font-mono">{ver.fileSize}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: COLLABORATION COMMENTS */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <span className="font-bold text-neutral-900 block">
                    Team Notes & Brand Approval Thread
                  </span>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto">
                    {(!asset.comments || asset.comments.length === 0) ? (
                      <p className="text-neutral-600 text-xs italic py-4 text-center">
                        No internal notes yet. Add compliance notes or campaign directives below.
                      </p>
                    ) : (
                      asset.comments.map((comm) => (
                        <div key={comm.id} className="p-2.5 rounded bg-neutral-50 border border-neutral-100 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">
                              {comm.author} <span className="text-neutral-600 font-normal">({comm.authorRole})</span>
                            </span>
                            <span className="text-[10px] text-neutral-600 font-mono">{comm.timestamp}</span>
                          </div>
                          <p className="text-neutral-800 text-xs">{comm.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handlePostComment} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      required
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={`Add note as ${userSession.role}...`}
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-xs text-neutral-900 focus:border-amber-400 outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-md flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Actions Drawer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              {userPermissions.canCreateShareLinks ? (
                <button
                  onClick={() => onOpenShare(asset)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Create Expiring Share Link</span>
                </button>
              ) : <div />}

              <button
                onClick={() => handleDownloadPreset('Original', true)}
                className="px-4 py-2 text-xs font-bold text-neutral-950 bg-[#F5B800] hover:bg-[#E5A900] rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Master</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
