import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAMAsset, SharedLink, SharePermissions } from '../types/dam';
import { 
  X, 
  Share2, 
  Lock, 
  Calendar, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  KeyRound, 
  Sparkles,
  FileCheck
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: DAMAsset[];
  onShareCreated: (newShare: SharedLink) => void;
  onOpenRecipientPortal: (shareId: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onShareCreated,
  onOpenRecipientPortal,
}) => {
  const navigate = useNavigate();
  if (!isOpen || selectedAssets.length === 0) return null;

  const [title, setTitle] = useState(
    selectedAssets.length === 1
      ? `${selectedAssets[0].title} - Asset Pack`
      : `Singha Brand World Assets Collection (${selectedAssets.length} Files)`
  );
  const [expiryOption, setExpiryOption] = useState<'24' | '168' | '720' | 'custom'>('168');
  const [customDays, setCustomDays] = useState(14);
  const [isPasswordProtected, setIsPasswordProtected] = useState(true);
  const [password, setPassword] = useState('singha-2026');
  const [permissions, setPermissions] = useState<SharePermissions>({
    canDownloadOriginal: true,
    canDownloadHighRes: true,
    allowWatermarkOnly: false,
  });
  const [recipientEmail, setRecipientEmail] = useState('');
  
  const [createdShare, setCreatedShare] = useState<SharedLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const generatePasscode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SINGHA-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(code);
  };

  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const hours =
      expiryOption === '24'
        ? 24
        : expiryOption === '168'
        ? 168
        : expiryOption === '720'
        ? 720
        : customDays * 24;

    try {
      const res = await fetch('/api/shares/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          assetIds: selectedAssets.map((a) => a.id),
          isPasswordProtected,
          password: isPasswordProtected ? password : '',
          expiresInHours: hours,
          permissions,
          recipientEmail,
          creatorName: 'Boon Rawd Regional Admin',
        }),
      });

      const data = await res.json();
      if (data.success && data.share) {
        setCreatedShare(data.share);
        onShareCreated(data.share);
      }
    } catch (err) {
      // Local fallback
      const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      const localShare: SharedLink = {
        id: `share-${Date.now().toString(36)}`,
        title,
        assetIds: selectedAssets.map((a) => a.id),
        isPasswordProtected,
        password: isPasswordProtected ? password : '',
        expiresAt,
        permissions,
        recipientEmail,
        creatorName: 'Boon Rawd Regional Admin',
        createdAt: new Date().toISOString(),
        viewsCount: 0,
        downloadsCount: 0,
        status: 'active',
      };
      setCreatedShare(localShare);
      onShareCreated(localShare);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getShareUrl = (id: string) => {
    return `${window.location.origin}/share/${id}`;
  };

  const copyToClipboard = (text: string, isPass = false) => {
    navigator.clipboard.writeText(text);
    if (isPass) {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-xl rounded-[12px] flex flex-col overflow-hidden border border-[rgba(0,0,0,0.08)] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)] bg-[#f6f5f4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#e6f3fe] text-[#0075de] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black leading-tight">
                Create Expiring Share Link
              </h2>
              <p className="text-xs text-[#615d59]">
                Secure link with password protection & cryptographic expiration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#757575] hover:text-black hover:bg-[rgba(0,0,0,0.05)] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Success Screen */}
        {!createdShare ? (
          <form onSubmit={handleCreateShare} className="p-6 space-y-5 text-xs">
            
            {/* Share Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-800 block">Share Package Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none text-xs text-neutral-900"
                placeholder="e.g. Singha Global Campaign Package Q4"
              />
            </div>

            {/* Selected Assets Preview Thumbnails */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-800">Assets Included</span>
                <span className="text-[11px] font-mono text-neutral-600 tabular-nums">
                  {selectedAssets.length} {selectedAssets.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {selectedAssets.slice(0, 6).map((asset) => (
                  <div
                    key={asset.id}
                    className="w-14 h-14 rounded-md border border-neutral-200 overflow-hidden shrink-0 relative group"
                    title={asset.title}
                  >
                    <img
                      src={asset.previewUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-mono text-center font-bold">
                      .{asset.fileFormat}
                    </span>
                  </div>
                ))}
                {selectedAssets.length > 6 && (
                  <div className="w-14 h-14 rounded-md border border-neutral-200 bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold shrink-0">
                    +{selectedAssets.length - 6}
                  </div>
                )}
              </div>
            </div>

            {/* Expiration Settings */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                <span>Link Expiration</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '24', label: '24 Hours' },
                  { id: '168', label: '7 Days' },
                  { id: '720', label: '30 Days' },
                  { id: 'custom', label: 'Custom' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExpiryOption(opt.id as any)}
                    className={`py-2 px-2 rounded-md border text-center font-medium transition-colors ${
                      expiryOption === opt.id
                        ? 'bg-neutral-900 border-neutral-900 text-white font-semibold'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {expiryOption === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-neutral-600">Expires in:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-neutral-300 rounded text-center font-mono"
                  />
                  <span className="text-neutral-600">days</span>
                </div>
              )}
            </div>

            {/* Password Protection */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                  <Lock className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Password Protection</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPasswordProtected}
                    onChange={(e) => setIsPasswordProtected(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F5B800]"></div>
                </label>
              </div>

              {isPasswordProtected && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter passphrase"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-md font-mono text-neutral-900 focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={generatePasscode}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md font-medium transition-colors cursor-pointer"
                  >
                    Generate Passcode
                  </button>
                </div>
              )}
            </div>

            {/* Permissions & Security Flags */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                <span>Recipient Permissions</span>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                  <input
                    type="checkbox"
                    checked={permissions.canDownloadOriginal}
                    onChange={(e) =>
                      setPermissions({ ...permissions, canDownloadOriginal: e.target.checked })
                    }
                    className="rounded border-neutral-300 text-amber-500"
                  />
                  <span>Allow High-Resolution & Original Vectors (.AI, .PSD, 300 DPI)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                  <input
                    type="checkbox"
                    checked={permissions.allowWatermarkOnly}
                    onChange={(e) =>
                      setPermissions({ ...permissions, allowWatermarkOnly: e.target.checked })
                    }
                    className="rounded border-neutral-300 text-amber-500"
                  />
                  <span>Display Singha Watermark on Unregistered Preview</span>
                </label>
              </div>
            </div>

            {/* Recipient Email (Optional) */}
            <div className="space-y-1 pt-2 border-t border-neutral-100">
              <label className="font-semibold text-neutral-800 block">Recipient Email (Optional notification)</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="agency.partner@creativemedia.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:border-amber-400 outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-[rgba(0,0,0,0.08)] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[rgba(0,0,0,0.15)] text-black hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="notion-btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Generating Secure Link...' : 'Generate Share Link'}
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen with Copy Link & Passcode */
          <div className="p-6 space-y-5 text-xs">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#e6f3fe] text-[#0075de] flex items-center justify-center mx-auto mb-2">
                <FileCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-black">Secure Share Link Created!</h3>
              <p className="text-[#615d59] text-xs mt-0.5 font-['Lyon_Text',Georgia,serif]">
                This link will automatically expire on{' '}
                <strong className="text-black font-sans font-medium">
                  {new Date(createdShare.expiresAt).toLocaleDateString()} at{' '}
                  {new Date(createdShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </p>
            </div>

            {/* Generated URL Box */}
            <div className="p-3 bg-[#f6f5f4] border border-[rgba(0,0,0,0.08)] rounded-[8px] space-y-2">
              <label className="font-semibold text-black block">Public Share URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl(createdShare.id)}
                  className="flex-1 px-3 py-2 bg-white border border-[rgba(0,0,0,0.12)] rounded-[8px] font-mono text-[11px] text-black"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(getShareUrl(createdShare.id), false)}
                  className="notion-btn-primary flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Password Box */}
            {createdShare.isPasswordProtected && createdShare.password && (
              <div className="p-3 bg-[#ffb110]/15 border border-[#ffb110]/40 rounded-[8px] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-black block">Required Passcode</span>
                  <span className="font-mono text-sm font-bold text-black">
                    {createdShare.password}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdShare.password!, true)}
                  className="notion-btn-ghost flex items-center gap-1"
                >
                  {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPass ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[rgba(0,0,0,0.15)] text-black hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] font-medium transition-colors cursor-pointer"
              >
                Done
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/share/${createdShare.id}`);
                }}
                className="notion-btn-primary flex items-center gap-1.5"
              >
                <span>Preview as Recipient</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
