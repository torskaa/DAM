import React, { useState } from 'react';
import { UserSession, UserRole } from '../types/dam';
import { 
  Settings, 
  User, 
  Building2, 
  Globe2, 
  ShieldCheck, 
  HardDrive, 
  Sparkles, 
  Lock, 
  KeyRound, 
  Check, 
  Save, 
  Bell, 
  Sliders, 
  Database,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { BentoGrid, BentoCard } from './ui/bento-grid';

interface SettingsViewProps {
  userSession: UserSession;
  onUpdateSession: (updated: UserSession) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenAuthModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userSession,
  onUpdateSession,
  onSwitchRole,
  onOpenAuthModal,
}) => {
  const [name, setName] = useState(userSession.name);
  const [company, setCompany] = useState(userSession.companyName);
  const [jobTitle, setJobTitle] = useState(userSession.jobTitle);
  const [region, setRegion] = useState(userSession.region);
  const [notification, setNotification] = useState<string | null>(null);

  // Preference switches
  const [aiAutoTagging, setAiAutoTagging] = useState(true);
  const [bilingualDescriptions, setBilingualDescriptions] = useState(true);
  const [agencyWatermarkStrict, setAgencyWatermarkStrict] = useState(true);
  const [emailAlertsOnExpiry, setEmailAlertsOnExpiry] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSession({
      ...userSession,
      name,
      companyName: company,
      jobTitle,
      region,
    });
    setNotification('Profile settings updated successfully!');
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--color-brand)]">
              System Configuration
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">Bento Preferences Hub</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-heading">
            Platform Settings & User Profile
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage your custodian credentials, AI recognition parameters, agency watermarking policies, and storage quotas.
          </p>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="px-3.5 py-2 rounded-[8px] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-card)] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Switch Account / Wizard</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 rounded-[8px] text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* BENTO GRID OF SYSTEM PREFERENCES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento 1: User Profile & Organization (Span 2) */}
        <div className="lg:col-span-2 bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[var(--surface-subtle)] text-[var(--color-brand)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--color-brand)]" />
                </div>
                <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Custodian Identity & Enterprise Affiliation
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-[var(--surface-subtle)] text-[var(--color-brand)] font-semibold text-[10px] font-mono border border-[var(--color-brand)]/20">
                {userSession.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] text-xs text-[var(--text-primary)] focus:border-[var(--color-brand)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={userSession.email}
                  disabled
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)]/60 border border-[var(--border-card)] rounded-[8px] text-xs text-[var(--text-secondary)] font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] text-xs text-[var(--text-primary)] focus:border-[var(--color-brand)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] text-xs text-[var(--text-primary)] focus:border-[var(--color-brand)] outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Operating Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] text-xs text-[var(--text-primary)] focus:border-[var(--color-brand)] outline-none"
                >
                  <option value="Asia Pacific">Asia Pacific (Bangkok HQ)</option>
                  <option value="Southeast Asia">Southeast Asia (Singapore Hub)</option>
                  <option value="Europe & UK">Europe & UK (London Hub)</option>
                  <option value="North America">North America (Los Angeles Hub)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-end">
              <button
                type="submit"
                className="notion-btn-primary flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bento 2: Storage Quota Card (Span 1) */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-card)] mb-3">
              <div className="w-7 h-7 rounded-[8px] bg-[var(--surface-subtle)] text-[var(--color-brand)] flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-[var(--color-brand)]" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                DAM Storage Vault Quota
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--text-primary)]">Capacity Allocated</span>
                  <span className="font-mono text-[var(--text-secondary)] text-[11px]">14.2 GB / 50.0 GB</span>
                </div>
                <div className="w-full bg-[var(--surface-subtle)] h-2 rounded-full overflow-hidden border border-[var(--border-card)]">
                  <div className="bg-[var(--color-brand)] h-full rounded-full" style={{ width: '28.4%' }} />
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
                  28.4% utilized · Enterprise Global Tier
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border-card)] text-xs">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Vector Dielines (.AI, .EPS)</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">6.4 GB</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Key Visual Photography</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">5.8 GB</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Campaign Video POSM</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">1.8 GB</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Brand Handbooks (PDF)</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">0.2 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 3: AI Vision & Tagging Parameters (Span 2) */}
        <div className="lg:col-span-2 bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-card)]">
            <div className="w-7 h-7 rounded-[8px] bg-[var(--surface-subtle)] text-[var(--color-brand)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
            </div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">
              AI Vision & Automation Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Multimodal Ingest Scanning</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Auto-extract detected objects and dominant colors via Gemini 2.5 Flash</div>
              </div>
              <input
                type="checkbox"
                checked={aiAutoTagging}
                onChange={(e) => setAiAutoTagging(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-brand)] mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Bilingual Descriptions</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Dual Thai (TH) and English (EN) semantic descriptions for corporate media</div>
              </div>
              <input
                type="checkbox"
                checked={bilingualDescriptions}
                onChange={(e) => setBilingualDescriptions(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-brand)] mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Enforce Security Watermark</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Mandatory diagonal security watermark for Agency Partner & external downloads</div>
              </div>
              <input
                type="checkbox"
                checked={agencyWatermarkStrict}
                onChange={(e) => setAgencyWatermarkStrict(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-brand)] mt-0.5 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Rights Expiry Proactive Alert</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Receive notifications when talent release licenses approach 30-day threshold</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlertsOnExpiry}
                onChange={(e) => setEmailAlertsOnExpiry(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--color-brand)] mt-0.5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bento 4: Authorized Brand Portfolios (Span 1) */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-card)] mb-3">
              <div className="w-7 h-7 rounded-[8px] bg-[var(--surface-subtle)] text-[var(--color-brand)] flex items-center justify-center">
                <Globe2 className="w-4 h-4 text-[var(--color-brand)]" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                Authorized Brand Portfolios
              </h2>
            </div>

            <div className="space-y-2">
              {[
                { brand: 'SINGHA', note: 'Global Flagship Master', status: 'Full Clearance' },
                { brand: 'LEO', note: 'Domestic & Indochina POSM', status: 'Full Clearance' },
                { brand: 'U BEER', note: 'Innovation & Youth Lifestyle', status: 'Full Clearance' },
                { brand: 'BOON RAWD', note: 'Corporate Heritage & Dark Market', status: 'Full Clearance' },
              ].map((b) => (
                <div key={b.brand} className="p-2.5 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">{b.brand}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{b.note}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-[6px] border border-emerald-500/20">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
