export type BrandName = 'SINGHA' | 'LEO' | 'U BEER' | 'BOON RAWD';

export type AssetCategory =
  | 'Logos & Identity'
  | 'Packaging'
  | 'Campaign Imagery'
  | 'POSM & Retail'
  | 'Guidelines & Print';

export type FileFormat = 'AI' | 'PSD' | 'JPG' | 'PNG' | 'PDF' | 'EPS';

export type UserRole =
  | 'Global Brand Director'
  | 'Brand Administrator'
  | 'Content Creator'
  | 'Regional Downloader'
  | 'Agency Partner';

export interface DetectedObject {
  label: string;
  confidence: number;
  category: 'Product' | 'Brand Logo' | 'Packaging' | 'Environment' | 'Merchandise' | 'Vehicle';
  box?: [number, number, number, number]; // [top, left, width, height] in percentages
}

export interface DetectedFacesInfo {
  count: number;
  hasPeople: boolean;
  expression?: string;
  sceneContext?: string;
}

export interface DominantColor {
  hex: string;
  name: string;
  pantoneMatch?: string;
}

export interface AssetVersion {
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  notes: string;
  fileSize: string;
}

export interface AssetComment {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export type ApprovalStatus = 'Draft' | 'In Review' | 'Approved' | 'Archived';

export type RightsStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Perpetual';

export interface AssetRights {
  rightsStatus: RightsStatus;
  talentName?: string;
  photographer?: string;
  agencyOwner?: string;
  usageTerritory: 'Global' | 'APAC' | 'Thailand Only' | 'North America' | 'Europe & UK';
  mediaChannels: string[];
  licenseExpiresAt: string; // YYYY-MM-DD
  contractReference?: string;
}

export interface DAMAsset {
  id: string;
  title: string;
  filename: string;
  brand: BrandName;
  category: AssetCategory;
  fileFormat: FileFormat;
  fileSize: string;
  fileSizeBytes: number;
  dimensions: {
    width: number;
    height: number;
  };
  resolutionDpi: number;
  colorSpace: string;
  previewUrl: string;
  originalDownloadUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  version: string;
  versions: AssetVersion[];
  comments?: AssetComment[];
  marketSuitability: 'Standard Commercial' | 'Dark Market Compliant' | 'Internal B2B';
  approvalStatus: ApprovalStatus;
  rights?: AssetRights;
  tags: string[];
  detectedObjects: DetectedObject[];
  detectedFaces: DetectedFacesInfo;
  dominantColors: DominantColor[];
  descriptionEn: string;
  descriptionTh: string;
  downloadsCount: number;
  viewsCount: number;
  isFavorite?: boolean;
}

export interface SharePermissions {
  canDownloadOriginal: boolean;
  canDownloadHighRes: boolean;
  allowWatermarkOnly: boolean;
}

export interface SharedLink {
  id: string;
  title: string;
  assetIds: string[];
  isPasswordProtected: boolean;
  password?: string;
  expiresAt: string;
  permissions: SharePermissions;
  recipientEmail?: string;
  creatorName: string;
  createdAt: string;
  viewsCount: number;
  downloadsCount: number;
  status: 'active' | 'expired' | 'revoked';
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  country: string;
  brandAccess: string[];
  companyName: string;
  jobTitle: string;
  boonrawdContact?: string;
  status: 'Active' | 'Pending Approval' | 'Suspended';
}

export interface AccountRequest {
  id: string;
  name: string;
  email: string;
  requestedRole: UserRole;
  region: string;
  country: string;
  requestedBrands: string[];
  companyName: string;
  jobTitle: string;
  boonrawdContact: string;
  requestMessage: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  assetIds: string[];
  createdAt: string;
  createdBy: string;
  colorTheme?: string;
  isPublic?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'UPLOAD' | 'DOWNLOAD' | 'SHARE_CREATE' | 'SHARE_REVOKE' | 'ROLE_CHANGE' | 'REQUEST_APPROVED' | 'METADATA_EDIT' | 'VERSION_RESTORE' | 'APPROVAL_CHANGE' | 'DRM_UPDATE';
  details: string;
  region: string;
}

export interface RolePermissions {
  canUpload: boolean;
  canDelete: boolean;
  canDownloadMasterRaw: boolean;
  canCreateShareLinks: boolean;
  canAccessDarkMarketRestricted: boolean;
  canManageUsers: boolean;
  canEditGuidelines: boolean;
  canApproveAssets: boolean;
  canDownloadWatermarkedOnly: boolean;
}

export interface FilterState {
  brand: BrandName | 'ALL';
  category: AssetCategory | 'ALL';
  fileFormat: FileFormat | 'ALL';
  hasPeople: boolean | null; // null = any
  objectFilter: string | null;
  marketSuitability: string | null;
  colorFilter: string | null;
  searchQuery: string;
  isNaturalLanguageActive: boolean;
  onlyFavorites?: boolean;
  collectionId?: string | null;
  approvalStatus?: ApprovalStatus | 'ALL';
  rightsStatus?: RightsStatus | 'ALL';
}
