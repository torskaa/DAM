import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SharedLink, DAMAsset } from '../types/dam';
import { BentoGrid, BentoCard } from './ui/bento-grid';
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
import {
  Link2Icon,
  LockClosedIcon,
  ClockIcon,
  DownloadIcon,
  Share1Icon,
  PlusIcon,
  EyeOpenIcon,
  FileTextIcon
} from '@radix-ui/react-icons';

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

      {/* Bento Grid Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              Link Vault Bento Hub
            </h2>
            <span className="notion-pill bg-[#e6f3fe] text-[#0075de]">
              {activeShares.length} Active Timers
            </span>
          </div>
          <span className="text-xs text-[#757575]">
            Total {shares.length} links generated
          </span>
        </div>

        <BentoGrid className="lg:auto-rows-[16rem]">
          {/* Card 1: Primary Active Share (Span 2) */}
          <BentoCard
            name={activeShares[0] ? activeShares[0].title : "No Active Share Links"}
            description={
              activeShares[0]
                ? `${activeShares[0].assetIds.length} assets bundled · ${getCountdown(activeShares[0].expiresAt)} · ${activeShares[0].viewsCount} views · ${activeShares[0].downloadsCount} downloads`
                : "Generate an expiring partner bundle to distribute brand assets securely."
            }
            Icon={Link2Icon}
            className="lg:col-span-2"
            badge={activeShares[0]?.isPasswordProtected ? "Passcode Protected" : "Public Link"}
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-[#f6f5f4] via-white to-[#e6f3fe]/40 overflow-hidden">
                <div className="absolute right-4 top-4 flex gap-2 opacity-70">
                  {activeShares[0]?.assetIds.slice(0, 3).map((id, i) => {
                    const asset = assets.find(a => a.id === id);
                    return (
                      <div key={i} className="w-20 h-28 rounded-lg overflow-hidden border border-black/10 shadow-sm bg-white">
                        <img 
                          src={asset?.url || "/assets/aistudio/SINGHA-brandworld-design-05032018_31699fbc.pdf"} 
                          alt="thumbnail" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            }
            href={activeShares[0] ? `/share/${activeShares[0].id}` : "#"}
            onClick={activeShares[0] ? () => navigate(`/share/${activeShares[0].id}`) : onOpenCreateShare}
            cta={activeShares[0] ? "Open Recipient Portal" : "Create First Share"}
          />

          {/* Card 2: Create Share Link (Span 1) */}
          <BentoCard
            name="Create Expiring Link"
            description="Generate a custom branded URL with strict download access and automated expiry."
            Icon={PlusIcon}
            className="lg:col-span-1 bg-gradient-to-br from-[#fffdfa] to-[#ffb110]/10"
            badge="Instant Setup"
            background={
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#ffb110]/15 blur-2xl pointer-events-none" />
            }
            onClick={onOpenCreateShare}
            cta="New Expiring Share"
          />

          {/* Card 3: Security & Cryptographic Policy (Span 1) */}
          <BentoCard
            name="Cryptographic TTL & Passcodes"
            description="Expiring access tokens ensure zero-trust distribution across dark markets and regional agencies."
            Icon={LockClosedIcon}
            className="lg:col-span-1"
            badge="Enforced"
            background={
              <div className="absolute right-3 bottom-12 p-3 rounded-xl bg-black/5 border border-black/5 text-[11px] font-mono text-[#615d59]">
                <div>TTL: Auto-Expire</div>
                <div>Hash: SHA-256 Auth</div>
              </div>
            }
            onClick={() => {}}
            cta="Review Security Rules"
          />

          {/* Card 4: Recipient Analytics & Download Velocity (Span 2) */}
          <BentoCard
            name="Distribution Analytics & Telemetry"
            description={`Aggregated traffic: ${totalViews} total portal views and ${totalDownloads} master file downloads recorded across all shared links.`}
            Icon={DownloadIcon}
            className="lg:col-span-2"
            badge={`${totalDownloads} Downloads`}
            background={
              <div className="absolute right-6 top-6 flex items-center gap-6 opacity-80">
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-black">{totalViews}</div>
                  <div className="text-[10px] text-[#757575] uppercase font-bold tracking-wider">Views</div>
                </div>
                <div className="h-8 w-px bg-black/10" />
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-[#0075de]">{totalDownloads}</div>
                  <div className="text-[10px] text-[#757575] uppercase font-bold tracking-wider">Downloads</div>
                </div>
              </div>
            }
            onClick={() => {}}
            cta="Audit Link Velocity"
          />
        </BentoGrid>
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
