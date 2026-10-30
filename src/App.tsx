import React, { useState, useEffect, useMemo } from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation, 
  useParams, 
  useSearchParams, 
  Link 
} from 'react-router-dom';
import { 
  DAMAsset, 
  SharedLink, 
  UserSession, 
  UserRole,
  RolePermissions,
  AccountRequest,
  Collection,
  AuditLogEntry,
  AssetComment,
  ApprovalStatus,
  RightsStatus,
  FilterState, 
  BrandName, 
  AssetCategory 
} from './types/dam';
import { initialAssets } from './data/initialAssets';
import { Header } from './components/Header';
import { SidebarNav, NavItemData } from './components/SidebarNav';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { NaturalSearchBar } from './components/NaturalSearchBar';
import { AssetFilters } from './components/AssetFilters';
import { AssetGrid } from './components/AssetGrid';
import { BulkRenameUpdate } from './components/BulkRenameModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { RightsExpiryAlertWidget } from './components/RightsExpiryAlertWidget';
import { BatchAiAutoTagModal } from './components/BatchAiAutoTagModal';
import { WatermarkEngineModal } from './components/WatermarkEngineModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ShareModal } from './components/ShareModal';
import { ShareLinksManager } from './components/ShareLinksManager';
import { RecipientPortal } from './components/RecipientPortal';
import { UploadModal } from './components/UploadModal';
import { BrandGuidelinesView } from './components/BrandGuidelinesView';
import { HandbookView } from './components/HandbookView';
import { AiLabView } from './components/AiLabView';
import { RolePermissionManager } from './components/RolePermissionManager';
import { SettingsView } from './components/SettingsView';
import { CollectionsManager } from './components/CollectionsManager';
import { AuthModal } from './components/AuthModal';
import { ProfileDropdown } from './components/ui/profile-dropdown';
import { BentoGrid, BentoCard } from './components/ui/bento-grid';
import { useTheme } from './theme/ThemeContext';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search, 
  Command, 
  Upload, 
  ChevronDown, 
  Check,
  ShieldCheck,
  Sparkles,
  User,
  Settings,
  LogOut,
  ArrowRight,
  Shield,
  ExternalLink,
  HardDrive,
  Sun,
  Moon
} from 'lucide-react';

