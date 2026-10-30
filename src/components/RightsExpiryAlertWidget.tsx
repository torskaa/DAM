import React, { useState, useMemo } from 'react';
import { DAMAsset, UserSession } from '../types/dam';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  Calendar, 
  Users, 
  FileText,
  Filter,
  X
} from 'lucide-react';

interface RightsExpiryAlertWidgetProps {
  assets: DAMAsset[];
  onOpenAssetDetail: (asset: DAMAsset) => void;
  onFilterExpiring: () => void;
  userSession: UserSession;
  onLogAudit?: (action: string, details: string) => void;
}

export interface ExpiryAssetInfo {
  asset: DAMAsset;
  daysRemaining: number;
  urgency: 'critical' | 'warning' | 'notice';
  formattedDate: string;
}

export const RightsExpiryAlertWidget: React.FC<RightsExpiryAlertWidgetProps> = ({
  assets,
  onOpenAssetDetail,
  onFilterExpiring,
  userSession,
  onLogAudit,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [renewalRequestedIds, setRenewalRequestedIds] = useState<Record<string, boolean>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Reference date: Current time
  const now = new Date();

  // Automatically identify and sort assets approaching license expiration or with expiring/expired rights
  const expiringAssets: ExpiryAssetInfo[] = useMemo(() => {
    const list: ExpiryAssetInfo[] = [];

    assets.forEach((asset) => {
      const rights = asset.rights;
      if (!rights) return;

      // Skip perpetual assets unless specifically marked as expiring soon or expired
      if (rights.rightsStatus === 'Perpetual' && !rights.licenseExpiresAt.startsWith('2026')) {
        return;
      }

      // Check date
      let daysRemaining = 999;
      if (rights.licenseExpiresAt) {
        const expiryDate = new Date(rights.licenseExpiresAt);
        if (!isNaN(expiryDate.getTime())) {
          const diffMs = expiryDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }

      // Determine qualification
      const isExpiringSoonStatus = rights.rightsStatus === 'Expiring Soon';
      const isExpiredStatus = rights.rightsStatus === 'Expired';
      const isApproachingByDate = daysRemaining <= 90;

      if (isExpiringSoonStatus || isExpiredStatus || isApproachingByDate) {
        let urgency: 'critical' | 'warning' | 'notice' = 'notice';

        if (daysRemaining <= 0 || isExpiredStatus) {
          urgency = 'critical';
        } else if (daysRemaining <= 30 || isExpiringSoonStatus) {
          urgency = 'warning';
        } else {
          urgency = 'notice';
        }

        list.push({
          asset,
          daysRemaining,
          urgency,
          formattedDate: rights.licenseExpiresAt || 'Pending Review',
        });
      }
    });

    // Sort by days remaining ascending (most urgent first)
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [assets]);

  if (isDismissed || expiringAssets.length === 0) {
    return null;
  }

  const handleRequestRenewal = (e: React.MouseEvent, asset: DAMAsset) => {
    e.stopPropagation();
    setRenewalRequestedIds((prev) => ({ ...prev, [asset.id]: true }));
    setFeedbackNotice(`Contract renewal requisition submitted for "${asset.title}" to Corporate Legal Affairs.`);
    if (onLogAudit) {
      onLogAudit('DRM_UPDATE', `Logged renewal request for asset ${asset.id} (${asset.rights?.contractReference})`);
    }
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] border-l-4 border-l-[var(--color-brand-secondary)] rounded-[12px] shadow-sm overflow-hidden transition-all duration-200 animate-in fade-in">
      
      {/* Widget Header Banner */}
      <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-subtle)]/60 border-b border-[var(--border-card)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--border-card)] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-[var(--color-brand)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-1.5 font-heading">
                <span>Rights & License Expiry Radar</span>
              </h3>
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold font-mono bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--border-card)]">
                {expiringAssets.length} {expiringAssets.length === 1 ? 'Asset Needs Attention' : 'Assets Need Attention'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5">
              Automated scan: Talent model releases and photographer commercial licenses requiring contract renewal.
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onFilterExpiring}
            className="px-2.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] bg-[var(--surface-card)] border border-[var(--border-card)] hover:border-[var(--color-brand)]/40 hover:bg-[var(--surface-hover)] rounded-[8px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Filter grid to expiring assets only"
          >
            <Filter className="w-3 h-3 text-[var(--text-secondary)]" />
            <span>Filter in Grid</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[8px] transition-colors cursor-pointer"
            title={isExpanded ? "Collapse Widget" : "Expand Widget"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[8px] transition-colors cursor-pointer"
            title="Dismiss until next session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {feedbackNotice && (
        <div className="px-5 py-2 bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{feedbackNotice}</span>
        </div>
      )}

      {/* Collapsible Asset List Container */}
      {isExpanded && (
        <div className="divide-y divide-[var(--border-card)] bg-[var(--surface-card)] max-h-[360px] overflow-y-auto">
          {expiringAssets.map(({ asset, daysRemaining, urgency, formattedDate }) => {
            const isRenewalRequested = renewalRequestedIds[asset.id];
            
            let badgeBg = 'bg-[var(--surface-subtle)] text-[var(--color-brand)] border-[var(--border-card)]';
            let statusText = `${daysRemaining} days left`;
            let pulseDot = null;

            if (urgency === 'critical') {
              badgeBg = 'bg-[#E53535]/15 text-[#E53535] border-[#E53535]/30';
              statusText = daysRemaining <= 0 ? 'Expired · Blocked' : `Expires in ${daysRemaining}d`;
              pulseDot = <span className="w-1.5 h-1.5 rounded-full bg-[#E53535] animate-ping" />;
            } else if (urgency === 'warning') {
              badgeBg = 'bg-[#CAEB0E]/20 text-[var(--text-primary)] border-[#CAEB0E]/40 font-bold';
              statusText = `Expires in ${daysRemaining} days`;
              pulseDot = <span className="w-1.5 h-1.5 rounded-full bg-[#CAEB0E]" />;
            }

            return (
              <div
                key={asset.id}
                onClick={() => onOpenAssetDetail(asset)}
                className="p-3.5 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group"
              >
                {/* Left: Thumbnail and Asset Metadata */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[var(--surface-subtle)] border border-[var(--border-card)] shrink-0 mt-0.5 relative">
                    <img
                      src={asset.previewUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute bottom-0 right-0 bg-black/80 text-white font-mono text-[8px] px-1 rounded-tl-sm uppercase">
                      .{asset.fileFormat}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-brand)] transition-colors truncate max-w-[280px]">
                        {asset.title}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-card)]">
                        {asset.brand}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-mono border flex items-center gap-1.5 ${badgeBg}`}>
                        {pulseDot}
                        <span>{statusText}</span>
                      </span>
                    </div>

                    {/* Talent & Contract Metadata */}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] mt-1 flex-wrap font-sans">
                      <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                        <Users className="w-3 h-3 text-[var(--text-secondary)]" />
                        <span className="truncate max-w-[190px]">
                          {asset.rights?.talentName || 'Commercial Model Release'}
                        </span>
                      </span>
                      <span aria-hidden="true" className="opacity-30">·</span>
                      <span>Studio: {asset.rights?.photographer || 'Production Studio'}</span>
                      <span aria-hidden="true" className="opacity-30">·</span>
                      <span className="font-mono text-[var(--text-primary)] font-medium">
                        Expiry Date: {formattedDate}
                      </span>
                      {asset.rights?.usageTerritory && (
                        <>
                          <span aria-hidden="true" className="opacity-30">·</span>
                          <span className="text-[var(--color-brand)] font-medium">
                            Territory: {asset.rights.usageTerritory}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={(e) => handleRequestRenewal(e, asset)}
                    disabled={isRenewalRequested}
                    className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      isRenewalRequested
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 opacity-90'
                        : 'bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--border-card)] hover:bg-[var(--surface-hover)] shadow-xs'
                    }`}
                    title="Send contract extension request to Legal & Corporate Affairs"
                  >
                    {isRenewalRequested ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Renewal Requested</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                        <span>Request Renewal</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAssetDetail(asset);
                    }}
                    className="px-3 py-1.5 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--color-brand)] font-semibold rounded-[8px] text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-[var(--border-card)]"
                  >
                    <span>Inspect Rights</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
