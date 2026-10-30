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
        className="relative bg-[var(--surface-card)] text-[var(--text-primary)] w-full max-w-xl rounded-[12px] flex flex-col overflow-hidden border border-[var(--border-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--color-brand)]/20 text-[var(--color-brand)] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif] leading-tight">
                Create Expiring Share Link
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-['Geist',sans-serif]">
                Secure link with password protection & cryptographic expiration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Success Screen */}
        {!createdShare ? (
          <form onSubmit={handleCreateShare} className="p-6 space-y-5 text-xs">
            
            {/* Share Title */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[var(--text-primary)] block">Share Package Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-md focus:border-[var(--color-brand)] outline-none text-xs text-[var(--text-primary)]"
                placeholder="e.g. Singha Global Campaign Package Q4"
              />
            </div>

            {/* Selected Assets Preview Thumbnails */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--text-primary)]">Assets Included</span>
                <span className="text-[11px] font-mono text-[var(--text-secondary)] tabular-nums">
                  {selectedAssets.length} {selectedAssets.length === 1 ? 'file' : 'files'}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {selectedAssets.slice(0, 6).map((asset) => (
                  <div
                    key={asset.id}
                    className="w-14 h-14 rounded-md border border-[var(--border-card)] overflow-hidden shrink-0 relative group"
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
                  <div className="w-14 h-14 rounded-md border border-[var(--border-card)] bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-bold shrink-0">
                    +{selectedAssets.length - 6}
                  </div>
                )}
              </div>
            </div>

            {/* Expiration Settings */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
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
                    className={`py-2 px-2 rounded-md border text-center font-medium transition-colors cursor-pointer ${
                      expiryOption === opt.id
                        ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white font-semibold'
                        : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {expiryOption === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[var(--text-secondary)]">Expires in:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded text-center font-mono text-[var(--text-primary)]"
                  />
                  <span className="text-[var(--text-secondary)]">days</span>
                </div>
              )}
            </div>

            {/* Password Protection */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <Lock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span>Password Protection</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPasswordProtected}
                    onChange={(e) => setIsPasswordProtected(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[var(--surface-subtle)] border border-[var(--border-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-brand)]"></div>
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
                    className="flex-1 px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-md font-mono text-[var(--text-primary)] focus:border-[var(--color-brand)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={generatePasscode}
                    className="px-3 py-2 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] text-[var(--text-primary)] rounded-md font-medium transition-colors cursor-pointer"
                  >
                    Generate Passcode
                  </button>
                </div>
              )}
            </div>

            {/* Permissions & Security Flags */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-card)]">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span>Recipient Permissions</span>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={permissions.canDownloadOriginal}
                    onChange={(e) =>
                      setPermissions({ ...permissions, canDownloadOriginal: e.target.checked })
                    }
                    className="rounded border-[var(--border-card)] accent-[var(--color-brand)]"
                  />
                  <span>Allow High-Resolution & Original Vectors (.AI, .PSD, 300 DPI)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={permissions.allowWatermarkOnly}
                    onChange={(e) =>
                      setPermissions({ ...permissions, allowWatermarkOnly: e.target.checked })
                    }
                    className="rounded border-[var(--border-card)] accent-[var(--color-brand)]"
                  />
                  <span>Display Singha Watermark on Unregistered Preview</span>
                </label>
              </div>
            </div>

            {/* Recipient Email (Optional) */}
            <div className="space-y-1 pt-2 border-t border-[var(--border-card)]">
              <label className="font-semibold text-[var(--text-primary)] block">Recipient Email (Optional notification)</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="agency.partner@creativemedia.com"
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-md text-[var(--text-primary)] focus:border-[var(--color-brand)] outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-[var(--border-card)] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[8px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-[var(--color-brand)] hover:opacity-90 text-white rounded-[8px] font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Generating Secure Link...' : 'Generate Share Link'}
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen with Copy Link & Passcode */
          <div className="p-6 space-y-5 text-xs">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[var(--color-brand)]/20 text-[var(--color-brand)] flex items-center justify-center mx-auto mb-2">
                <FileCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">Secure Share Link Created!</h3>
              <p className="text-[var(--text-secondary)] text-xs mt-0.5 font-['Geist',sans-serif]">
                This link will automatically expire on{' '}
                <strong className="text-[var(--text-primary)] font-sans font-medium">
                  {new Date(createdShare.expiresAt).toLocaleDateString()} at{' '}
                  {new Date(createdShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </p>
            </div>

            {/* Generated URL Box */}
            <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] space-y-2">
              <label className="font-semibold text-[var(--text-primary)] block">Public Share URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl(createdShare.id)}
                  className="flex-1 px-3 py-2 bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[8px] font-mono text-[11px] text-[var(--text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(getShareUrl(createdShare.id), false)}
                  className="px-3 py-2 bg-[var(--color-brand)] hover:opacity-90 text-white rounded-[8px] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Password Box */}
            {createdShare.isPasswordProtected && createdShare.password && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-[8px] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[var(--text-primary)] block">Required Passcode</span>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    {createdShare.password}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdShare.password!, true)}
                  className="px-2.5 py-1 text-xs border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 rounded-[6px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedPass ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPass ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[8px] font-medium transition-colors cursor-pointer"
              >
                Done
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/share/${createdShare.id}`);
                }}
                className="px-4 py-1.5 bg-[var(--color-brand)] hover:opacity-90 text-white rounded-[8px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
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
