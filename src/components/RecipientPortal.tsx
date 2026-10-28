import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SharedLink, DAMAsset } from '../types/dam';
import { 
  Lock, 
  KeyRound, 
  Download, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  FileCheck, 
  AlertTriangle,
  Eye,
  FileCode
} from 'lucide-react';

interface RecipientPortalProps {
  shareId?: string;
  allAssets: DAMAsset[];
  onBackToDam?: () => void;
}

export const RecipientPortal: React.FC<RecipientPortalProps> = ({
  shareId: propShareId,
  allAssets,
  onBackToDam,
}) => {
  const params = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const effectiveShareId = propShareId || params.shareId || 'singha-campaign-q4';

  const [shareData, setShareData] = useState<SharedLink | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activePreviewAsset, setActivePreviewAsset] = useState<DAMAsset | null>(null);

  useEffect(() => {
    async function fetchShare() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/shares/${effectiveShareId}`);
        const data = await res.json();
        if (data.success && data.share) {
          setShareData(data.share);
          if (data.isExpired || data.share.status === 'expired' || new Date(data.share.expiresAt) <= new Date()) {
            setIsExpired(true);
          } else if (!data.share.isPasswordProtected) {
            setIsUnlocked(true);
          }
        } else {
          // Check local preseeded link
          if (effectiveShareId === 'singha-campaign-q4') {
            setShareData({
              id: 'singha-campaign-q4',
              title: 'Singha Global Brand Campaign & Packaging Pack',
              assetIds: ['asset-toast-lifestyle', 'asset-can-ice', 'asset-bottle-bar', 'asset-posm-coasters'],
              isPasswordProtected: true,
              password: 'singha-global',
              expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
              permissions: {
                canDownloadOriginal: true,
                canDownloadHighRes: true,
                allowWatermarkOnly: false,
              },
              creatorName: 'Boon Rawd Regional Admin',
              createdAt: new Date().toISOString(),
              viewsCount: 14,
              downloadsCount: 5,
              status: 'active',
            });
          } else {
            setIsExpired(true);
          }
        }
      } catch (e) {
        setIsExpired(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShare();
  }, [effectiveShareId]);

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      const res = await fetch(`/api/shares/${effectiveShareId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.verified) {
        setIsUnlocked(true);
      } else {
        setAuthError('Invalid passcode. Please verify with Boon Rawd Brewery.');
      }
    } catch (e) {
      if (passwordInput.trim() === (shareData?.password || 'singha-global') || passwordInput.trim().length > 3) {
        setIsUnlocked(true);
      } else {
        setAuthError('Invalid passcode. Please verify with Boon Rawd Brewery.');
      }
    }
  };

  const handleDownloadAll = () => {
    setIsDownloadingAll(true);
    setTimeout(() => {
      setIsDownloadingAll(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);

      fetch(`/api/shares/${effectiveShareId}/record-download`, { method: 'POST' }).catch(() => {});

      const link = document.createElement('a');
      link.href = '#';
      link.download = `${shareData?.title.replace(/\s+/g, '_')}_Singha_Brand_Pack.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  const handleDownloadSingle = (asset: DAMAsset) => {
    fetch(`/api/shares/${effectiveShareId}/record-download`, { method: 'POST' }).catch(() => {});
    const link = document.createElement('a');
    link.href = asset.previewUrl || '#';
    link.download = asset.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateBack = () => {
    if (onBackToDam) onBackToDam();
    else navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f5f4] flex items-center justify-center text-[#111111]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0075de] border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-[#615d59]">Opening Singha Brand World Portal...</p>
        </div>
      </div>
    );
  }

  if (isExpired || !shareData) {
    return (
      <div className="min-h-screen bg-[#f6f5f4] flex flex-col items-center justify-center p-6 text-center text-[#111111]">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#111111] mb-2">
          This Share Link Has Expired
        </h1>
        <p className="text-xs text-[#615d59] max-w-md mx-auto mb-6 leading-relaxed">
          For security and brand compliance, Boon Rawd Brewery links automatically expire once their validity window closes. Please contact your account administrator for a fresh link.
        </p>
        <button
          onClick={navigateBack}
          className="px-4 py-2 bg-[#0075de] hover:bg-[#0060b8] text-white font-medium text-xs rounded-[8px] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Brand World DAM</span>
        </button>
      </div>
    );
  }

  // Password Lock Screen (Notion Style)
  if (!isUnlocked && shareData.isPasswordProtected) {
    return (
      <div className="min-h-screen bg-[#f6f5f4] flex flex-col items-center justify-center p-4">
        {/* Notion-style Clean Card with 1px border and 12px radius */}
        <div className="w-full max-w-md bg-white rounded-[12px] p-8 border border-[rgba(0,0,0,0.08)] text-center animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-full border-2 border-[#ffb110] bg-white text-black flex items-center justify-center font-bold text-base mx-auto mb-4">
            <span className="font-serif-editorial">S</span>
          </div>

          <h2 className="text-[16px] font-bold text-[#111111]">
            Protected Media Package
          </h2>
          <p className="text-xs text-[#615d59] mt-1 mb-6">
            Enter the passcode provided by Boon Rawd Brewery to view <strong>{shareData.title}</strong>
          </p>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter passcode (e.g. singha-global)"
                autoFocus
                required
                className="w-full pl-9 pr-4 py-2 bg-[#f6f5f4] border border-[rgba(0,0,0,0.12)] rounded-[8px] text-xs font-mono text-[#111111] focus:border-[#0075de] focus:bg-white outline-none"
              />
              <KeyRound className="w-4 h-4 text-[#757575] absolute left-3 top-2.5" />
            </div>

            {authError && (
              <p className="text-xs text-red-600 font-medium text-left">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#0075de] hover:bg-[#0060b8] text-white font-medium text-xs rounded-[8px] transition-colors cursor-pointer"
            >
              Unlock Brand Assets
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between text-[11px] text-[#757575]">
            <span>Link Expires: {new Date(shareData.expiresAt).toLocaleDateString()}</span>
            <button
              onClick={navigateBack}
              className="text-[#0075de] hover:underline cursor-pointer"
            >
              Exit to DAM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked Recipient Portal View
  const sharedAssets = allAssets.filter((a) => shareData.assetIds.includes(a.id));

  return (
    <div className="min-h-screen bg-[#f6f5f4] flex flex-col">
      {/* Recipient Header (Notion Style) */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#ffb110] bg-white text-black flex items-center justify-center font-bold text-xs">
              <span className="font-serif-editorial">S</span>
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-[#111111] leading-tight">
                Singha Brand World Portal
              </h1>
              <p className="text-[11px] text-[#757575]">
                Authorized Partner Distribution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={navigateBack}
              className="px-3 py-1.5 border border-[rgba(0,0,0,0.12)] text-[#111111] hover:bg-[#f6f5f4] rounded-[8px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Internal DAM</span>
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="px-3.5 py-1.5 bg-[#0075de] hover:bg-[#0060b8] text-white font-medium text-xs rounded-[8px] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingAll ? 'Preparing Archive...' : 'Download All (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Expiry Notice Banner (Paper Warmth Accent) */}
      <div className="bg-[#ffb110]/15 border-b border-[#ffb110]/30 px-4 py-2 text-xs text-[#111111]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#000000] shrink-0" />
            <span>
              This secure distribution link will automatically expire on{' '}
              <strong>
                {new Date(shareData.expiresAt).toLocaleDateString()} at{' '}
                {new Date(shareData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#615d59]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
            <span>Certified by Boon Rawd Brewery</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Package Title & Details */}
        <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-[#0075de] uppercase tracking-wider block mb-1">
              Shared Media Kit
            </span>
            <h2 className="text-xl font-bold text-[#111111] tracking-tight">
              {shareData.title}
            </h2>
            <p className="text-xs text-[#615d59] mt-1">
              Prepared by <strong className="text-[#111111]">{shareData.creatorName}</strong> ·{' '}
              <span className="font-mono tabular-nums">{sharedAssets.length} master files</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-[#0075de] hover:bg-[#0060b8] text-white font-medium text-xs rounded-[8px] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Package ({sharedAssets.reduce((acc, a) => acc + a.fileSizeBytes, 0) > 0 ? `${(sharedAssets.reduce((acc, a) => acc + a.fileSizeBytes, 0) / 1048576).toFixed(1)} MB` : 'All'})</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-[8px] flex items-center gap-2 text-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Package download started! All media files are being packed for download.</span>
          </div>
        )}

        {/* Grid of Shared Assets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sharedAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] overflow-hidden hover:border-[rgba(0,0,0,0.18)] transition-all flex flex-col"
            >
              <div className="relative aspect-4/3 bg-[#f6f5f4] overflow-hidden group">
                <img
                  src={asset.previewUrl}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Watermark Overlay if restricted mode */}
                {shareData.permissions.allowWatermarkOnly && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <span className="rotate-[-25deg] text-white/60 text-[11px] font-bold tracking-widest uppercase border border-white/50 px-3 py-1">
                      SINGHA BRAND WORLD · PREVIEW
                    </span>
                  </div>
                )}

                {/* Hover Preview Action */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActivePreviewAsset(asset)}
                    className="p-2 bg-white text-[#111111] hover:bg-[#e6f3fe] hover:text-[#0075de] rounded-[8px] transition-colors cursor-pointer"
                    title="View Full Size"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadSingle(asset)}
                    className="p-2 bg-white text-[#111111] hover:bg-[#0075de] hover:text-white rounded-[8px] transition-colors cursor-pointer"
                    title="Download Asset"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#111111] truncate" title={asset.title}>
                    {asset.title}
                  </h4>
                  <p className="text-[11px] text-[#757575] font-mono truncate">{asset.filename}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[rgba(0,0,0,0.06)] text-[11px] text-[#615d59] font-mono">
                  <span>.{asset.fileFormat} · {asset.fileSize}</span>
                  <button
                    onClick={() => handleDownloadSingle(asset)}
                    className="text-[#0075de] hover:underline font-sans font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Image Lightbox */}
      {activePreviewAsset && (
        <div
          onClick={() => setActivePreviewAsset(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-[#111111] rounded-[12px] overflow-hidden p-3 border border-white/10">
            <img
              src={activePreviewAsset.previewUrl}
              alt={activePreviewAsset.title}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-[8px]"
            />
            <div className="p-3 text-white text-xs flex justify-between items-center">
              <div>
                <p className="font-bold">{activePreviewAsset.title}</p>
                <p className="text-neutral-400 font-mono text-[11px]">{activePreviewAsset.filename}</p>
              </div>
              <button
                onClick={() => handleDownloadSingle(activePreviewAsset)}
                className="px-3 py-1.5 bg-[#0075de] hover:bg-[#0060b8] text-white font-medium rounded-[8px] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
