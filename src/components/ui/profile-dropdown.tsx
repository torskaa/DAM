import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  HardDrive,
  Building2,
  Globe2,
  Shield,
  KeyRound,
  Share2
} from "lucide-react";
import { UserRole } from "@/src/types/dam";

export interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
  companyName?: string;
  region?: string;
  subscription?: string;
  model?: string;
  usedStorage?: string;
  totalStorage?: string;
}

const Gemini = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    style={{
      flex: "none",
      lineHeight: 1,
    }}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    {...props}
  >
    <title>Gemini Vision</title>
    <defs>
      <linearGradient
        id="gemini-notion-fill"
        x1="0%"
        x2="68.73%"
        y1="100%"
        y2="30.395%"
      >
        <stop offset="0%" stopColor="#0075de" />
        <stop offset="52%" stopColor="#097fe8" />
        <stop offset="100%" stopColor="#62aef0" />
      </linearGradient>
    </defs>
    <path
      d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
      fill="url(#gemini-notion-fill)"
      fillRule="nonzero"
    />
  </svg>
);

export const DEFAULT_DAM_USER: ProfileData = {
  name: "Korn Boonrawd",
  email: "korn.b@boonrawd.co.th",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  companyName: "Boon Rawd Brewery Co., Ltd.",
  region: "Bangkok HQ (APAC)",
  subscription: "Enterprise Custodian",
  model: "Gemini 2.5 Flash",
  usedStorage: "14.2 GB",
  totalStorage: "50 GB",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: ProfileData;
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onOpenSettings?: () => void;
  onOpenGuidelines?: () => void;
  onOpenShares?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onOpenAiLab?: () => void;
  onOpenAnalytics?: () => void;
  onOpenProfileSettings?: () => void;
}

