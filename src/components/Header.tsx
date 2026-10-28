import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandName, UserSession, UserRole } from '../types/dam';
import { 
  FolderLock, 
  BookOpen, 
  Upload, 
  Sparkles, 
  Grid, 
  Share2, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Folder,
  ChevronDown,
  Check
} from 'lucide-react';

interface HeaderProps {
  selectedBrand: BrandName | 'ALL';
  setSelectedBrand: (brand: BrandName | 'ALL') => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  userSession: UserSession;
  onSwitchRole: (newRole: UserRole) => void;
  activeShareCount: number;
  pendingRequestsCount: number;
  canUpload: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedBrand,
  setSelectedBrand,
  onOpenUpload,
  onOpenAuth,
  userSession,
  onSwitchRole,
  activeShareCount,
  pendingRequestsCount,
  canUpload,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const rolesList: UserRole[] = [
    'Global Brand Director',
    'Brand Administrator',
    'Content Creator',
    'Regional Downloader',
    'Agency Partner',
  ];

  const navLinks = [
    { path: '/', label: 'Assets Library', active: currentPath === '/' || currentPath === '/assets' },
    { path: '/collections', label: 'Collections', active: currentPath.startsWith('/collections') },
    { path: '/guidelines', label: 'Brand Guidelines', active: currentPath.startsWith('/guidelines') },
    { path: '/shares', label: 'Shared Links', badge: activeShareCount, active: currentPath === '/shares' },
    { path: '/roles', label: 'Global Access & Roles', badge: pendingRequestsCount, isUrgent: pendingRequestsCount > 0, active: currentPath === '/roles' },
    { path: '/handbook', label: 'Handbook', active: currentPath === '/handbook' },
    { path: '/ai-lab', label: 'AI Recognition', icon: Sparkles, active: currentPath === '/ai-lab' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[rgba(0,0,0,0.08)]">
      {/* Top Bar: 3 Zones Separated by gap-8 (Notion Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Single text element wordmark with Character Mark */}
        <div className="flex items-center gap-3 shrink-0">
          <Link 
            to="/"
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none cursor-pointer"
          >
            {/* Notion-style Character Mark: Round face / lion in 2px colored border */}
            <div className="w-8 h-8 rounded-full border-2 border-[#ffb110] bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight shadow-xs group-hover:border-[#0075de] transition-colors">
              <span className="font-serif-editorial text-sm font-semibold">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#111111] leading-none whitespace-nowrap">
                Singha Brand World
              </span>
              <span className="text-[11px] text-[#757575] mt-0.5 whitespace-nowrap">
                Digital Asset Management
              </span>
            </div>
          </Link>
        </div>

        {/* Zone 2: Real router links with Notion typography */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-medium text-[#615d59]">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-[8px] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  item.active
                    ? 'text-[#0075de] bg-[#e6f3fe] font-semibold'
                    : 'hover:text-[#111111] hover:bg-[rgba(0,0,0,0.04)]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-[#ffb110]" />}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                    item.isUrgent ? 'bg-[#ffb110] text-black font-bold' : 'bg-[rgba(0,0,0,0.06)] text-[#615d59]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action (Notion Blue #0075de) & Persona Role Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] border border-[rgba(0,0,0,0.08)] bg-[#f6f5f4] hover:bg-[#ebe9e7] text-[12px] font-medium text-[#111111] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0075de]" />
              <span className="truncate max-w-[120px]">{userSession.role}</span>
              <ChevronDown className="w-3 h-3 text-[#757575]" />
            </button>

            {roleMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-64 bg-white rounded-[12px] shadow-lg border border-[rgba(0,0,0,0.08)] py-1.5 z-50 text-[12px] animate-in fade-in duration-150"
                onClick={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#757575] uppercase tracking-wider">
                  Switch Active Role (RBAC)
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r}
                    onClick={() => onSwitchRole(r)}
                    className="w-full text-left px-3 py-2 hover:bg-[#e6f3fe] flex items-center justify-between text-[#111111] transition-colors cursor-pointer"
                  >
                    <span>{r}</span>
                    {userSession.role === r && (
                      <Check className="w-3.5 h-3.5 text-[#0075de] font-bold" />
                    )}
                  </button>
                ))}
                <div className="border-t border-[rgba(0,0,0,0.06)] my-1" />
                <button
                  onClick={() => navigate('/roles')}
                  className="w-full text-left px-3 py-1.5 text-[#0075de] hover:underline font-medium text-[11px] cursor-pointer"
                >
                  Manage Role Permissions →
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button (Notion Blue #0075de) */}
          {canUpload ? (
            <button
              onClick={onOpenUpload}
              className="bg-[#0075de] hover:bg-[#0060b8] text-white text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Assets</span>
            </button>
          ) : (
            <div 
              title="Upload restricted for current role. Switch to Administrator or Creator."
              className="bg-[rgba(0,0,0,0.04)] text-[#757575] text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] whitespace-nowrap cursor-not-allowed flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload (Locked)</span>
            </div>
          )}

          {/* Account Profile Trigger */}
          <button
            onClick={onOpenAuth}
            className="w-8 h-8 rounded-full border border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] flex items-center justify-center text-[#111111] font-semibold text-[12px] hover:bg-[#ebe9e7] transition-colors cursor-pointer"
            title="User Profile & PDF Wizard"
          >
            {userSession.name.charAt(0)}
          </button>
        </div>
      </div>

      {/* Brand World Sub-strip with Notion Paper Warmth #f6f5f4 */}
      <div className="border-t border-[rgba(0,0,0,0.06)] bg-[#f6f5f4] px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="text-[#615d59] font-medium whitespace-nowrap">Brand World:</span>
            <div className="flex items-center gap-1">
              {(['ALL', 'SINGHA', 'LEO', 'U BEER', 'BOON RAWD'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedBrand === b
                      ? 'bg-white text-[#111111] shadow-xs border border-[rgba(0,0,0,0.08)]'
                      : 'text-[#615d59] hover:text-[#111111] hover:bg-[rgba(0,0,0,0.04)]'
                  }`}
                >
                  {b === 'ALL' ? 'All Brands' : b}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#615d59]">
            <span>Region: <strong className="text-[#111111]">{userSession.region}</strong></span>
            <span>·</span>
            <span>Path: <strong className="text-[#0075de] font-mono">{currentPath}</strong></span>
            <span>·</span>
            <span>Cloud Sync: <strong className="text-[#0075de] font-medium">Boon Rawd Global</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
