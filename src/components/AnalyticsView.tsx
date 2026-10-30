import React, { useState } from 'react';
import { DAMAsset, SharedLink, UserSession } from '../types/dam';
import { BentoGrid, BentoCard } from './ui/bento-grid';
import {
  DownloadIcon,
  EyeOpenIcon,
  ArchiveIcon,
  ExclamationTriangleIcon,
  BarChartIcon,
  ArrowRightIcon,
  PieChartIcon
} from '@radix-ui/react-icons';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Eye, 
  HardDrive, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Globe2, 
  Search, 
  FileSpreadsheet, 
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  BarChart2,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';

interface AnalyticsViewProps {
  assets: DAMAsset[];
  shares: SharedLink[];
  userSession: UserSession;
  onOpenAssetDetail: (asset: DAMAsset) => void;
}

// Custom Recharts Tooltip styled strictly with Notion token aesthetics
const CustomUsageTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-charcoal text-white rounded-[8px] p-3 shadow-xl border border-white/10 max-w-[280px] pointer-events-none z-50">
      <div className="flex items-center gap-2.5 mb-2.5 pb-2 border-b border-white/10">
        <div className="w-9 h-9 rounded-[6px] overflow-hidden bg-paper-warmth/20 shrink-0 border border-white/10">
          <img src={data.previewUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate leading-tight">{data.fullName}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-stone mt-0.5">
            <span className="font-semibold text-marigold">{data.brand}</span>
            <span>·</span>
            <span>.{data.fileFormat}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-stone text-[11px]">
            <span className="w-2 h-2 rounded-full bg-notion-blue inline-block"></span>
            Direct Downloads:
          </span>
          <span className="font-mono font-bold text-white">{data.downloads.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-stone text-[11px]">
            <span className="w-2 h-2 rounded-full bg-marigold inline-block"></span>
            Share Distributions:
          </span>
          <span className="font-mono font-bold text-white">{data.shares.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
          <span className="text-stone text-[11px]">Total Activity Score:</span>
          <span className="font-mono font-bold text-sky-tint">{data.totalActivity.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-stone/80 italic flex items-center justify-between">
        <span>Click bar to inspect asset</span>
        <ArrowUpRight className="w-3 h-3 text-notion-blue" />
      </div>
    </div>
  );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  assets,
  shares,
  userSession,
  onOpenAssetDetail,
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd'>('30d');
  
  // Usage Activity Widget Controls
  const [activityBrandFilter, setActivityBrandFilter] = useState<string>('ALL');
  const [activityMode, setActivityMode] = useState<'dual' | 'total'>('dual');
  const [activityLimit, setActivityLimit] = useState<number>(6);

  // Compute key statistics
  const totalDownloads = assets.reduce((sum, a) => sum + (a.downloadsCount || 0), 0);
  const totalViews = assets.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalBytes = assets.reduce((sum, a) => sum + (a.fileSizeBytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  // Brand download breakdown
  const brandDownloads: Record<string, { downloads: number; assetsCount: number }> = {
    SINGHA: { downloads: 0, assetsCount: 0 },
    LEO: { downloads: 0, assetsCount: 0 },
    'U BEER': { downloads: 0, assetsCount: 0 },
    'BOON RAWD': { downloads: 0, assetsCount: 0 },
  };

  assets.forEach((a) => {
    if (brandDownloads[a.brand]) {
      brandDownloads[a.brand].downloads += a.downloadsCount || 0;
      brandDownloads[a.brand].assetsCount += 1;
    }
  });

  // Top downloaded assets (Leaderboard)
  const topAssets = [...assets]
    .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
    .slice(0, 5);

  // --- Compute Usage Activity (Downloads vs Shares) per asset ---
  const assetActivityData = assets.map((asset) => {
    const directDownloads = asset.downloadsCount || 0;
    
    // Cross-reference with active shares
    const matchingShares = shares.filter((s) => s.assetIds?.includes(asset.id));
    const shareOccurrences = matchingShares.length;
    const shareDownloads = matchingShares.reduce((sum, s) => sum + (s.downloadsCount || 0), 0);
    const shareViews = matchingShares.reduce((sum, s) => sum + (s.viewsCount || 0), 0);
    
    // Real-world DAM activity computation: direct downloads + shared link distributions & downloads
    const baseShares = shareOccurrences > 0 
      ? (shareOccurrences * 18 + shareDownloads * 2 + shareViews) 
      : Math.max(2, Math.round(directDownloads * 0.45) + (asset.category === 'Packaging & Vectors' ? 14 : 6));

    const totalActivity = directDownloads + baseShares;
    const shortName = asset.title.length > 20 ? `${asset.title.slice(0, 18)}...` : asset.title;

    return {
      id: asset.id,
      shortName,
      fullName: asset.title,
      brand: asset.brand,
      category: asset.category,
      fileFormat: asset.fileFormat,
      previewUrl: asset.previewUrl,
      downloads: directDownloads,
      shares: baseShares,
      totalActivity,
      shareOccurrences,
      shareDownloads,
      asset,
    };
  });

  // Filter & sort for the Recharts widget
  const filteredActivityData = assetActivityData
    .filter((item) => activityBrandFilter === 'ALL' || item.brand === activityBrandFilter)
    .sort((a, b) => {
      if (activityMode === 'total') {
        return b.totalActivity - a.totalActivity;
      }
      return (b.downloads + b.shares) - (a.downloads + a.shares);
    })
    .slice(0, activityLimit);

  // Widget Highlight Cards
  const mostDownloadedItem = [...assetActivityData].sort((a, b) => b.downloads - a.downloads)[0];
  const mostSharedItem = [...assetActivityData].sort((a, b) => b.shares - a.shares)[0];
  const totalSharedVolume = assetActivityData.reduce((sum, a) => sum + a.shares, 0);

  // DRM rights breakdown
  const rightsStats = {
    active: assets.filter((a) => a.rights?.rightsStatus === 'Active').length,
    perpetual: assets.filter((a) => a.rights?.rightsStatus === 'Perpetual').length,
    expiringSoon: assets.filter((a) => a.rights?.rightsStatus === 'Expiring Soon').length,
    expired: assets.filter((a) => a.rights?.rightsStatus === 'Expired').length,
  };

  // Assets with expiring or attention needed DRM
  const attentionAssets = assets.filter(
    (a) => a.rights?.rightsStatus === 'Expiring Soon' || a.approvalStatus === 'In Review' || a.approvalStatus === 'Draft'
  );

  // Regional breakdown
  const regionalUsage = [
    { region: 'Asia Pacific (Bangkok HQ)', downloads: Math.round(totalDownloads * 0.54), percent: 54, trend: '+18%' },
    { region: 'Southeast Asia (Singapore Hub)', downloads: Math.round(totalDownloads * 0.22), percent: 22, trend: '+32%' },
    { region: 'Europe & UK (London)', downloads: Math.round(totalDownloads * 0.12), percent: 12, trend: '+8%' },
    { region: 'North America (Los Angeles)', downloads: Math.round(totalDownloads * 0.08), percent: 8, trend: '+14%' },
    { region: 'East Asia (Tokyo & Seoul)', downloads: Math.round(totalDownloads * 0.04), percent: 4, trend: '+5%' },
  ];

  // Frequent search queries
  const topSearchQueries = [
    { query: 'dark market logo', count: 184, growth: '+45%' },
    { query: 'singha can ice 330ml', count: 142, growth: '+28%' },
    { query: 'rooftop sunset lifestyle toast', count: 129, growth: '+62%' },
    { query: 'pantone 3559 c vector', count: 98, growth: '+12%' },
    { query: 'posm coasters bar runner', count: 86, growth: '+19%' },
    { query: 'estd 1933 12 degree slope', count: 74, growth: '+15%' },
  ];

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      'Asset ID',
      'Title',
      'Filename',
      'Brand',
      'Category',
      'Format',
      'File Size',
      'Approval Status',
      'Rights Status',
      'Talent / Model',
      'Photographer / Studio',
      'Usage Territory',
      'License Expiration',
      'Downloads Count',
      'Views Count',
      'Estimated Shares'
    ];

    const rows = assetActivityData.map((a) => [
      `"${a.id}"`,
      `"${a.fullName.replace(/"/g, '""')}"`,
      `"${a.asset.filename}"`,
      `"${a.brand}"`,
      `"${a.category}"`,
      `"${a.fileFormat}"`,
      `"${a.asset.fileSize}"`,
      `"${a.asset.approvalStatus || 'Approved'}"`,
      `"${a.asset.rights?.rightsStatus || 'Perpetual'}"`,
      `"${a.asset.rights?.talentName || '-'}"`,
      `"${a.asset.rights?.photographer || '-'}"`,
      `"${a.asset.rights?.usageTerritory || 'Global'}"`,
      `"${a.asset.rights?.licenseExpiresAt || '2099-12-31'}"`,
      a.downloads,
      a.asset.viewsCount || 0,
      a.shares,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Singha_DAM_Asset_Compliance_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Bar */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--color-brand)]">
              Enterprise Telemetry
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">Boon Rawd Global Custodian</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-heading">
            Asset Intelligence & Consumption Analytics
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Real-time download telemetry, regional distribution, talent rights tracking, and agency access compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] p-0.5 text-xs font-medium">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-[var(--surface-card)] shadow-xs text-[var(--color-brand)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                timeRange === '90d' ? 'bg-[var(--surface-card)] shadow-xs text-[var(--color-brand)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setTimeRange('ytd')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                timeRange === 'ytd' ? 'bg-[var(--surface-card)] shadow-xs text-[var(--color-brand)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              YTD 2026
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-[8px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--color-brand)]" />
            <span>Export Compliance Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Executive Telemetry Bento Grid */}
      <BentoGrid className="lg:auto-rows-[14rem]">
        {/* Card 1: Direct Downloads (Span 1) */}
        <BentoCard
          name={`${totalDownloads.toLocaleString()} Downloads`}
          description="+18.4% growth from previous cycle across agency and production downloads."
          Icon={DownloadIcon}
          className="lg:col-span-1"
          badge="Direct Pulls"
          background={
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#0075de]/10 rounded-full blur-xl pointer-events-none" />
          }
          onClick={() => {}}
          cta="View Download Log"
        />

        {/* Card 2: Catalog Views (Span 1) */}
        <BentoCard
          name={`${totalViews.toLocaleString()} Asset Views`}
          description="+24.1% discovery rate across Singha, Leo, and U Beer master portfolios."
          Icon={EyeOpenIcon}
          className="lg:col-span-1"
          badge="Catalog Reach"
          background={
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#ffb110]/15 rounded-full blur-xl pointer-events-none" />
          }
          onClick={() => {}}
          cta="Explore Catalog Reach"
        />

        {/* Card 3: Managed Storage (Span 1) */}
        <BentoCard
          name={`${totalMB} MB Managed`}
          description={`High-fidelity vector (.AI, .EPS) and packaging dielines across ${assets.length} master files.`}
          Icon={ArchiveIcon}
          className="lg:col-span-1"
          badge={`${assets.length} Masters`}
          background={
            <div className="absolute right-4 top-4 text-xs font-mono text-[#757575] bg-black/5 px-2 py-1 rounded">
              AWS S3 Vault
            </div>
          }
          onClick={() => {}}
          cta="Audit Storage Quota"
        />

        {/* Card 4: Talent Rights Health (Span 1) */}
        <BentoCard
          name={`${rightsStats.active + rightsStats.perpetual} / ${assets.length} Cleared`}
          description={`${rightsStats.expiringSoon} license expiring in < 30 days. Automated legal alerts active.`}
          Icon={ExclamationTriangleIcon}
          className="lg:col-span-1"
          badge={rightsStats.expiringSoon > 0 ? "Action Required" : "Compliant"}
          background={
            <div className={`absolute -right-4 -bottom-4 w-28 h-28 ${rightsStats.expiringSoon > 0 ? 'bg-[#f64932]/10' : 'bg-emerald-500/10'} rounded-full blur-xl pointer-events-none`} />
          }
          onClick={() => {}}
          cta="Inspect Rights Matrix"
        />
      </BentoGrid>

      {/* ========================================================================= */}
      {/* NEW 'Usage Activity' DASHBOARD WIDGET (Recharts) */}
      {/* ========================================================================= */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs space-y-6">
        
        {/* Widget Top Bar: Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-[var(--surface-subtle)] text-[var(--color-brand)] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[var(--color-brand)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)] font-heading tracking-tight">
                Usage Activity
              </h2>
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--border-card)] font-mono">
                Downloads vs Shares
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Visualizing which brand assets have been shared or downloaded the most across enterprise portals & agency links.
            </p>
          </div>

          {/* Interactive Filters & Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Brand Filter */}
            <div className="flex items-center gap-1 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] p-1 text-xs">
              <span className="text-[var(--text-secondary)] px-1 text-[11px] font-medium hidden sm:inline">Brand:</span>
              {(['ALL', 'SINGHA', 'LEO', 'U BEER', 'BOON RAWD'] as const).map((brand) => (
                <button
                  key={brand}
                  onClick={() => setActivityBrandFilter(brand)}
                  className={`px-2.5 py-1 rounded-[6px] text-xs transition-colors cursor-pointer font-medium ${
                    activityBrandFilter === brand
                      ? 'bg-[var(--surface-card)] text-[var(--color-brand)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {brand === 'ALL' ? 'All' : brand}
                </button>
              ))}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] p-1 text-xs font-medium">
              <button
                onClick={() => setActivityMode('dual')}
                className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer ${
                  activityMode === 'dual'
                    ? 'bg-[var(--surface-card)] text-[var(--color-brand)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActivityMode('total')}
                className={`px-3 py-1 rounded-[6px] transition-colors cursor-pointer ${
                  activityMode === 'total'
                    ? 'bg-[var(--surface-card)] text-[var(--color-brand)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Total Score
              </button>
            </div>

            {/* Count Selector */}
            <div className="flex items-center bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] p-1 text-xs font-mono">
              <button
                onClick={() => setActivityLimit(6)}
                className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                  activityLimit === 6
                    ? 'bg-[var(--surface-card)] text-[var(--color-brand)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Top 6
              </button>
              <button
                onClick={() => setActivityLimit(10)}
                className={`px-2 py-1 rounded-[6px] transition-colors cursor-pointer ${
                  activityLimit === 10
                    ? 'bg-[var(--surface-card)] text-[var(--color-brand)] font-bold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Top 10
              </button>
            </div>
          </div>
        </div>

        {/* Top Activity KPI Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Top Downloaded */}
          {mostDownloadedItem && (
            <div 
              onClick={() => onOpenAssetDetail(mostDownloadedItem.asset)}
              className="p-3 bg-[var(--surface-subtle)] rounded-[8px] border border-[var(--border-card)] hover:border-[var(--color-brand)]/40 transition-colors cursor-pointer group flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[var(--surface-card)] shrink-0 border border-[var(--border-card)]">
                  <img src={mostDownloadedItem.previewUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand)] flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span>Most Downloaded Asset</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5 group-hover:text-[var(--color-brand)]">
                    {mostDownloadedItem.fullName}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-[var(--text-primary)] bg-[var(--surface-card)] px-2 py-0.5 rounded-[6px] border border-[var(--border-card)]">
                  {mostDownloadedItem.downloads.toLocaleString()} dl
                </span>
              </div>
            </div>
          )}

          {/* Top Shared */}
          {mostSharedItem && (
            <div 
              onClick={() => onOpenAssetDetail(mostSharedItem.asset)}
              className="p-3 bg-[var(--surface-subtle)] rounded-[8px] border border-[var(--border-card)] hover:border-[var(--color-brand)]/40 transition-colors cursor-pointer group flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[var(--surface-card)] shrink-0 border border-[var(--border-card)]">
                  <img src={mostSharedItem.previewUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-secondary)] flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-[var(--color-brand-secondary)]" />
                    <span>Most Shared Asset</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5 group-hover:text-[var(--color-brand)]">
                    {mostSharedItem.fullName}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-[var(--text-primary)] bg-[var(--surface-card)] px-2 py-0.5 rounded-[6px] border border-[var(--border-card)]">
                  {mostSharedItem.shares.toLocaleString()} shares
                </span>
              </div>
            </div>
          )}

          {/* Overall Distribution Summary */}
          <div className="p-3 bg-[var(--surface-subtle)] rounded-[8px] border border-[var(--border-card)] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--color-brand)]" />
                <span>Total External Reach</span>
              </div>
              <div className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                Active links & distributed copies
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-notion-blue bg-sky-tint px-2 py-0.5 rounded-[6px] border border-notion-blue/20">
                {totalSharedVolume.toLocaleString()} distributions
              </span>
            </div>
          </div>
        </div>

        {/* Recharts BarChart Visualization */}
        <div className="w-full h-[320px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredActivityData}
              margin={{ top: 15, right: 15, left: -10, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="shortName"
                tick={{ fill: '#757575', fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: '#757575', fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
              />
              <Tooltip content={<CustomUsageTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                height={30}
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#111111'
                }}
              />

              {activityMode === 'dual' ? (
                <>
                  <Bar
                    dataKey="downloads"
                    name="Direct Downloads"
                    fill="#0075de"
                    radius={[4, 4, 0, 0]}
                    onClick={(entry: any) => {
                      if (entry?.payload?.asset) {
                        onOpenAssetDetail(entry.payload.asset);
                      }
                    }}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                  <Bar
                    dataKey="shares"
                    name="Share Distributions"
                    fill="#ffb110"
                    radius={[4, 4, 0, 0]}
                    onClick={(entry: any) => {
                      if (entry?.payload?.asset) {
                        onOpenAssetDetail(entry.payload.asset);
                      }
                    }}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                </>
              ) : (
                <Bar
                  dataKey="totalActivity"
                  name="Total Activity Score"
                  radius={[4, 4, 0, 0]}
                  onClick={(entry: any) => {
                    if (entry?.payload?.asset) {
                      onOpenAssetDetail(entry.payload.asset);
                    }
                  }}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                >
                  {filteredActivityData.map((entry, index) => {
                    let fillColor = '#111111';
                    if (entry.brand === 'SINGHA') fillColor = '#0075de';
                    else if (entry.brand === 'LEO') fillColor = '#f64932';
                    else if (entry.brand === 'U BEER') fillColor = '#ffb110';
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ranked Asset Mini Breakdown Strip */}
        <div className="pt-2 border-t border-black/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-charcoal">
              Ranked Asset Consumption Breakdown ({filteredActivityData.length} items)
            </span>
            <span className="text-[11px] text-stone font-mono">
              Click any asset row to open full metadata & compliance details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredActivityData.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onOpenAssetDetail(item.asset)}
                className="p-2.5 rounded-[8px] bg-paper-warmth/60 hover:bg-paper-warmth border border-black/[0.06] hover:border-black/[0.15] transition-all cursor-pointer group flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-stone w-4 text-center shrink-0">
                    #{index + 1}
                  </span>
                  <div className="w-9 h-9 rounded-[6px] overflow-hidden bg-white shrink-0 border border-black/[0.08]">
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-charcoal truncate group-hover:text-notion-blue">
                      {item.fullName}
                    </div>
                    <div className="text-[10px] text-stone font-mono mt-0.5">
                      {item.brand} · .{item.fileFormat}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 justify-end text-[11px] font-mono">
                    <span className="text-notion-blue font-bold">{item.downloads}</span>
                    <span className="text-stone">dl</span>
                    <span className="text-stone">/</span>
                    <span className="text-amber-600 font-bold">{item.shares}</span>
                    <span className="text-stone">sh</span>
                  </div>
                  <div className="text-[10px] text-stone font-mono">
                    Total: <span className="font-bold text-charcoal">{item.totalActivity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2: Top Downloaded Assets + Brand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Downloaded Assets Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Top Downloaded Master Assets</h2>
              <p className="text-[11px] text-[var(--text-secondary)]">Most utilized packaging dielines, lifestyle photography and vectors</p>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-brand)] font-semibold">Ranked by volume</span>
          </div>

          <div className="divide-y divide-[var(--border-card)] flex-1">
            {topAssets.map((asset, index) => {
              const maxDownloads = topAssets[0]?.downloadsCount || 1;
              const barPercent = Math.round(((asset.downloadsCount || 0) / maxDownloads) * 100);

              return (
                <div 
                  key={asset.id} 
                  onClick={() => onOpenAssetDetail(asset)}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--surface-hover)] px-2 rounded-[8px] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold font-mono text-[var(--text-secondary)] w-4 text-center">
                      #{index + 1}
                    </span>
                    <div className="w-11 h-11 rounded-[8px] overflow-hidden bg-[var(--surface-subtle)] border border-[var(--border-card)] shrink-0">
                      <img 
                        src={asset.previewUrl} 
                        alt={asset.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[260px]">
                          {asset.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-card)]">
                          .{asset.fileFormat}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5 truncate">
                        {asset.brand} · {asset.category} · {asset.fileSize}
                      </div>
                    </div>
                  </div>

                  <div className="w-36 shrink-0 text-right">
                    <div className="text-xs font-bold font-mono text-[var(--text-primary)]">
                      {(asset.downloadsCount || 0).toLocaleString()} <span className="text-[10px] text-[var(--text-secondary)] font-normal">downloads</span>
                    </div>
                    <div className="w-full bg-[var(--border-card)] rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div 
                        className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Consumption Distribution */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-1 font-heading">Brand Consumption Share</h2>
            <p className="text-[11px] text-[var(--text-secondary)] mb-5">Download demand distributed across Boon Rawd brands</p>

            <div className="space-y-4">
              {Object.entries(brandDownloads).map(([brand, data]) => {
                const percent = totalDownloads > 0 ? Math.round((data.downloads / totalDownloads) * 100) : 0;
                
                let brandColorClass = 'bg-[#CAEB0E]';
                if (brand === 'LEO') brandColorClass = 'bg-[#E53535]';
                else if (brand === 'U BEER') brandColorClass = 'bg-[#FD02B0]';
                else if (brand === 'BOON RAWD') brandColorClass = 'bg-[#5945F1]';

                return (
                  <div key={brand} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)]">{brand}</span>
                      <span className="font-mono text-[var(--text-secondary)] text-[11px]">
                        {data.downloads.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--surface-subtle)] rounded-full h-2 overflow-hidden border border-[var(--border-card)]">
                      <div 
                        className={`h-full rounded-full ${brandColorClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">
                      {data.assetsCount} master files in catalog
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-card)] bg-[var(--surface-subtle)]/60 p-3 rounded-[8px]">
            <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">Compliance Insight</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              SINGHA brand assets represent the highest commercial packaging demand, followed by LEO retail POSM assets in Thailand and Indochina.
            </p>
          </div>
        </div>

      </div>

      {/* Row 3: Regional Distribution & DRM Attention Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Global Regional Distribution */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[var(--color-brand)]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Global Regional Download Hubs</h2>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">5 Active Global Hubs</span>
          </div>

          <div className="space-y-3">
            {regionalUsage.map((hub) => (
              <div 
                key={hub.region} 
                className="p-3 bg-[var(--surface-subtle)] rounded-[8px] border border-[var(--border-card)] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">{hub.region}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">
                    {hub.downloads.toLocaleString()} downloads · {hub.percent}% volume
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[6px] border border-emerald-500/20">
                    {hub.trend}
                  </span>
                  <div className="w-16 bg-[var(--surface-card)] rounded-full h-1.5 overflow-hidden border border-[var(--border-card)]">
                    <div 
                      className="bg-[var(--color-brand)] h-full rounded-full" 
                      style={{ width: `${hub.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Rights Expiry Radar (DRM) */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">DRM & Approval Governance Radar</h2>
            </div>
            <span className="text-[11px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-[6px] border border-amber-500/20">
              {attentionAssets.length} Needs Review
            </span>
          </div>

          <div className="space-y-3">
            {attentionAssets.map((asset) => {
              const isExpiring = asset.rights?.rightsStatus === 'Expiring Soon';
              const isReview = asset.approvalStatus === 'In Review';
              const isDraft = asset.approvalStatus === 'Draft';

              return (
                <div 
                  key={asset.id} 
                  onClick={() => onOpenAssetDetail(asset)}
                  className="p-3 border border-[var(--border-card)] hover:border-[var(--color-brand)]/40 rounded-[8px] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-[6px] overflow-hidden bg-[var(--surface-subtle)] shrink-0 mt-0.5 border border-[var(--border-card)]">
                      <img src={asset.previewUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--color-brand)]">
                        {asset.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        Talent: {asset.rights?.talentName || 'Corporate Model Release'} · Ref: {asset.rights?.contractReference || 'N/A'}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">
                        License Expiry: {asset.rights?.licenseExpiresAt || '2026-11-20'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isExpiring && (
                      <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[#CAEB0E]/20 text-[var(--text-primary)] border border-[#CAEB0E]/40">
                        Expiring Soon
                      </span>
                    )}
                    {isReview && (
                      <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--border-card)]">
                        In Review
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-card)]">
                        Draft
                      </span>
                    )}
                    <div className="text-[10px] text-[var(--color-brand)] font-medium mt-1 group-hover:underline flex items-center justify-end gap-1">
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 4: Top Search Query Trends */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--color-brand)]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">Agency & Regional Marketer Search Intent</h2>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-mono">Semantic & Keyword Queries</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topSearchQueries.map((item) => (
            <div 
              key={item.query}
              className="p-3 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-medium text-[var(--text-primary)] truncate font-mono">
                  "{item.query}"
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {item.count} queries recorded
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[6px] border border-emerald-500/20 shrink-0">
                {item.growth}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
