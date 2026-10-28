import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SharedLink, DAMAsset } from '../types/dam';
import { 
  Share2, 
  Lock, 
  Clock, 
  Eye, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus, 
  ShieldCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

interface ShareLinksManagerProps {
  shares: SharedLink[];
  assets: DAMAsset[];
  onOpenCreateShare: () => void;
  onOpenRecipientPortal: (shareId: string) => void;
  onRevokeShare: (shareId: string) => void;
}

export const ShareLinksManager: React.FC<ShareLinksManagerProps> = ({
  shares,
  assets,
  onOpenCreateShare,
  onOpenRecipientPortal,
  onRevokeShare,
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUrl = (id: string) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCountdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  const activeShares = shares.filter((s) => new Date(s.expiresAt) > new Date() && s.status === 'active');
  const totalViews = shares.reduce((acc, s) => acc + s.viewsCount, 0);
  const totalDownloads = shares.reduce((acc, s) => acc + s.downloadsCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Shared Links & Expiring Vault
            </h1>
            <span className="notion-pill bg-[#ffb110] text-black">
              Security Controlled
            </span>
          </div>
          <p className="text-sm text-[#615d59] mt-1 max-w-2xl font-['Lyon_Text',Georgia,serif]">
            Manage public and partner distribution links with cryptographic access timers, passcodes, and granular asset download restrictions.
          </p>
        </div>

        <button
          onClick={onOpenCreateShare}
          className="notion-btn-primary flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Expiring Share</span>
        </button>
      </div>

      {/* KPI Stats Row (Notion 12px hairline cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-4">
          <span className="text-xs text-[#757575] block font-medium">Active Share Links</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-black mt-1 block">
            {activeShares.length}
          </span>
        </div>
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-4">
          <span className="text-xs text-[#757575] block font-medium">Total Recipient Views</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-black mt-1 block">
            {totalViews}
          </span>
        </div>
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-4">
          <span className="text-xs text-[#757575] block font-medium">Total File Downloads</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-black mt-1 block">
            {totalDownloads}
          </span>
        </div>
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-4">
          <span className="text-xs text-[#757575] block font-medium">Security Policy</span>
          <span className="text-sm font-semibold text-[#0075de] mt-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0075de]" />
            <span>Encrypted Expiry</span>
          </span>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden">
        <div className="p-4 border-b border-[rgba(0,0,0,0.08)] bg-[#f6f5f4] flex items-center justify-between">
          <span className="text-xs font-semibold text-black tracking-wide">
            All Generated Links ({shares.length})
          </span>
          <span className="notion-pill bg-[#e6f3fe] text-[#0075de]">
            Real-time TTL Monitoring
          </span>
        </div>

        {shares.length === 0 ? (
          <div className="py-16 text-center text-[#757575] text-xs">
            No share links created yet. Select assets in the library to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f6f5f4] border-b border-[rgba(0,0,0,0.08)] text-[#615d59] font-medium">
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Assets</th>
                  <th className="py-3 px-4">Expiration / Countdown</th>
                  <th className="py-3 px-4">Security</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Downloads</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                {shares.map((share) => {
                  const isExpired = new Date(share.expiresAt) <= new Date() || share.status === 'expired' || share.status === 'revoked';
                  const countdown = getCountdown(share.expiresAt);

                  return (
                    <tr key={share.id} className="hover:bg-[#f6f5f4]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-black">{share.title}</span>
                          <span className="text-[11px] text-[#757575] font-mono">
                            ID: {share.id} · Created {new Date(share.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums text-[#615d59]">
                        {share.assetIds.length} files
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-[#f64932]' : 'text-[#ffb110]'}`} />
                          <span className={isExpired ? 'text-[#f64932] font-semibold' : 'text-black'}>
                            {countdown}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#757575] block mt-0.5">
                          {new Date(share.expiresAt).toLocaleDateString()} {new Date(share.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {share.isPasswordProtected ? (
                          <div className="flex items-center gap-1 text-[#0075de] font-medium">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Protected ({share.password ? 'Code Set' : 'Active'})</span>
                          </div>
                        ) : (
                          <span className="text-[#757575]">Open Public</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#615d59]">
                        {share.viewsCount}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#615d59]">
                        {share.downloadsCount}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyUrl(share.id)}
                            className="p-1.5 hover:bg-[#e6f3fe] rounded-[8px] text-[#757575] hover:text-[#0075de] transition-colors cursor-pointer"
                            title="Copy Share Link"
                          >
                            {copiedId === share.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => navigate(`/share/${share.id}`)}
                            className="p-1.5 hover:bg-[#e6f3fe] rounded-[8px] text-[#757575] hover:text-[#0075de] transition-colors cursor-pointer"
                            title="Open Recipient View"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {!isExpired && (
                            <button
                              onClick={() => onRevokeShare(share.id)}
                              className="p-1.5 hover:bg-[#f64932]/10 rounded-[8px] text-[#757575] hover:text-[#f64932] transition-colors cursor-pointer"
                              title="Revoke / Expire Immediately"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
