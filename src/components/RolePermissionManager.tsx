import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserRole, 
  UserSession, 
  AccountRequest, 
  RolePermissions, 
  AuditLogEntry 
} from '../types/dam';
import { 
  ShieldCheck, 
  Users, 
  KeyRound, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Filter, 
  UserCheck, 
  AlertTriangle,
  History,
  Building,
  Check,
  ChevronRight
} from 'lucide-react';
import { BentoGrid, BentoCard } from './ui/bento-grid';

interface RolePermissionManagerProps {
  currentUser: UserSession;
  onSwitchRole: (newRole: UserRole) => void;
  accountRequests: AccountRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  rolePermissions: Record<UserRole, RolePermissions>;
  onUpdateRolePermissions: (role: UserRole, permissions: RolePermissions) => void;
  auditLogs: AuditLogEntry[];
}

export const RolePermissionManager: React.FC<RolePermissionManagerProps> = ({
  currentUser,
  onSwitchRole,
  accountRequests,
  onApproveRequest,
  onRejectRequest,
  rolePermissions,
  onUpdateRolePermissions,
  auditLogs,
}) => {
  const params = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const validTabs: ('requests' | 'matrix' | 'regions' | 'audit')[] = ['requests', 'matrix', 'regions', 'audit'];
  const initialTab = (params.tab && validTabs.includes(params.tab as any)) ? (params.tab as any) : 'requests';

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'matrix' | 'regions' | 'audit'>(initialTab);
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (params.tab && validTabs.includes(params.tab as any)) {
      setActiveSubTab(params.tab as any);
    }
  }, [params.tab]);

  const handleTabSelect = (tab: 'requests' | 'matrix' | 'regions' | 'audit') => {
    setActiveSubTab(tab);
    navigate(`/roles/${tab}`);
  };

  const availableRoles: { role: UserRole; desc: string; badge: string }[] = [
    { role: 'Global Brand Director', desc: 'Full authority across all brands, regions, and governance policies', badge: 'Super Admin' },
    { role: 'Brand Administrator', desc: 'Regional management, uploads, expiring link creation, and user approvals', badge: 'Admin' },
    { role: 'Content Creator', desc: 'Upload, AI tagging, and metadata curation without deletion authority', badge: 'Creator' },
    { role: 'Regional Downloader', desc: 'Approved access for local market distributors and print production', badge: 'Downloader' },
    { role: 'Agency Partner', desc: 'Restricted external view with watermarked or web-only exports', badge: 'External' },
  ];

  const handleTogglePermission = (role: UserRole, key: keyof RolePermissions) => {
    const current = rolePermissions[role];
    const updated = { ...current, [key]: !current[key] };
    onUpdateRolePermissions(role, updated);
    setNotification(`Updated ${key} permission for ${role}`);
    setTimeout(() => setNotification(null), 2500);
  };

  const pendingRequests = accountRequests.filter((r) => r.status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner with Active Role Switcher */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="notion-pill bg-[#ffb110] text-black font-semibold">
              Global Enterprise Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif] tracking-tight mt-1.5">
            Role & Permission Management (RBAC)
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl font-['Geist',sans-serif]">
            Simulate and enforce granular access control for Boon Rawd Brewery global employees, regional distributors, and external agency partners.
          </p>
        </div>

        {/* Instant Role Switcher Bar */}
        <div className="bg-[var(--surface-subtle)] p-3 rounded-[8px] border border-[var(--border-card)] flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Simulate Persona / Active Role:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableRoles.map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  onSwitchRole(r.role);
                  setNotification(`Switched active session to: ${r.role}`);
                  setTimeout(() => setNotification(null), 2500);
                }}
                className={`px-2.5 py-1 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                  currentUser.role === r.role
                    ? 'bg-[var(--color-brand)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {r.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-[#e6f3fe] text-[#0075de] border border-[#0075de]/30 rounded-[8px] text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#0075de] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Governance Pillars BentoGrid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">
            Enterprise Access Governance Bento Overview
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-mono">
            Granular RBAC, approvals queue & audit trail
          </span>
        </div>

        <BentoGrid className="lg:grid-cols-4">
          <BentoCard
            name="Registration Queue"
            description="Pending corporate and agency account requests awaiting credential verification."
            badge={`${pendingRequests.length} Pending`}
            Icon={UserCheck}
            className={activeSubTab === 'requests' ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-[var(--surface-subtle)] flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <Users className="w-24 h-24 text-[var(--color-brand)]/40" />
              </div>
            }
            cta="Review Requests"
            onClick={() => handleTabSelect('requests')}
          />

          <BentoCard
            name="Permission Matrix"
            description="Configure upload, deletion, master raw export, and watermarking across 5 user tiers."
            badge="5 Roles · 8 Permissions"
            Icon={KeyRound}
            className={activeSubTab === 'matrix' ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-[var(--surface-subtle)] flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <Lock className="w-24 h-24 text-[var(--text-secondary)]/20" />
              </div>
            }
            cta="Configure Matrix"
            onClick={() => handleTabSelect('matrix')}
          />

          <BentoCard
            name="Regional Hubs & Dark Markets"
            description="Strict alcohol advertising compliance for Indochina, Singapore, UK, and APAC jurisdictions."
            badge="5 Global Hubs"
            Icon={Globe}
            className={activeSubTab === 'regions' ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-[var(--surface-subtle)] flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <Globe className="w-24 h-24 text-amber-500/30" />
              </div>
            }
            cta="Inspect Regional Hubs"
            onClick={() => handleTabSelect('regions')}
          />

          <BentoCard
            name="Security Audit Log"
            description="Immutable telemetry stream tracking downloads, shares, permission edits, and revisions."
            badge={`${auditLogs.length} Events`}
            Icon={History}
            className={activeSubTab === 'audit' ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-[var(--surface-subtle)] flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <ShieldCheck className="w-24 h-24 text-emerald-500/30" />
              </div>
            }
            cta="View Audit Stream"
            onClick={() => handleTabSelect('audit')}
          />
        </BentoGrid>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[10px] shadow-xs">
        {[
          { id: 'requests', label: `Pending Access Requests (${pendingRequests.length})`, icon: UserCheck },
          { id: 'matrix', label: 'Role Permissions Matrix', icon: KeyRound },
          { id: 'regions', label: 'Global Regional Hubs & Dark Markets', icon: Globe },
          { id: 'audit', label: `Security & Activity Audit Log (${auditLogs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[8px] whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[var(--surface-subtle)] text-[var(--color-brand)] font-semibold border border-[var(--color-brand)]/20 shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: PENDING ACCESS REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border-card)] bg-[var(--surface-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">
                User Registration & Role Requests Queue
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-['Geist',sans-serif]">
                Submitted from the 4-step registration wizard. Approved users gain instant credentialed access.
              </p>
            </div>
            <span className="notion-pill bg-[#ffb110] text-black font-semibold">
              {pendingRequests.length} Awaiting Approval
            </span>
          </div>

          {accountRequests.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-secondary)] text-xs">
              No pending account requests in the queue.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-card)]">
              {accountRequests.map((req) => (
                <div key={req.id} className="p-5 hover:bg-[var(--surface-hover)] transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-center justify-center font-bold text-[var(--text-primary)] text-sm">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{req.name}</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                          {req.email} · {req.companyName} ({req.jobTitle})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                        req.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : req.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[var(--surface-subtle)] p-3 rounded-lg border border-[var(--border-card)]">
                    <div>
                      <span className="text-[var(--text-secondary)] text-[11px] block">Requested Role & Region:</span>
                      <strong className="text-[var(--text-primary)]">{req.requestedRole}</strong> · {req.region} ({req.country})
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] text-[11px] block">Requested Brands:</span>
                      <strong className="text-[var(--text-primary)]">{req.requestedBrands.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)] text-[11px] block">Boonrawd Contact Person:</span>
                      <strong className="text-[var(--text-primary)]">{req.boonrawdContact}</strong>
                    </div>
                  </div>

                  {req.requestMessage && (
                    <p className="text-xs text-[var(--text-primary)] italic bg-[var(--surface-subtle)] p-2.5 rounded border border-[var(--border-card)]">
                      "{req.requestMessage}"
                    </p>
                  )}

                  {/* Approve / Reject Actions */}
                  {req.status === 'Pending' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => onRejectRequest(req.id)}
                        className="px-3 py-1.5 border border-[var(--border-card)] hover:bg-red-500/10 hover:border-red-500/30 text-[var(--text-secondary)] hover:text-red-400 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onApproveRequest(req.id)}
                        className="px-4 py-1.5 bg-[var(--color-brand)] hover:opacity-90 text-white rounded text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve & Provision Access</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: ROLE PERMISSIONS MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border-card)] bg-[var(--surface-subtle)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">
              Interactive Access Control Matrix
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-['Geist',sans-serif]">
              Configure which capabilities are enabled for each enterprise user tier. Click any checkbox to update runtime security policies.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-card)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-3 text-center">Upload Assets</th>
                  <th className="py-3 px-3 text-center">Delete Assets</th>
                  <th className="py-3 px-3 text-center">Download RAW (.AI/.PSD)</th>
                  <th className="py-3 px-3 text-center">Create Expiring Links</th>
                  <th className="py-3 px-3 text-center">Dark Market Files</th>
                  <th className="py-3 px-3 text-center">User Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)]">
                {(Object.keys(rolePermissions) as UserRole[]).map((roleName) => {
                  const perm = rolePermissions[roleName];
                  const isCurrent = currentUser.role === roleName;
                  return (
                    <tr
                      key={roleName}
                      className={`hover:bg-[var(--surface-hover)] transition-colors ${
                        isCurrent ? 'bg-[var(--color-brand)]/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <span>{roleName}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#F5B800] text-neutral-950 font-bold px-1.5 py-0.5 rounded">
                              CURRENT SESSION
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canUpload}
                          onChange={() => handleTogglePermission(roleName, 'canUpload')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-[var(--color-brand)]"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canDelete}
                          onChange={() => handleTogglePermission(roleName, 'canDelete')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-[var(--color-brand)]"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canDownloadMasterRaw}
                          onChange={() => handleTogglePermission(roleName, 'canDownloadMasterRaw')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-[var(--color-brand)]"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canCreateShareLinks}
                          onChange={() => handleTogglePermission(roleName, 'canCreateShareLinks')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-[var(--color-brand)]"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canAccessDarkMarketRestricted}
                          onChange={() => handleTogglePermission(roleName, 'canAccessDarkMarketRestricted')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-[var(--color-brand)]"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canManageUsers}
                          onChange={() => handleTogglePermission(roleName, 'canManageUsers')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-[var(--color-brand)]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: GLOBAL REGIONAL HUBS & DARK MARKETS */}
      {activeSubTab === 'regions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">Asia-Pacific (APAC)</h3>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                Global HQ
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-['Geist',sans-serif]">
              Primary hub centered in Bangkok, Thailand. Covers Singapore, Japan, Australia, and Vietnam.
            </p>
            <div className="text-xs space-y-1.5 pt-2 border-t border-[var(--border-card)] text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Active Brands:</span>
                <strong className="text-[var(--text-primary)]">SINGHA, LEO, U BEER</strong>
              </div>
              <div className="flex justify-between">
                <span>Dark Market Status:</span>
                <strong className="text-amber-400">Strict Enforcement (SG, MY)</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Director:</span>
                <span className="text-[var(--text-primary)]">Korn Boonrawd</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">Europe & UK (EMEA)</h3>
              <span className="text-[10px] font-mono bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-bold px-2 py-0.5 rounded border border-[var(--border-card)]">
                Regional Hub
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-['Geist',sans-serif]">
              Distribution centers in London and Frankfurt. Manages retail supermarkets and Thai restaurant partnerships.
            </p>
            <div className="text-xs space-y-1.5 pt-2 border-t border-[var(--border-card)] text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Active Brands:</span>
                <strong className="text-[var(--text-primary)]">SINGHA</strong>
              </div>
              <div className="flex justify-between">
                <span>Dark Market Status:</span>
                <strong className="text-emerald-400">Standard Commercial</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Director:</span>
                <span className="text-[var(--text-primary)]">James Harrington</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">North America (AMER)</h3>
              <span className="text-[10px] font-mono bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-bold px-2 py-0.5 rounded border border-[var(--border-card)]">
                Regional Hub
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-['Geist',sans-serif]">
              Covers United States and Canada with primary warehouses in Los Angeles and New York.
            </p>
            <div className="text-xs space-y-1.5 pt-2 border-t border-[var(--border-card)] text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Active Brands:</span>
                <strong className="text-[var(--text-primary)]">SINGHA, LEO</strong>
              </div>
              <div className="flex justify-between">
                <span>Dark Market Status:</span>
                <strong className="text-emerald-400">Standard Commercial</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Director:</span>
                <span className="text-[var(--text-primary)]">Elena Cruz</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SECURITY & AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[var(--border-card)] bg-[var(--surface-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-['Bricolage_Grotesque',sans-serif]">
                Enterprise Security & Activity Audit Log
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-['Geist',sans-serif]">
                Immutable event stream for compliance auditing, unauthorized attempt tracking, and link expirations.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-2.5 py-1 bg-[var(--surface-card)] border border-[var(--border-card)] rounded text-[var(--text-primary)] outline-none text-xs"
              >
                <option value="ALL">All Actions</option>
                <option value="DOWNLOAD">Downloads</option>
                <option value="SHARE_CREATE">Share Link Created</option>
                <option value="REQUEST_APPROVED">Role Approvals</option>
                <option value="ROLE_CHANGE">Role Changes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-card)] text-[var(--text-secondary)] font-semibold">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">User & Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-4">Event Details</th>
                  <th className="py-2.5 px-3">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)] font-mono text-[11px]">
                {auditLogs
                  .filter((l) => logFilter === 'ALL' || l.action === logFilter)
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-2.5 px-4 text-[var(--text-secondary)] tabular-nums">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-[var(--text-primary)]">
                        {log.user} <span className="text-[var(--text-secondary)] font-normal">({log.role})</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.action === 'SHARE_CREATE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : log.action === 'DOWNLOAD'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : log.action === 'REQUEST_APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-card)]'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-[var(--text-primary)]">
                        {log.details}
                      </td>
                      <td className="py-2.5 px-3 text-[var(--text-secondary)] font-sans">
                        {log.region}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