export function ProfileDropdown({
  data = DEFAULT_DAM_USER,
  currentRole = "Global Brand Director",
  onSwitchRole,
  onOpenSettings,
  onOpenGuidelines,
  onOpenShares,
  onOpenAuth,
  onSignOut,
  onOpenAiLab,
  onOpenAnalytics,
  onOpenProfileSettings,
  className,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsRolePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; badge: string; desc: string }[] = [
    { role: 'Global Brand Director', badge: 'Full Access', desc: 'Full platform governance, asset deletion & security rules' },
    { role: 'Brand Administrator', badge: 'Admin', desc: 'Asset uploads, metadata management & collection curation' },
    { role: 'Content Creator', badge: 'Creator', desc: 'Media upload, version control & AI auto-tagging scans' },
    { role: 'Regional Downloader', badge: 'Downloader', desc: 'Commercial pre-approved master download permissions' },
    { role: 'Agency Partner', badge: 'Partner', desc: 'External agency view-only with watermarked assets access' },
  ];

  // Initials fallback
  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getRoleShortBadge = (role: UserRole) => {
    switch (role) {
      case 'Global Brand Director': return 'Director';
      case 'Brand Administrator': return 'Admin';
      case 'Content Creator': return 'Creator';
      case 'Regional Downloader': return 'Regional';
      case 'Agency Partner': return 'Partner';
      default: return 'User';
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative select-none", className)} {...props}>
      <div className="group relative">
        {/* Main Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-10 flex items-center gap-3 px-3 py-1.5 rounded-[8px] border transition-all duration-200 cursor-pointer focus:outline-none",
            "bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--border-card)]",
            isOpen 
              ? "border-[var(--color-brand)] bg-[var(--surface-subtle)] shadow-xs ring-2 ring-[var(--color-brand)]/20" 
              : "hover:border-[var(--color-brand)]/40 hover:bg-[var(--surface-hover)] shadow-xs"
          )}
        >
          {/* Text block: Name and Role */}
          <div className="text-left flex-1 min-w-0 pr-1">
            <div className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight leading-tight truncate max-w-[130px] sm:max-w-[160px]">
              {data.name}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-secondary)] tracking-tight leading-tight truncate flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="truncate max-w-[110px] sm:max-w-[140px] text-[var(--text-secondary)]">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Avatar with Singha Gold / Marigold ring */}
          <div className="relative shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#5945F1] via-[#FD02B0] to-[#CAEB0E] p-[1.5px] shadow-xs">
              <div className="w-full h-full rounded-full overflow-hidden bg-[var(--surface-app)] flex items-center justify-center text-white text-[11px] font-bold">
                {data.avatar ? (
                  <img
                    src={data.avatar}
                    alt={data.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <span className="uppercase text-[11px] font-semibold text-[var(--color-brand-secondary)]">{initials}</span>
              </div>
            </div>
          </div>
        </button>

        {/* Bending line indicator on the right */}
        <div
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none hidden sm:block",
            isOpen ? "opacity-100" : "opacity-40 group-hover:opacity-90"
          )}
        >
          <svg
            width="12"
            height="24"
            viewBox="0 0 12 24"
            fill="none"
            className={cn(
              "transition-all duration-200",
              isOpen
                ? "text-[var(--color-brand)] scale-110"
                : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
            )}
            aria-hidden="true"
          >
            <path
              d="M2 4C6 8 6 16 2 20"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Dropdown Menu Content - 12px Card Border Radius */}
        {isOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-80 p-2.5 bg-[var(--surface-card)] backdrop-blur-md border border-[var(--border-card)] rounded-[12px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right text-xs text-[var(--text-primary)]"
          >
            {/* 1. Header User Card - 12px radius */}
            <div 
              onClick={() => {
                if (onOpenProfileSettings) onOpenProfileSettings();
                setIsOpen(false);
              }}
              className="p-3 rounded-[12px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] mb-2 cursor-pointer transition-colors group"
              title="Click to view full user profile & settings"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5945F1] via-[#FD02B0] to-[#CAEB0E] p-[2px] shrink-0 shadow-xs">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[var(--surface-app)] flex items-center justify-center text-white text-xs font-bold">
                    {data.avatar ? (
                      <img
                        src={data.avatar}
                        alt={data.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className="uppercase font-semibold text-[var(--color-brand-secondary)]">{initials}</span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[var(--text-primary)] tracking-tight truncate group-hover:text-[var(--color-brand)] transition-colors">
                      {data.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                      {getRoleShortBadge(currentRole)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    {data.email}
                  </div>
                </div>
              </div>

              {/* Company & Region sub-detail */}
              <div className="mt-2.5 pt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                  <span className="truncate">{data.companyName || "Boon Rawd Brewery Co., Ltd."}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2 text-[var(--text-secondary)] font-mono text-[10px]">
                  <Globe2 className="w-3 h-3 text-[var(--text-secondary)]" />
                  <span>APAC</span>
                </div>
              </div>
            </div>

            {/* 2. RBAC Persona Switcher - 12px Card Border Radius */}
            <div className="mb-2 rounded-[12px] border border-[var(--border-card)] overflow-hidden bg-[var(--surface-card)]">
              <button
                type="button"
                onClick={() => setIsRolePickerOpen(!isRolePickerOpen)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-semibold text-[var(--text-primary)] truncate">
                      Active Role & Access
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] truncate">
                      Click to switch persona
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[11px] font-medium rounded-[8px] py-0.5 px-2 text-[var(--color-brand)] bg-[var(--surface-subtle)] border border-[var(--color-brand)]/20">
                    {currentRole.replace('Global ', '').replace('Administrator', 'Admin')}
                  </span>
                  <ChevronRight className={cn("w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200", isRolePickerOpen && "rotate-90")} />
                </div>
              </button>

              {/* Collapsible role selector */}
              {isRolePickerOpen && (
                <div className="p-1.5 bg-[var(--surface-subtle)] border-t border-[var(--border-card)] space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                    <span>Switch Role (RBAC)</span>
                    <span className="text-[9px] font-normal lowercase text-[var(--text-secondary)]">instant update</span>
                  </div>
                  {rolesList.map((r) => {
                    const isActive = currentRole === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          onSwitchRole?.(r.role);
                          setIsRolePickerOpen(false);
                        }}
                        className={cn(
                          "w-full px-2.5 py-1.5 rounded-[8px] cursor-pointer transition-all flex items-start justify-between text-left border",
                          isActive 
                            ? "bg-[var(--surface-card)] text-[var(--color-brand)] border-[var(--color-brand)]/40 font-semibold shadow-xs" 
                            : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold truncate leading-snug">{r.role}</span>
                            <span className={cn(
                              "text-[9px] px-1 py-0.2 rounded font-mono uppercase",
                              isActive ? "bg-[var(--surface-subtle)] text-[var(--color-brand)]" : "bg-[var(--border-card)] text-[var(--text-secondary)]"
                            )}>
                              {r.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] leading-tight mt-0.5 line-clamp-1">{r.desc}</div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-[var(--color-brand)] shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Platform Intelligence & Storage Status - 12px Card Border Radius */}
            <div className="space-y-1.5 mb-2">
              {/* Visual AI Engine (Clickable -> Opens AI Lab) */}
              <div 
                onClick={() => {
                  if (onOpenAiLab) onOpenAiLab();
                  setIsOpen(false);
                }}
                className="flex items-center justify-between p-2 rounded-[12px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] cursor-pointer transition-colors group"
                title="Open AI Recognition Lab"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Gemini className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-brand)] truncate transition-colors">
                      Visual AI Intelligence
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] truncate">
                      Multimodal Auto-tagging & Semantic Index
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-semibold rounded-[4px] py-0.5 px-1.5 text-[var(--color-brand)] bg-[var(--surface-card)] border border-[var(--color-brand)]/20">
                    {data.model || "Gemini 2.5 Flash"}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] transition-colors" />
                </div>
              </div>

              {/* Storage Vault Quota (Clickable -> Opens Analytics) */}
              <div 
                onClick={() => {
                  if (onOpenAnalytics) onOpenAnalytics();
                  setIsOpen(false);
                }}
                className="p-2 rounded-[12px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-card)] space-y-1.5 cursor-pointer transition-colors group"
                title="Open Consumption Analytics & Quotas"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium group-hover:text-[var(--color-brand)] transition-colors">
                    <HardDrive className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] transition-colors" />
                    <span>DAM Storage Vault</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--text-secondary)]">
                    <span>{data.usedStorage || "14.2 GB"} / {data.totalStorage || "50 GB"}</span>
                    <ChevronRight className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] transition-colors" />
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[var(--border-card)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-secondary)] rounded-full" style={{ width: '28.4%' }} />
                </div>
              </div>
            </div>

            {/* 4. Navigation Shortcuts - 8px Button Radius */}
            <div className="space-y-0.5 border-t border-[var(--border-card)] pt-1.5">
              <button
                type="button"
                onClick={() => {
                  onOpenProfileSettings?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)] transition-colors cursor-pointer text-left text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[12px] font-medium">Platform Settings & Quotas</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenSettings?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)] transition-colors cursor-pointer text-left text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[12px] font-medium">Global Governance & Matrix</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenGuidelines?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)] transition-colors cursor-pointer text-left text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[12px] font-medium">Brand Guidelines & Policies</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenShares?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)] transition-colors cursor-pointer text-left text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[12px] font-medium">Shared Links Vault</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAuth?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-[8px] hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)] transition-colors cursor-pointer text-left text-[var(--text-secondary)]"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[12px] font-medium">Account Credentials & Wizard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* 5. Separator & Sign Out */}
            <div className="my-1.5 border-t border-[var(--border-card)]" />

            <button
              type="button"
              onClick={() => {
                onSignOut?.();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-[8px] text-[#E53535] hover:bg-[#E53535]/10 transition-colors cursor-pointer text-left font-medium"
            >
              <LogOut className="w-3.5 h-3.5 text-[#E53535]" />
              <span className="text-[12px]">Switch Account / Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
