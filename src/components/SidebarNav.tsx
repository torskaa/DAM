import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut,
  Hash,
  ChevronDown,
  ChevronRight,
  Inbox,
  BookOpen,
  Calendar,
  Activity,
  CreditCard,
  Globe,
  Terminal,
  Blocks,
  ShieldCheck,
  Sparkles,
  Share2,
  FileText,
  UserCheck
} from 'lucide-react';
import { BrandName, UserRole, UserSession } from '../types/dam';

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  path?: string;
  action?: () => void;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

interface WorkspaceSwitcherProps {
  selectedWorkspace: string;
  onSelectWorkspace: (ws: string) => void;
  selectedBrand: BrandName | 'ALL';
  onSelectBrand: (brand: BrandName | 'ALL') => void;
  role: UserRole;
}

export function WorkspaceSwitcher({
  selectedWorkspace,
  onSelectWorkspace,
  selectedBrand,
  onSelectBrand,
  role,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const workspaces = [
    { name: 'Singha Corporation (Global HQ)', plan: 'Enterprise Custodian', brand: 'ALL' as const },
    { name: 'Singha Beer Global', plan: 'Brand Workspace', brand: 'SINGHA' as const },
    { name: 'Leo Beer Thailand', plan: 'Regional Hub', brand: 'LEO' as const },
    { name: 'U Beer Creative Lab', plan: 'Innovation Hub', brand: 'U BEER' as const },
    { name: 'Boon Rawd Corporate Affairs', plan: 'Legal & Compliance', brand: 'BOON RAWD' as const },
  ];

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2.5 py-2 mb-3 rounded-[8px] hover:bg-paper-warmth cursor-pointer transition-colors select-none group border border-black/[0.08] bg-white"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[8px] bg-sky-tint text-notion-blue flex items-center justify-center font-bold text-[14px] shadow-xs shrink-0">
            🦁
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-[13px] font-semibold leading-tight text-charcoal truncate max-w-[145px]">
              {selectedWorkspace}
            </span>
            <span className="text-[11px] text-stone leading-tight truncate">
              {role}
            </span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-stone group-hover:text-charcoal transition-colors shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-white border border-black/[0.08] rounded-[12px] shadow-xl z-50 py-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            <span className="px-3 py-1 text-[10px] font-bold text-stone uppercase tracking-wider">
              Switch Brand Hub
            </span>
            {workspaces.map((ws) => (
              <div 
                key={ws.name}
                onClick={() => {
                  onSelectWorkspace(ws.name);
                  onSelectBrand(ws.brand);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 mx-1 text-[12px] rounded-[8px] cursor-pointer transition-colors flex flex-col ${
                  selectedWorkspace === ws.name 
                    ? 'bg-sky-tint text-notion-blue font-semibold border-l-2 border-notion-blue' 
                    : 'text-graphite hover:bg-paper-warmth'
                }`}
              >
                <span className="truncate">{ws.name}</span>
                <span className="text-[10px] text-stone font-normal">{ws.plan}</span>
              </div>
            ))}
            <div className="h-px bg-black/[0.06] my-1 mx-2" />
            <div 
              onClick={() => {
                onSelectBrand('ALL');
                onSelectWorkspace('Singha Corporation (Global HQ)');
                setIsOpen(false);
              }}
              className="px-3 py-1.5 mx-1 text-[12px] text-notion-blue hover:bg-sky-tint rounded-[8px] cursor-pointer flex items-center gap-1.5 font-medium transition-colors"
            >
              <span className="text-[15px] leading-none mb-0.5">↺</span> Reset to All Brands
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (item: NavItemData) => void;
  level?: number;
}) {
  const isActive = activeId === item.id || (item.path && window.location.pathname === item.path);
  const hasChildren = !!item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    onSelect(item);
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[8px] cursor-pointer transition-all duration-150 select-none
          ${isActive 
            ? 'bg-sky-tint text-notion-blue font-semibold' 
            : 'text-graphite hover:bg-black/5 hover:text-charcoal'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <item.icon 
            className={`w-[16px] h-[16px] shrink-0 transition-colors
              ${isActive ? 'text-notion-blue' : 'text-stone group-hover:text-charcoal'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-[13px] tracking-tight truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-stone bg-white border border-black/[0.12] rounded-[4px] shadow-xs">
               {item.shortcut}
             </kbd>
          )}
          {item.badge !== undefined && (
            <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full ${isActive ? 'bg-marigold text-charcoal' : 'bg-marigold/20 text-charcoal'}`}>
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-notion-blue' : 'text-stone'} ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5 animate-in fade-in duration-200">
          <div 
            className="absolute top-0 bottom-0 border-l border-[rgba(0,0,0,0.08)]"
            style={{ left: `${level * 12 + 17.5}px` }}
          />
          {item.children!.map((child) => (
            <NavItem 
              key={child.id} 
              item={child} 
              activeId={activeId} 
              onSelect={onSelect} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarNavProps {
  className?: string;
  activeId: string;
  onSelect: (item: NavItemData) => void;
  activeWorkspace: string;
  onWorkspaceSelect: (ws: string) => void;
  selectedBrand: BrandName | 'ALL';
  onBrandSelect: (brand: BrandName | 'ALL') => void;
  userSession: UserSession;
  activeShareCount: number;
  pendingRequestsCount: number;
  collectionsCount: number;
  onOpenAuth: () => void;
}

export function SidebarNav({ 
  className = '',
  activeId,
  onSelect,
  activeWorkspace,
  onWorkspaceSelect,
  selectedBrand,
  onBrandSelect,
  userSession,
  activeShareCount,
  pendingRequestsCount,
  collectionsCount,
  onOpenAuth,
}: SidebarNavProps) {
  const navigate = useNavigate();

  const navGroups: NavGroupData[] = [
    {
      items: [
        { id: 'search', title: 'Search & Command', icon: Search, shortcut: '⌘K' },
        { id: 'assets', title: 'Assets Library', icon: LayoutDashboard, path: '/assets' },
        { id: 'collections', title: 'Collections & Kits', icon: FolderKanban, badge: collectionsCount, path: '/collections' },
        { id: 'shares', title: 'Shared Links Vault', icon: Share2, badge: activeShareCount > 0 ? activeShareCount : undefined, path: '/shares' },
        { id: 'analytics', title: 'DAM Analytics & Insights', icon: Activity, path: '/analytics' },
        { id: 'ai-lab', title: 'AI Recognition Lab', icon: Sparkles, path: '/ai-lab' },
      ]
    },
    {
      heading: 'Brand Guidelines',
      items: [
        { 
          id: 'guidelines', 
          title: 'Identity Manual', 
          icon: BookOpen,
          path: '/guidelines',
          children: [
            { id: 'g-master', title: '01. Master Logo', icon: Hash, path: '/guidelines/master' },
            { id: 'g-dark', title: '02. Dark Market Logo', icon: Hash, path: '/guidelines/dark' },
            { id: 'g-secondary', title: '03. ESTD 1933 Mark', icon: Hash, path: '/guidelines/secondary' },
            { id: 'g-color', title: '04. Color Breakdown', icon: Hash, path: '/guidelines/color' },
            { id: 'g-font', title: '05. Typography', icon: Hash, path: '/guidelines/font' },
            { id: 'g-intro', title: '06. Introduction', icon: Hash, path: '/guidelines/intro' },
          ]
        },
        { id: 'handbook', title: 'Official Handbook (PDF)', icon: FileText, path: '/handbook' },
      ]
    },
    {
      heading: 'Enterprise Governance',
      items: [
        { 
          id: 'roles', 
          title: 'Global RBAC & Access', 
          icon: ShieldCheck,
          badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
          path: '/roles',
          children: [
            { id: 'r-requests', title: 'Registration Queue', icon: Hash, badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined, path: '/roles' },
            { id: 'r-matrix', title: 'Permission Matrix', icon: Hash, path: '/roles' },
            { id: 'r-regions', title: 'Dark Market Hubs', icon: Globe, path: '/roles' },
            { id: 'r-audit', title: 'Security Audit Log', icon: Terminal, path: '/roles' },
          ]
        },
        {
          id: 'brand-hubs',
          title: 'Brand Portfolios',
          icon: Globe,
          children: [
            { id: 'b-singha', title: 'Singha Beer', icon: Hash, action: () => onBrandSelect('SINGHA') },
            { id: 'b-leo', title: 'Leo Beer', icon: Hash, action: () => onBrandSelect('LEO') },
            { id: 'b-u', title: 'U Beer', icon: Hash, action: () => onBrandSelect('U BEER') },
            { id: 'b-boonrawd', title: 'Boon Rawd Brewery', icon: Hash, action: () => onBrandSelect('BOON RAWD') },
            { id: 'b-all', title: 'All Brands (Global)', icon: Hash, action: () => onBrandSelect('ALL') },
          ]
        }
      ]
    }
  ];

  const bottomItems: NavItemData[] = [
    { 
      id: 'settings', 
      title: 'Profile Wizard', 
      icon: Settings, 
      shortcut: '⌘,',
      action: onOpenAuth 
    },
    { 
      id: 'active-role', 
      title: `${userSession.role}`, 
      icon: UserCheck,
      path: '/roles'
    },
  ];

  return (
    <div className={`flex flex-col w-[260px] h-full bg-white border-r border-[rgba(0,0,0,0.08)] p-3 font-sans shrink-0 ${className}`}>
      {/* Brand & Workspace Switcher */}
      <WorkspaceSwitcher 
        selectedWorkspace={activeWorkspace} 
        onSelectWorkspace={onWorkspaceSelect}
        selectedBrand={selectedBrand}
        onSelectBrand={onBrandSelect}
        role={userSession.role}
      />

      {/* Scrollable Navigation Groups */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-1">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[11px] font-bold tracking-wider text-[#757575] uppercase">
                {group.heading}
              </span>
            )}
            {group.items.map((item) => (
              <NavItem 
                key={item.id} 
                item={item} 
                activeId={activeId} 
                onSelect={(selected) => {
                  if (selected.action) {
                    selected.action();
                  } else if (selected.path) {
                    navigate(selected.path);
                  }
                  onSelect(selected);
                }} 
              />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Sticky Utility Items */}
      <div className="mt-auto pt-3 border-t border-[rgba(0,0,0,0.08)] flex flex-col gap-0.5">
        {bottomItems.map((item) => (
          <NavItem 
            key={item.id} 
            item={item} 
            activeId={activeId} 
            onSelect={(selected) => {
              if (selected.action) {
                selected.action();
              } else if (selected.path) {
                navigate(selected.path);
              }
              onSelect(selected);
            }} 
          />
        ))}
      </div>
    </div>
  );
}