// Default Role Permissions Matrix with Governance & Watermarking
const defaultRolePermissions: Record<UserRole, RolePermissions> = {
  'Global Brand Director': {
    canUpload: true,
    canDelete: true,
    canDownloadMasterRaw: true,
    canCreateShareLinks: true,
    canAccessDarkMarketRestricted: true,
    canManageUsers: true,
    canEditGuidelines: true,
    canApproveAssets: true,
    canDownloadWatermarkedOnly: false,
  },
  'Brand Administrator': {
    canUpload: true,
    canDelete: true,
    canDownloadMasterRaw: true,
    canCreateShareLinks: true,
    canAccessDarkMarketRestricted: true,
    canManageUsers: true,
    canEditGuidelines: false,
    canApproveAssets: true,
    canDownloadWatermarkedOnly: false,
  },
  'Content Creator': {
    canUpload: true,
    canDelete: false,
    canDownloadMasterRaw: true,
    canCreateShareLinks: false,
    canAccessDarkMarketRestricted: true,
    canManageUsers: false,
    canEditGuidelines: false,
    canApproveAssets: false,
    canDownloadWatermarkedOnly: false,
  },
  'Regional Downloader': {
    canUpload: false,
    canDelete: false,
    canDownloadMasterRaw: false,
    canCreateShareLinks: false,
    canAccessDarkMarketRestricted: false,
    canManageUsers: false,
    canEditGuidelines: false,
    canApproveAssets: false,
    canDownloadWatermarkedOnly: false,
  },
  'Agency Partner': {
    canUpload: false,
    canDelete: false,
    canDownloadMasterRaw: false,
    canCreateShareLinks: false,
    canAccessDarkMarketRestricted: false,
    canManageUsers: false,
    canEditGuidelines: false,
    canApproveAssets: false,
    canDownloadWatermarkedOnly: true,
  },
};

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // Master Assets State
  const [assets, setAssets] = useState<DAMAsset[]>(() => {
    const saved = localStorage.getItem('singha_dam_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialAssets;
      }
    }
    return initialAssets;
  });

  // Role Permissions Matrix
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, RolePermissions>>(() => {
    const saved = localStorage.getItem('singha_dam_rbac');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultRolePermissions;
  });

  // User Session
  const [userSession, setUserSession] = useState<UserSession>({
    id: 'user-korn',
    name: 'Korn Boonrawd',
    email: 'korn.b@boonrawd.co.th',
    role: 'Global Brand Director',
    region: 'Asia Pacific',
    country: 'Thailand',
    brandAccess: ['SINGHA', 'LEO', 'U BEER', 'BOON RAWD'],
    companyName: 'Boon Rawd Brewery Co., Ltd.',
    jobTitle: 'Global Brand Director & Asset Custodian',
    boonrawdContact: 'Somchai Prasert (Corporate Affairs)',
    status: 'Active',
  });

  // Collections State
  const [collections, setCollections] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('singha_dam_collections');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'col-global-2026',
        title: '2026 Global Brand Campaign & Lifestyle',
        description: 'Approved key visuals and social celebration media for Bangkok, Tokyo, and London markets.',
        assetIds: ['asset-toast-lifestyle', 'asset-festival-crowd', 'asset-bottle-bar'],
        createdAt: '2026-10-15T08:00:00Z',
        createdBy: 'Global Brand Director',
      },
      {
        id: 'col-packaging-dielines',
        title: 'Boon Rawd Packaging & Can Dielines',
        description: 'Technical vector blueprints for 330ml aluminum cans, 630ml bottles, and 6-pack cartons.',
        assetIds: ['asset-can-ice', 'asset-packaging-can-vector', 'asset-bottle-vector', 'asset-leo-packaging-kv'],
        createdAt: '2026-09-20T11:30:00Z',
        createdBy: 'Packaging R&D Studio',
      },
      {
        id: 'col-dark-market-kit',
        title: 'Legal Dark Market Compliance Kit',
        description: 'Mandatory white-on-yellow vector symbols for markets with strict alcohol advertising laws.',
        assetIds: ['asset-dark-market-logo', 'asset-posm-coasters', 'asset-handbook-pdf'],
        createdAt: '2026-08-10T14:00:00Z',
        createdBy: 'Legal & Corporate Affairs',
      },
    ];
  });

  // Account Requests Queue (PDF Page 7-8)
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>(() => {
    const saved = localStorage.getItem('singha_dam_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'req-01',
        name: 'Aiden Chen',
        email: 'aiden.c@apexspirits.sg',
        requestedRole: 'Regional Downloader',
        region: 'Asia Pacific',
        country: 'Singapore',
        requestedBrands: ['SINGHA', 'LEO'],
        companyName: 'Apex Beverage Distributors SG',
        jobTitle: 'Senior Trade Marketing Lead',
        boonrawdContact: 'Piti Bhirombhakdi',
        requestMessage: 'Need high-res POSM and dark market assets for Singapore Formula 1 activation.',
        requestedAt: '2026-10-25T11:20:00Z',
        status: 'Pending',
      },
      {
        id: 'req-02',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@publicis.co.uk',
        requestedRole: 'Content Creator',
        region: 'Europe & UK',
        country: 'United Kingdom',
        requestedBrands: ['SINGHA'],
        companyName: 'Publicis Media London',
        jobTitle: 'Creative Director',
        boonrawdContact: 'Korn Boonrawd',
        requestMessage: 'Leading the autumn Thai Food & Singha festival promotional campaign across 300 venues.',
        requestedAt: '2026-10-26T15:45:00Z',
        status: 'Pending',
      },
    ];
  });

  // Security Audit Log Stream
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('singha_dam_audit');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'log-1',
        timestamp: '2026-10-26 23:40',
        user: 'Korn Boonrawd',
        role: 'Global Brand Director',
        action: 'SHARE_CREATE',
        details: 'Generated 7-day expiring share pack for Singha Global Campaign (4 assets)',
        region: 'Asia Pacific (Bangkok HQ)',
      },
      {
        id: 'log-2',
        timestamp: '2026-10-26 20:15',
        user: 'Elena Cruz',
        role: 'Regional Downloader',
        action: 'DOWNLOAD',
        details: 'Downloaded Singha 330ml Can Master Dieline & Print Artwork (.AI 35 MB)',
        region: 'North America (Los Angeles)',
      },
      {
        id: 'log-3',
        timestamp: '2026-10-26 18:30',
        user: 'Korn Boonrawd',
        role: 'Global Brand Director',
        action: 'METADATA_EDIT',
        details: 'Tagged Dark Market Logo as alcohol advertising compliant',
        region: 'Asia Pacific (Bangkok HQ)',
      },
    ];
  });

  // Shared Links Vault State
  const [shares, setShares] = useState<SharedLink[]>(() => {
    const saved = localStorage.getItem('singha_dam_shares');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
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
        recipientEmail: 'partner.agency@singhabrandworld.com',
        creatorName: 'Boon Rawd Regional Admin',
        createdAt: new Date().toISOString(),
        viewsCount: 14,
        downloadsCount: 5,
        status: 'active',
      },
    ];
  });

  // Persist State
  useEffect(() => {
    localStorage.setItem('singha_dam_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('singha_dam_shares', JSON.stringify(shares));
  }, [shares]);

  useEffect(() => {
    localStorage.setItem('singha_dam_rbac', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    localStorage.setItem('singha_dam_collections', JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem('singha_dam_requests', JSON.stringify(accountRequests));
  }, [accountRequests]);

  useEffect(() => {
    localStorage.setItem('singha_dam_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Router Navigation
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedBrand, setSelectedBrand] = useState<BrandName | 'ALL'>('ALL');

  // Dashboard & Sidebar Layout State (As requested)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState('Singha Corporation (Global HQ)');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showBentoSpotlight, setShowBentoSpotlight] = useState(true);

  // Global Keyboard Shortcut: ⌘K for search palette, ⌘, for settings/profile
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsAuthModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    brand: 'ALL',
    category: 'ALL',
    fileFormat: 'ALL',
    hasPeople: null,
    objectFilter: null,
    marketSuitability: null,
    colorFilter: null,
    searchQuery: '',
    isNaturalLanguageActive: true,
    collectionId: null,
    approvalStatus: 'ALL',
    rightsStatus: 'ALL',
  });

  useEffect(() => {
    setFilters((f) => ({ ...f, brand: selectedBrand }));
  }, [selectedBrand]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDetailAsset, setActiveDetailAsset] = useState<DAMAsset | null>(null);
  const [shareModalAssets, setShareModalAssets] = useState<DAMAsset[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dynamic Watermark Engine State
  const [watermarkModalAsset, setWatermarkModalAsset] = useState<DAMAsset | null>(null);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);

  // Batch AI Auto-Tagging State
  const [isBatchAiTagModalOpen, setIsBatchAiTagModalOpen] = useState(false);
  const [batchAiTagAssets, setBatchAiTagAssets] = useState<DAMAsset[]>([]);

  // AI Semantic Search State
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [activeAiInterpretation, setActiveAiInterpretation] = useState<string | null>(null);
  const [semanticMatches, setSemanticMatches] = useState<Map<string, { score: number; reason: string }>>(new Map());

  // Current active permissions for the logged-in session
  const currentPermissions = rolePermissions[userSession.role] || defaultRolePermissions['Regional Downloader'];

  const addAuditLog = (action: AuditLogEntry['action'], details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: userSession.name,
      role: userSession.role,
      action,
      details,
      region: `${userSession.region} (${userSession.country})`,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Switch Role Simulator
  const handleSwitchRole = (newRole: UserRole) => {
    setUserSession((prev) => ({
      ...prev,
      role: newRole,
    }));
    addAuditLog('ROLE_CHANGE', `Switched active session persona to ${newRole}`);
  };

  // Request Approvals
  const handleApproveRequest = (requestId: string) => {
    const req = accountRequests.find((r) => r.id === requestId);
    if (!req) return;

    setAccountRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );
    addAuditLog('REQUEST_APPROVED', `Approved ${req.requestedRole} credentials for ${req.name} (${req.companyName})`);
  };

  const handleRejectRequest = (requestId: string) => {
    setAccountRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected' } : r))
    );
  };

  // Natural language semantic search
  const handleExecuteSearch = async (query: string) => {
    if (!query.trim()) {
      setSemanticMatches(new Map());
      setActiveAiInterpretation(null);
      return;
    }

    setIsAiSearching(true);
    try {
      const res = await fetch('/api/ai/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, assets }),
      });

      const data = await res.json();
      if (data.success && data.matches) {
        const map = new Map<string, { score: number; reason: string }>();
        data.matches.forEach((m: any) => {
          map.set(m.id, {
            score: m.relevanceScore,
            reason: m.matchReasonTh || m.matchReasonEn,
          });
        });
        setSemanticMatches(map);
        setActiveAiInterpretation(`Interpreted concepts: "${query}" across visual entities and brand attributes.`);
      }
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Path-based collection match
  const matchCollection = location.pathname.match(/^\/collections\/([^/]+)$/);
  const routeCollectionId = matchCollection ? matchCollection[1] : null;
  const activeCollectionId = routeCollectionId || filters.collectionId;

  // Filter Computation
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Collection filter
      if (activeCollectionId) {
        const col = collections.find((c) => c.id === activeCollectionId);
        if (!col || !col.assetIds.includes(asset.id)) return false;
      }

      // Brand filter
      if (filters.brand !== 'ALL' && asset.brand !== filters.brand) return false;

      // Category filter
      if (filters.category !== 'ALL' && asset.category !== filters.category) return false;

      // Format filter
      if (filters.fileFormat !== 'ALL' && asset.fileFormat !== filters.fileFormat) return false;

      // People filter
      if (filters.hasPeople === true && !asset.detectedFaces.hasPeople) return false;
      if (filters.hasPeople === false && asset.detectedFaces.hasPeople) return false;

      // Object filter
      if (filters.objectFilter) {
        const hasObj = asset.detectedObjects.some((o) => o.label.toLowerCase() === filters.objectFilter?.toLowerCase());
        if (!hasObj) return false;
      }

      // Legal Dark Market filter
      if (filters.marketSuitability && asset.marketSuitability !== filters.marketSuitability) {
        return false;
      }

      // Color filter
      if (filters.colorFilter) {
        const hasColor = asset.dominantColors.some((c) => c.hex.toLowerCase() === filters.colorFilter?.toLowerCase());
        if (!hasColor) return false;
      }

      // Lifecycle Approval filter
      if (filters.approvalStatus && filters.approvalStatus !== 'ALL' && asset.approvalStatus !== filters.approvalStatus) {
        return false;
      }

      // Rights status filter
      if (filters.rightsStatus && filters.rightsStatus !== 'ALL' && asset.rights?.rightsStatus !== filters.rightsStatus) {
        return false;
      }

      // Semantic Search Match Filter
      if (semanticMatches.size > 0) {
        return semanticMatches.has(asset.id);
      }

      // Basic keyword search fallback
      if (filters.searchQuery.trim() && semanticMatches.size === 0) {
        const q = filters.searchQuery.toLowerCase();
        const inTitle = asset.title.toLowerCase().includes(q);
        const inTags = asset.tags.some((t) => t.toLowerCase().includes(q));
        const inObjects = asset.detectedObjects.some((o) => o.label.toLowerCase().includes(q));
        const inCategory = asset.category.toLowerCase().includes(q);
        if (!inTitle && !inTags && !inObjects && !inCategory) return false;
      }

      return true;
    });
  }, [assets, filters, semanticMatches, collections]);

  // Categories count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Logos & Identity': 0,
      'Packaging': 0,
      'Campaign Imagery': 0,
      'POSM & Retail': 0,
      'Guidelines & Print': 0,
    };
    assets.forEach((a) => {
      if (counts[a.category] !== undefined) counts[a.category]++;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name as AssetCategory,
      count,
    }));
  }, [assets]);

  // Popular Objects
  const popularObjects = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((a) => {
      a.detectedObjects.forEach((obj) => {
        counts[obj.label] = (counts[obj.label] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [assets]);

  // Selection handlers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredAssets.map((a) => a.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    setFilters({
      brand: 'ALL',
      category: 'ALL',
      fileFormat: 'ALL',
      hasPeople: null,
      objectFilter: null,
      marketSuitability: null,
      colorFilter: null,
      searchQuery: '',
      isNaturalLanguageActive: true,
      collectionId: null,
      approvalStatus: 'ALL',
      rightsStatus: 'ALL',
    });
    setSelectedBrand('ALL');
    setSemanticMatches(new Map());
    setActiveAiInterpretation(null);
  };

  // Asset Approval Lifecycle Updater
  const handleUpdateApprovalStatus = (assetId: string, newStatus: ApprovalStatus) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, approvalStatus: newStatus } : a))
    );
    if (activeDetailAsset && activeDetailAsset.id === assetId) {
      setActiveDetailAsset((prev) => (prev ? { ...prev, approvalStatus: newStatus } : null));
    }
    addAuditLog('APPROVAL_CHANGE', `Updated asset "${assetId}" lifecycle status to ${newStatus}`);
  };

  // Share link handlers
  const handleOpenShareModal = (assetsToShare: DAMAsset[]) => {
    if (!currentPermissions.canCreateShareLinks) {
      alert(`Access Restricted: Your current role (${userSession.role}) cannot create external share links. Switch to Brand Administrator or Global Director.`);
      return;
    }
    setShareModalAssets(assetsToShare);
    setIsShareModalOpen(true);
  };

  const handleShareCreated = (newShare: SharedLink) => {
    setShares((prev) => [newShare, ...prev]);
    addAuditLog('SHARE_CREATE', `Created expiring link "${newShare.title}" (${newShare.assetIds.length} assets)`);
  };

  const handleRevokeShare = (shareId: string) => {
    fetch(`/api/shares/${shareId}`, { method: 'DELETE' }).catch(() => {});
    setShares((prev) =>
      prev.map((s) => (s.id === shareId ? { ...s, status: 'revoked' } : s))
    );
    addAuditLog('SHARE_REVOKE', `Revoked access to share link ${shareId}`);
  };

  // Download simulation with Watermark enforcement for Agency Partners
  const handleDownloadSingle = (asset: DAMAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPermissions.canDownloadWatermarkedOnly || userSession.role === 'Agency Partner') {
      setWatermarkModalAsset(asset);
      setIsWatermarkModalOpen(true);
      return;
    }
    addAuditLog('DOWNLOAD', `Downloaded asset "${asset.filename}"`);
    const link = document.createElement('a');
    link.href = asset.previewUrl || '#';
    link.download = asset.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBatchDownload = (selectedAssets: DAMAsset[]) => {
    addAuditLog('DOWNLOAD', `Batch downloaded ${selectedAssets.length} assets as ZIP archive`);
    const link = document.createElement('a');
    link.href = '#';
    link.download = `Singha_Brand_Assets_Batch_${selectedAssets.length}_files.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch AI Auto-Tagging
  const handleOpenBatchAiTag = (assetsToTag: DAMAsset[]) => {
    setBatchAiTagAssets(assetsToTag);
    setIsBatchAiTagModalOpen(true);
  };

  const handleApplyBatchAiUpdates = (updatedAssets: DAMAsset[]) => {
    const updatedMap = new Map(updatedAssets.map((a) => [a.id, a]));
    setAssets((prev) => prev.map((asset) => updatedMap.get(asset.id) || asset));

    if (activeDetailAsset && updatedMap.has(activeDetailAsset.id)) {
      setActiveDetailAsset(updatedMap.get(activeDetailAsset.id)!);
    }

    addAuditLog(
      'METADATA_EDIT',
      `AI Vision auto-tagged ${updatedAssets.length} assets with Gemini 3.8 Flash (updated objects, faces, colors, tags)`
    );
  };

  // Batch Delete
  const handleBatchDelete = (idsToDelete: string[]) => {
    if (!currentPermissions.canDelete) {
      alert(`Permission Denied: Deletion requires Global Brand Director or Brand Administrator privileges.`);
      return;
    }
    setAssets((prev) => prev.filter((a) => !idsToDelete.includes(a.id)));
    setSelectedIds([]);
    addAuditLog('METADATA_EDIT', `Deleted ${idsToDelete.length} assets from brand catalog`);
  };

  // Batch Rename
  const handleBatchRename = (updates: BulkRenameUpdate[]) => {
    setAssets((prev) =>
      prev.map((asset) => {
        const update = updates.find((u) => u.id === asset.id);
        if (!update) return asset;
        return {
          ...asset,
          title: update.newTitle,
          filename: update.newFilename,
        };
      })
    );
    addAuditLog('METADATA_EDIT', `Bulk renamed ${updates.length} assets with pattern rules`);
  };

  // Batch Add to Collection
  const handleBatchAddToCollection = (selectedAssets: DAMAsset[]) => {
    const colTitle = prompt('Enter existing collection name or new collection name:', '2026 Campaign Pack');
    if (!colTitle) return;

    const existing = collections.find((c) => c.title.toLowerCase() === colTitle.toLowerCase());
    if (existing) {
      const mergedIds = Array.from(new Set([...existing.assetIds, ...selectedAssets.map((a) => a.id)]));
      setCollections((prev) =>
        prev.map((c) => (c.id === existing.id ? { ...c, assetIds: mergedIds } : c))
      );
    } else {
      const newCol: Collection = {
        id: `col-${Date.now().toString(36)}`,
        title: colTitle,
        description: `Collection containing ${selectedAssets.length} assets`,
        assetIds: selectedAssets.map((a) => a.id),
        createdAt: new Date().toISOString(),
        createdBy: userSession.name,
      };
      setCollections((prev) => [newCol, ...prev]);
    }
    alert(`Added ${selectedAssets.length} assets to collection "${colTitle}"`);
  };

  // Upload handler
  const handleAssetUploaded = (newAsset: DAMAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
    setActiveDetailAsset(newAsset);
    addAuditLog('UPLOAD', `Uploaded new asset "${newAsset.filename}" with AI vision tags`);
  };

  // Favorites toggle
  const handleToggleFavorite = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, isFavorite: !a.isFavorite } : a))
    );
    if (activeDetailAsset && activeDetailAsset.id === assetId) {
      setActiveDetailAsset((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Comments
  const handleAddComment = (assetId: string, comment: AssetComment) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, comments: [...(a.comments || []), comment] }
          : a
      )
    );
    if (activeDetailAsset && activeDetailAsset.id === assetId) {
      setActiveDetailAsset((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), comment] } : null
      );
    }
    addAuditLog('METADATA_EDIT', `Added note to asset "${assetId}": ${comment.text}`);
  };

  // Version Restore
  const handleRestoreVersion = (assetId: string, versionNumber: string) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, version: versionNumber } : a))
    );
    if (activeDetailAsset && activeDetailAsset.id === assetId) {
      setActiveDetailAsset((prev) => (prev ? { ...prev, version: versionNumber } : null));
    }
    addAuditLog('VERSION_RESTORE', `Restored version v${versionNumber} for asset "${assetId}"`);
  };

  // Upload new version
  const handleUploadNewVersion = (assetId: string, notes: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;
    const nextVer = (parseFloat(asset.version) + 0.1).toFixed(1);
    const newVerItem = {
      version: nextVer,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: userSession.name,
      notes,
      fileSize: asset.fileSize,
    };

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, version: nextVer, versions: [newVerItem, ...a.versions] }
          : a
      )
    );
    if (activeDetailAsset && activeDetailAsset.id === assetId) {
      setActiveDetailAsset((prev) =>
        prev
          ? {
              ...prev,
              version: nextVer,
              versions: [newVerItem, ...prev.versions],
            }
          : null
      );
    }
    addAuditLog('UPLOAD', `Committed revision v${nextVer} for asset "${asset.filename}"`);
  };

  // Dedicated Recipient Portal Mode for /share/:shareId
  if (location.pathname.startsWith('/share/')) {
    return (
      <RecipientPortal
        allAssets={assets}
        onBackToDam={() => navigate('/shares')}
      />
    );
  }

  const renderAssetsLibrary = () => (
    <div className="space-y-4">
      {/* Natural Language Semantic Search Bar */}
      <NaturalSearchBar
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((f) => ({ ...f, searchQuery: q }))}
        onExecuteSearch={handleExecuteSearch}
        isAiSearching={isAiSearching}
        activeAiInterpretation={activeAiInterpretation}
        totalResults={filteredAssets.length}
      />

      {/* Automated Rights & License Expiration Radar Widget */}
      <RightsExpiryAlertWidget
        assets={assets}
        onOpenAssetDetail={(asset) => setActiveDetailAsset(asset)}
        onFilterExpiring={() => {
          setFilters((f) => ({ ...f, rightsStatus: 'Expiring Soon' }));
        }}
        userSession={userSession}
        onLogAudit={(action, details) => addAuditLog(action as any, details)}
      />

      {/* Bento Spotlight Hub for Assets Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)]"></span>
            <span className="text-xs font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">
              Bento Asset Spotlight & Curated Hubs
            </span>
          </div>
          <button
            onClick={() => setShowBentoSpotlight(!showBentoSpotlight)}
            className="text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer flex items-center gap-1 transition-colors font-['Geist',sans-serif]"
          >
            <span>{showBentoSpotlight ? 'Collapse Spotlight' : 'Expand Bento Spotlight'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showBentoSpotlight ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showBentoSpotlight && (
          <BentoGrid className="lg:grid-cols-3 auto-rows-[16rem]">
            {/* Bento 1: 2026 Global Campaign Pack (Span 2) */}
            <BentoCard
              name="2026 Global Brand Campaign & Lifestyle"
              description="Approved high-resolution key visuals, glassware toasts, and rooftop social celebrations."
              badge="Curated Pack · 3 Assets"
              Icon={Sparkles}
              className="lg:col-span-2"
              background={
                <div className="w-full h-full relative overflow-hidden bg-[var(--surface-subtle)]">
                  <img
                    src="/src/assets/images/singha_beer_lifestyle_toast_1793083582441.jpg"
                    alt="Singha 2026 Lifestyle"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/80 to-transparent" />
                </div>
              }
              cta="Filter Campaign Assets"
              onClick={() => {
                setFilters((f) => ({ ...f, collectionId: 'col-global-2026' }));
                navigate('/collections/col-global-2026');
              }}
            />

            {/* Bento 2: Legal Dark Market Vector Kit (Span 1) */}
            <BentoCard
              name="Dark Market Compliance Kit"
              description="Official white-on-yellow vector symbols for markets with strict alcohol advertising prohibitions."
              badge="Strict Legal · 100% Cleared"
              Icon={ShieldCheck}
              className="lg:col-span-1"
              background={
                <div className="w-full h-full relative overflow-hidden bg-amber-500/10 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[var(--border-card)] flex items-center justify-center font-bold text-[var(--text-secondary)] text-xl font-mono">
                    1933
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/80 to-transparent" />
                </div>
              }
              cta="Filter Dark Market"
              onClick={() => {
                setFilters((f) => ({ ...f, marketSuitability: 'Dark Market Compliant' }));
              }}
            />

            {/* Bento 3: Packaging & Can Dielines (Span 1) */}
            <BentoCard
              name="Packaging Dielines & 330ml Can Blueprints"
              description="Technical vector blueprints for aluminum cans, 630ml bottles, and 6-pack master cartons."
              badge="Vector Assets · Print Master"
              Icon={HardDrive}
              className="lg:col-span-1"
              background={
                <div className="w-full h-full relative overflow-hidden bg-[var(--surface-subtle)] flex items-center justify-center">
                  <img
                    src="/src/assets/images/singha_packaging_can_ice_1793083582580.jpg"
                    alt="Packaging Dieline"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/80 to-transparent" />
                </div>
              }
              cta="Filter Packaging"
              onClick={() => {
                setFilters((f) => ({ ...f, category: 'Packaging & Vectors' }));
              }}
            />

            {/* Bento 4: Most Utilized Brand Asset (Span 2) */}
            <BentoCard
              name="Top Downloaded Master: Singha 330ml Can On Ice"
              description="300 DPI CMYK retail packaging visual with 1,248 logged direct downloads and 410 agency shares."
              badge="Velocity #1 · 1,248 Downloads"
              Icon={ArrowRight}
              className="lg:col-span-2"
              background={
                <div className="w-full h-full relative overflow-hidden bg-[var(--surface-subtle)]">
                  <img
                    src="/src/assets/images/singha_craft_bottle_bar_1793083583140.jpg"
                    alt="Top Downloaded Master"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/80 to-transparent" />
                </div>
              }
              cta="Inspect Asset"
              onClick={() => {
                const topA = assets.find((a) => a.id === 'asset-can-ice');
                if (topA) setActiveDetailAsset(topA);
              }}
            />
          </BentoGrid>
        )}
      </div>

      {/* Active Collection Filter Bar if clicked from Collections or URL */}
      {activeCollectionId && (
        <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[12px] flex items-center justify-between text-xs text-[var(--text-primary)] animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--color-brand)]">Active Collection:</span>
            <span className="text-[var(--text-secondary)] font-medium">
              {collections.find((c) => c.id === activeCollectionId)?.title || activeCollectionId}
            </span>
          </div>
          <button
            onClick={() => {
              setFilters((f) => ({ ...f, collectionId: null }));
              navigate('/assets');
            }}
            className="font-semibold text-[var(--color-brand)] hover:underline cursor-pointer"
          >
            Clear Collection Filter
          </button>
        </div>
      )}

      {/* 2-Column Desktop DAM Layout: Left Filters + Right Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Facet Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <AssetFilters
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            categories={categoryCounts}
            popularObjects={popularObjects}
            totalCount={assets.length}
          />
        </div>

        {/* Main Assets Grid */}
        <AssetGrid
          assets={filteredAssets}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onOpenDetail={(asset) => setActiveDetailAsset(asset)}
          onBatchShare={(selected) => handleOpenShareModal(selected)}
          onBatchDownload={handleBatchDownload}
          onBatchAiTag={handleOpenBatchAiTag}
          onBatchAddToCollection={handleBatchAddToCollection}
          onBatchDelete={handleBatchDelete}
          onBatchRename={handleBatchRename}
          onShareSingle={(asset, e) => {
            e.stopPropagation();
            handleOpenShareModal([asset]);
          }}
          onDownloadSingle={handleDownloadSingle}
          semanticMatchScores={semanticMatches}
          canDelete={currentPermissions.canDelete}
          activeCategory={filters.category}
          onSelectCategory={(cat) => setFilters((f) => ({ ...f, category: cat as any }))}
        />
      </div>
    </div>
  );

  // Active Navigation and Breadcrumb derivation
  const currentPath = location.pathname;
  let activeTitle = 'Assets Library';
  let activeNavId = 'assets';

  if (currentPath.startsWith('/collections')) {
    activeTitle = 'Collections & Kits';
    activeNavId = 'collections';
    if (activeCollectionId) {
      const col = collections.find((c) => c.id === activeCollectionId);
      if (col) activeTitle = `Collections / ${col.title}`;
    }
  } else if (currentPath.startsWith('/guidelines')) {
    activeNavId = 'guidelines';
    if (currentPath.includes('/master')) {
      activeTitle = 'Guidelines / 01. Master Logo';
      activeNavId = 'g-master';
    } else if (currentPath.includes('/dark')) {
      activeTitle = 'Guidelines / 02. Dark Market Logo';
      activeNavId = 'g-dark';
    } else if (currentPath.includes('/secondary')) {
      activeTitle = 'Guidelines / 03. ESTD 1933 Mark';
      activeNavId = 'g-secondary';
    } else if (currentPath.includes('/color')) {
      activeTitle = 'Guidelines / 04. Color Breakdown';
      activeNavId = 'g-color';
    } else if (currentPath.includes('/font')) {
      activeTitle = 'Guidelines / 05. Typography';
      activeNavId = 'g-font';
    } else if (currentPath.includes('/intro')) {
      activeTitle = 'Guidelines / 06. Introduction';
      activeNavId = 'g-intro';
    } else {
      activeTitle = 'Brand Guidelines';
    }
  } else if (currentPath.startsWith('/shares')) {
    activeTitle = 'Shared Links Vault';
    activeNavId = 'shares';
  } else if (currentPath.startsWith('/analytics')) {
    activeTitle = 'DAM Analytics & Insights';
    activeNavId = 'analytics';
  } else if (currentPath.startsWith('/roles')) {
    activeNavId = 'roles';
    if (currentPath.includes('/requests')) {
      activeTitle = 'Governance / Registration Queue';
      activeNavId = 'r-requests';
    } else if (currentPath.includes('/matrix')) {
      activeTitle = 'Governance / Permission Matrix';
      activeNavId = 'r-matrix';
    } else if (currentPath.includes('/regions')) {
      activeTitle = 'Governance / Dark Market Hubs';
      activeNavId = 'r-regions';
    } else if (currentPath.includes('/audit')) {
      activeTitle = 'Governance / Security Audit Log';
      activeNavId = 'r-audit';
    } else {
      activeTitle = 'Global RBAC & Governance';
    }
  } else if (currentPath.startsWith('/handbook')) {
    activeTitle = 'Official Handbook';
    activeNavId = 'handbook';
  } else if (currentPath.startsWith('/ai-lab')) {
    activeTitle = 'AI Recognition Lab';
    activeNavId = 'ai-lab';
  } else if (currentPath.startsWith('/settings')) {
    activeTitle = 'Platform Settings & Quotas';
    activeNavId = 'settings';
  }

  const rolesList: UserRole[] = [
    'Global Brand Director',
    'Brand Administrator',
    'Content Creator',
    'Regional Downloader',
    'Agency Partner',
  ];

  const rolesWithDetails: { role: UserRole; desc: string; badge: string }[] = [
    { role: 'Global Brand Director', desc: 'Full platform governance, asset deletion & security rules', badge: 'Full Admin' },
    { role: 'Brand Administrator', desc: 'Asset uploads, metadata management & collection curation', badge: 'Admin' },
    { role: 'Content Creator', desc: 'Media upload, version control & AI auto-tagging scans', badge: 'Creator' },
    { role: 'Regional Downloader', desc: 'Pre-approved commercial high-resolution master downloads', badge: 'Downloader' },
    { role: 'Agency Partner', desc: 'External agency view-only with watermarked assets access', badge: 'Partner' },
  ];

  return (
    <div className="flex h-screen bg-[var(--surface-app)] text-[var(--text-primary)] overflow-hidden font-sans">
      
      {/* Collapsible Sidebar from user specification */}
      <div 
        className={`h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-[var(--surface-card)] border-r border-[var(--border-card)] ${
          isSidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 border-none'
        }`}
      >
        <SidebarNav 
          className="w-[260px] border-none bg-[var(--surface-card)]"
          activeId={activeNavId}
          onSelect={(item) => {
            if (item.id === 'search') setIsCommandPaletteOpen(true);
          }}
          activeWorkspace={activeWorkspace}
          onWorkspaceSelect={setActiveWorkspace}
          selectedBrand={selectedBrand}
          onBrandSelect={setSelectedBrand}
          userSession={userSession}
          activeShareCount={shares.filter((s) => new Date(s.expiresAt) > new Date() && s.status === 'active').length}
          pendingRequestsCount={accountRequests.filter((r) => r.status === 'Pending').length}
          collectionsCount={collections.length}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-hidden bg-[var(--surface-app)] text-[var(--text-primary)]">
        
        {/* Top Header Bar - Figma Theme Tokens strictly aligned with index.css */}
        <div className="h-16 border-b border-[var(--border-card)] flex items-center px-4 sm:px-6 justify-between bg-[var(--surface-card)] shrink-0 shadow-xs">
          {/* Left Zone: Sidebar toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-[8px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />}
            </button>

            <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] min-w-0 font-sans">
              <span className="truncate max-w-[200px] font-medium hidden sm:inline text-[var(--text-primary)]">
                {activeWorkspace}
              </span>
              <span className="hidden sm:inline text-[var(--text-muted)] font-normal">/</span>
              <span className="font-bold text-[var(--text-primary)] truncate tracking-tight">{activeTitle}</span>
            </div>
          </div>

          {/* Right Zone: Search, Upload, Theme Toggle, and User Profile with Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Command Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center justify-between w-52 lg:w-60 h-10 px-3 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] rounded-[8px] text-[var(--text-secondary)] text-[12px] cursor-pointer transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <span className="truncate">Search or jump to...</span>
              </div>
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-[var(--text-secondary)] bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[4px] shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Figma Token Dual-Theme Mode Toggle (Sun / Moon) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-[8px] border border-[var(--border-card)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#CAEB0E] transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-[#5945F1] transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Upload Button */}
            {currentPermissions.canUpload && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="notion-btn-primary h-10 px-3.5 rounded-[8px] font-medium text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            )}

            {/* Singha DAM Profile Dropdown */}
            <ProfileDropdown
              data={{
                name: userSession.name,
                email: userSession.email,
                avatar: "",
                subscription: "Enterprise Custodian",
                model: "Gemini 2.5 Flash",
                companyName: userSession.companyName,
                region: `${userSession.country} (${userSession.region})`,
                usedStorage: "14.2 GB",
                totalStorage: "50 GB",
              }}
              currentRole={userSession.role}
              onSwitchRole={handleSwitchRole}
              onOpenSettings={() => navigate('/roles/matrix')}
              onOpenGuidelines={() => navigate('/guidelines')}
              onOpenShares={() => navigate('/shares')}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onSignOut={() => setIsAuthModalOpen(true)}
              onOpenAiLab={() => navigate('/ai-lab')}
              onOpenAnalytics={() => navigate('/analytics')}
              onOpenProfileSettings={() => navigate('/settings')}
            />
          </div>
        </div>

        {/* Scrollable Main Viewport with Real Browser Routes */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/assets" replace />} />
            <Route path="/assets" element={renderAssetsLibrary()} />
            <Route path="/collections/:collectionId" element={renderAssetsLibrary()} />
            
            <Route
              path="/collections"
              element={
                <CollectionsManager
                  collections={collections}
                  assets={assets}
                  onCreateCollection={(newCol) => setCollections((prev) => [newCol, ...prev])}
                  onOpenCollectionInLibrary={(colId) => {
                    setFilters((f) => ({ ...f, collectionId: colId }));
                    navigate(`/collections/${colId}`);
                  }}
                  onShareCollection={(col) => {
                    const colAssets = assets.filter((a) => col.assetIds.includes(a.id));
                    handleOpenShareModal(colAssets);
                  }}
                  onDeleteCollection={(colId) => {
                    if (confirm('Delete this collection?')) {
                      setCollections((prev) => prev.filter((c) => c.id !== colId));
                    }
                  }}
                />
              }
            />

            <Route
              path="/guidelines"
              element={
                <BrandGuidelinesView
                  onOpenPdf={() => navigate('/handbook')}
                  onFilterCategory={(cat) => {
                    setFilters((f) => ({ ...f, category: cat }));
                    navigate('/assets');
                  }}
                />
              }
            />
            <Route
              path="/guidelines/:section"
              element={
                <BrandGuidelinesView
                  onOpenPdf={() => navigate('/handbook')}
                  onFilterCategory={(cat) => {
                    setFilters((f) => ({ ...f, category: cat }));
                    navigate('/assets');
                  }}
                />
              }
            />

            <Route
              path="/shares"
              element={
                <ShareLinksManager
                  shares={shares}
                  assets={assets}
                  onOpenCreateShare={() => handleOpenShareModal(assets.slice(0, 3))}
                  onOpenRecipientPortal={(id) => navigate(`/share/${id}`)}
                  onRevokeShare={handleRevokeShare}
                />
              }
            />

            <Route
              path="/roles"
              element={
                <RolePermissionManager
                  currentUser={userSession}
                  onSwitchRole={handleSwitchRole}
                  accountRequests={accountRequests}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  rolePermissions={rolePermissions}
                  onUpdateRolePermissions={(role, perms) => {
                    setRolePermissions((prev) => ({ ...prev, [role]: perms }));
                    addAuditLog('ROLE_CHANGE', `Updated permission matrix for ${role}`);
                  }}
                  auditLogs={auditLogs}
                />
              }
            />
            <Route
              path="/roles/:tab"
              element={
                <RolePermissionManager
                  currentUser={userSession}
                  onSwitchRole={handleSwitchRole}
                  accountRequests={accountRequests}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  rolePermissions={rolePermissions}
                  onUpdateRolePermissions={(role, perms) => {
                    setRolePermissions((prev) => ({ ...prev, [role]: perms }));
                    addAuditLog('ROLE_CHANGE', `Updated permission matrix for ${role}`);
                  }}
                  auditLogs={auditLogs}
                />
              }
            />

            <Route
              path="/settings"
              element={
                <SettingsView
                  userSession={userSession}
                  onUpdateSession={setUserSession}
                  onSwitchRole={handleSwitchRole}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              }
            />

            <Route path="/handbook" element={<HandbookView />} />

            <Route
              path="/analytics"
              element={
                <AnalyticsView
                  assets={assets}
                  shares={shares}
                  userSession={userSession}
                  onOpenAssetDetail={(asset) => setActiveDetailAsset(asset)}
                />
              }
            />

            <Route
              path="/ai-lab"
              element={
                <AiLabView
                  assets={assets}
                  onOpenDetail={(asset) => setActiveDetailAsset(asset)}
                />
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/assets" replace />} />
          </Routes>
        </div>
      </div>

      {/* Command Palette Modal (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        assets={assets}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onSelectAsset={(asset) => setActiveDetailAsset(asset)}
      />

      {/* Floating Inspector Modal */}
      {activeDetailAsset && (
        <AssetDetailModal
          asset={activeDetailAsset}
          onClose={() => setActiveDetailAsset(null)}
          onOpenShare={(asset) => handleOpenShareModal([asset])}
          onTagClick={(tag) => {
            setFilters((f) => ({ ...f, searchQuery: tag }));
            handleExecuteSearch(tag);
          }}
          userSession={userSession}
          userPermissions={currentPermissions}
          onToggleFavorite={handleToggleFavorite}
          onAddComment={handleAddComment}
          onRestoreVersion={handleRestoreVersion}
          onUploadNewVersion={handleUploadNewVersion}
          onUpdateApprovalStatus={handleUpdateApprovalStatus}
          onLaunchWatermark={(asset) => {
            setWatermarkModalAsset(asset);
            setIsWatermarkModalOpen(true);
          }}
        />
      )}

      {/* Dynamic Protective Watermark Engine Modal */}
      {isWatermarkModalOpen && watermarkModalAsset && (
        <WatermarkEngineModal
          asset={watermarkModalAsset}
          isOpen={isWatermarkModalOpen}
          onClose={() => setIsWatermarkModalOpen(false)}
          userSession={userSession}
          isMandatoryForRole={userSession.role === 'Agency Partner'}
        />
      )}

      {/* Batch AI Auto-Tagging Modal */}
      {isBatchAiTagModalOpen && (
        <BatchAiAutoTagModal
          isOpen={isBatchAiTagModalOpen}
          onClose={() => setIsBatchAiTagModalOpen(false)}
          selectedAssets={batchAiTagAssets}
          onApplyUpdates={handleApplyBatchAiUpdates}
        />
      )}

      {/* Create Expiring Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          selectedAssets={shareModalAssets}
          onShareCreated={handleShareCreated}
          onOpenRecipientPortal={(id) => {
            setIsShareModalOpen(false);
            navigate(`/share/${id}`);
          }}
        />
      )}

      {/* Upload with AI Vision Auto-Tagger Modal */}
      {isUploadModalOpen && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onAssetUploaded={handleAssetUploaded}
          defaultBrand={selectedBrand}
        />
      )}

      {/* Auth / Role Switcher Modal (PDF Replica) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={userSession}
          onUpdateUser={setUserSession}
        />
      )}
    </div>
  );
}
