import React, { useState } from 'react';
import { DAMAsset, SharedLink, UserSession } from '../types/dam';
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
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsViewProps {
  assets: DAMAsset[];
  shares: SharedLink[];
  userSession: UserSession;
  onOpenAssetDetail: (asset: DAMAsset) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  assets,
  shares,
  userSession,
  onOpenAssetDetail,
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd'>('30d');

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

  // Top downloaded assets
  const topAssets = [...assets]
    .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
    .slice(0, 5);

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
      'Views Count'
    ];

    const rows = assets.map((a) => [
      `"${a.id}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.filename}"`,
      `"${a.brand}"`,
      `"${a.category}"`,
      `"${a.fileFormat}"`,
      `"${a.fileSize}"`,
      `"${a.approvalStatus || 'Approved'}"`,
      `"${a.rights?.rightsStatus || 'Perpetual'}"`,
      `"${a.rights?.talentName || '-'}"`,
      `"${a.rights?.photographer || '-'}"`,
      `"${a.rights?.usageTerritory || 'Global'}"`,
      `"${a.rights?.licenseExpiresAt || '2099-12-31'}"`,
      a.downloadsCount || 0,
      a.viewsCount || 0,
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
      <div className="bg-white border border-black/[0.08] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-sky-tint text-notion-blue">
              Enterprise Telemetry
            </span>
            <span className="text-xs text-stone font-mono">Boon Rawd Global Custodian</span>
          </div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight">
            Asset Intelligence & Consumption Analytics
          </h1>
          <p className="text-xs text-graphite mt-1">
            Real-time download telemetry, regional distribution, talent rights tracking, and agency access compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-paper-warmth border border-black/[0.08] rounded-[8px] p-0.5 text-xs font-medium">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-white shadow-xs text-charcoal font-semibold' : 'text-stone hover:text-charcoal'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                timeRange === '90d' ? 'bg-white shadow-xs text-charcoal font-semibold' : 'text-stone hover:text-charcoal'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setTimeRange('ytd')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                timeRange === 'ytd' ? 'bg-white shadow-xs text-charcoal font-semibold' : 'text-stone hover:text-charcoal'
              }`}
            >
              YTD 2026
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-[8px] bg-charcoal hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-marigold" />
            <span>Export Compliance Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 Big KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Downloads */}
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone text-xs font-medium mb-3">
            <span>Total Downloads</span>
            <div className="w-8 h-8 rounded-[8px] bg-sky-tint text-notion-blue flex items-center justify-center">
              <Download className="w-4 h-4 text-notion-blue" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-charcoal tracking-tight">
              {totalDownloads.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% from previous cycle</span>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone text-xs font-medium mb-3">
            <span>Asset Catalog Views</span>
            <div className="w-8 h-8 rounded-[8px] bg-paper-warmth text-charcoal flex items-center justify-center">
              <Eye className="w-4 h-4 text-graphite" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-charcoal tracking-tight">
              {totalViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.1% discovery rate</span>
            </div>
          </div>
        </div>

        {/* Master Catalog Size */}
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone text-xs font-medium mb-3">
            <span>Managed Vector & Raw</span>
            <div className="w-8 h-8 rounded-[8px] bg-marigold/15 text-charcoal flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-charcoal" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-charcoal tracking-tight">
              {totalMB} MB
            </div>
            <div className="text-[11px] text-stone mt-1">
              Across {assets.length} official master assets
            </div>
          </div>
        </div>

        {/* Rights & Governance Status */}
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone text-xs font-medium mb-3">
            <span>Talent Rights Health</span>
            <div className="w-8 h-8 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              <span>{rightsStats.active + rightsStats.perpetual}</span>
              <span className="text-xs font-normal text-stone">/ {assets.length} cleared</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{rightsStats.expiringSoon} license expiring in &lt; 30d</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Top Downloaded Assets + Brand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Downloaded Assets Leaderboard (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-black/[0.08] rounded-[12px] p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-charcoal">Top Downloaded Master Assets</h2>
              <p className="text-[11px] text-stone">Most utilized packaging dielines, lifestyle photography and vectors</p>
            </div>
            <span className="text-[11px] font-mono text-notion-blue font-semibold">Ranked by volume</span>
          </div>

          <div className="divide-y divide-black/[0.06] flex-1">
            {topAssets.map((asset, index) => {
              const maxDownloads = topAssets[0]?.downloadsCount || 1;
              const barPercent = Math.round(((asset.downloadsCount || 0) / maxDownloads) * 100);

              return (
                <div 
                  key={asset.id} 
                  onClick={() => onOpenAssetDetail(asset)}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-paper-warmth/60 px-2 rounded-[8px] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold font-mono text-stone w-4 text-center">
                      #{index + 1}
                    </span>
                    <div className="w-11 h-11 rounded-[8px] overflow-hidden bg-paper-warmth border border-black/[0.08] shrink-0">
                      <img 
                        src={asset.previewUrl} 
                        alt={asset.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-charcoal truncate max-w-[260px]">
                          {asset.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-paper-warmth text-graphite border border-black/[0.08]">
                          .{asset.fileFormat}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone font-mono mt-0.5 truncate">
                        {asset.brand} · {asset.category} · {asset.fileSize}
                      </div>
                    </div>
                  </div>

                  <div className="w-36 shrink-0 text-right">
                    <div className="text-xs font-bold font-mono text-charcoal">
                      {(asset.downloadsCount || 0).toLocaleString()} <span className="text-[10px] text-stone font-normal">downloads</span>
                    </div>
                    <div className="w-full bg-black/[0.06] rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div 
                        className="bg-notion-blue h-full rounded-full transition-all duration-500" 
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
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-charcoal mb-1">Brand Consumption Share</h2>
            <p className="text-[11px] text-stone mb-5">Download demand distributed across Boon Rawd brands</p>

            <div className="space-y-4">
              {Object.entries(brandDownloads).map(([brand, data]) => {
                const percent = totalDownloads > 0 ? Math.round((data.downloads / totalDownloads) * 100) : 0;
                
                let brandColorClass = 'bg-marigold';
                if (brand === 'LEO') brandColorClass = 'bg-coral';
                else if (brand === 'U BEER') brandColorClass = 'bg-amber-400';
                else if (brand === 'BOON RAWD') brandColorClass = 'bg-charcoal';

                return (
                  <div key={brand} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-charcoal">{brand}</span>
                      <span className="font-mono text-graphite text-[11px]">
                        {data.downloads.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-paper-warmth rounded-full h-2 overflow-hidden border border-black/[0.06]">
                      <div 
                        className={`h-full rounded-full ${brandColorClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-stone">
                      {data.assetsCount} master files in catalog
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.06] bg-paper-warmth/60 p-3 rounded-[8px]">
            <div className="text-xs font-semibold text-charcoal mb-1">Compliance Insight</div>
            <p className="text-[11px] text-graphite leading-relaxed">
              SINGHA brand assets represent the highest commercial packaging demand, followed by LEO retail POSM assets in Thailand and Indochina.
            </p>
          </div>
        </div>

      </div>

      {/* Row 3: Regional Distribution & DRM Attention Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Global Regional Distribution */}
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-notion-blue" />
              <h2 className="text-sm font-bold text-charcoal">Global Regional Download Hubs</h2>
            </div>
            <span className="text-[11px] text-stone">5 Active Global Hubs</span>
          </div>

          <div className="space-y-3">
            {regionalUsage.map((hub) => (
              <div 
                key={hub.region} 
                className="p-3 bg-paper-warmth rounded-[8px] border border-black/[0.06] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-charcoal">{hub.region}</div>
                  <div className="text-[11px] text-stone font-mono mt-0.5">
                    {hub.downloads.toLocaleString()} downloads · {hub.percent}% volume
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[6px] border border-emerald-200">
                    {hub.trend}
                  </span>
                  <div className="w-16 bg-white rounded-full h-1.5 overflow-hidden border border-black/[0.08]">
                    <div 
                      className="bg-notion-blue h-full rounded-full" 
                      style={{ width: `${hub.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Rights Expiry Radar (DRM) */}
        <div className="bg-white border border-black/[0.08] rounded-[12px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-charcoal">DRM & Approval Governance Radar</h2>
            </div>
            <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-[6px] border border-amber-200">
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
                  className="p-3 border border-black/[0.08] hover:border-black/[0.2] rounded-[8px] bg-white hover:bg-paper-warmth/50 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-[6px] overflow-hidden bg-paper-warmth shrink-0 mt-0.5 border border-black/[0.08]">
                      <img src={asset.previewUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-charcoal truncate group-hover:text-notion-blue">
                        {asset.title}
                      </div>
                      <div className="text-[11px] text-stone mt-0.5">
                        Talent: {asset.rights?.talentName || 'Corporate Model Release'} · Ref: {asset.rights?.contractReference || 'N/A'}
                      </div>
                      <div className="text-[10px] text-graphite font-mono mt-0.5">
                        License Expiry: {asset.rights?.licenseExpiresAt || '2026-11-20'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isExpiring && (
                      <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-marigold/20 text-charcoal border border-marigold/40">
                        Expiring Soon
                      </span>
                    )}
                    {isReview && (
                      <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-sky-tint text-notion-blue border border-notion-blue/20">
                        In Review
                      </span>
                    )}
                    {isDraft && (
                      <span className="inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-paper-warmth text-stone border border-black/[0.08]">
                        Draft
                      </span>
                    )}
                    <div className="text-[10px] text-notion-blue font-medium mt-1 group-hover:underline flex items-center justify-end gap-1">
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
      <div className="bg-white border border-black/[0.08] rounded-[12px] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-notion-blue" />
            <h2 className="text-sm font-bold text-charcoal">Agency & Regional Marketer Search Intent</h2>
          </div>
          <span className="text-[11px] text-stone font-mono">Semantic & Keyword Queries</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topSearchQueries.map((item) => (
            <div 
              key={item.query}
              className="p-3 rounded-[8px] bg-paper-warmth border border-black/[0.06] flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-medium text-charcoal truncate font-mono">
                  "{item.query}"
                </div>
                <div className="text-[11px] text-stone mt-0.5">
                  {item.count} queries recorded
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-[6px] border border-black/[0.06] shrink-0">
                {item.growth}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
