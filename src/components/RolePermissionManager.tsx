import React, { useState } from 'react';
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
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'matrix' | 'regions' | 'audit'>('requests');
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

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
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="notion-pill bg-[#ffb110] text-black">
              Global Enterprise Governance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight mt-1.5">
            Role & Permission Management (RBAC)
          </h1>
          <p className="text-sm text-[#615d59] mt-1 max-w-2xl font-['Lyon_Text',Georgia,serif]">
            Simulate and enforce granular access control for Boon Rawd Brewery global employees, regional distributors, and external agency partners.
          </p>
        </div>

        {/* Instant Role Switcher Bar */}
        <div className="bg-[#f6f5f4] p-3 rounded-[8px] border border-[rgba(0,0,0,0.08)] flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold text-[#757575] uppercase tracking-wider">
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
                    ? 'bg-[#0075de] text-white shadow-xs'
                    : 'text-[#615d59] hover:text-black hover:bg-[rgba(0,0,0,0.06)]'
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

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white border border-[rgba(0,0,0,0.08)] rounded-[8px]">
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
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[8px] whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#e6f3fe] text-[#0075de] font-semibold'
                  : 'text-[#757575] hover:text-black hover:bg-[rgba(0,0,0,0.04)]'
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
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden">
          <div className="p-5 border-b border-[rgba(0,0,0,0.08)] bg-[#f6f5f4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-black">
                User Registration & Role Requests Queue
              </h2>
              <p className="text-xs text-[#615d59] mt-0.5 font-['Lyon_Text',Georgia,serif]">
                Submitted from the 4-step registration wizard (PDF Pages 3–8). Approved users gain instant credentialed access.
              </p>
            </div>
            <span className="notion-pill bg-[#ffb110] text-black">
              {pendingRequests.length} Awaiting Approval
            </span>
          </div>

          {accountRequests.length === 0 ? (
            <div className="py-12 text-center text-[#757575] text-xs">
              No pending account requests in the queue.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {accountRequests.map((req) => (
                <div key={req.id} className="p-5 hover:bg-neutral-50/70 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-sm">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">{req.name}</h4>
                        <p className="text-[11px] text-neutral-600 font-mono">
                          {req.email} · {req.companyName} ({req.jobTitle})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                        req.status === 'Pending'
                          ? 'bg-amber-100 text-amber-900'
                          : req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-100 text-red-900'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-mono">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Request Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                    <div>
                      <span className="text-neutral-600 text-[11px] block">Requested Role & Region:</span>
                      <strong className="text-neutral-900">{req.requestedRole}</strong> · {req.region} ({req.country})
                    </div>
                    <div>
                      <span className="text-neutral-600 text-[11px] block">Requested Brands:</span>
                      <strong className="text-neutral-900">{req.requestedBrands.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-600 text-[11px] block">Boonrawd Contact Person:</span>
                      <strong className="text-neutral-900">{req.boonrawdContact}</strong>
                    </div>
                  </div>

                  {req.requestMessage && (
                    <p className="text-xs text-neutral-700 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                      "{req.requestMessage}"
                    </p>
                  )}

                  {/* Approve / Reject Actions */}
                  {req.status === 'Pending' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => onRejectRequest(req.id)}
                        className="px-3 py-1.5 border border-neutral-300 hover:bg-red-50 hover:border-red-300 text-neutral-700 hover:text-red-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onApproveRequest(req.id)}
                        className="px-4 py-1.5 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 rounded text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
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
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-neutral-200 bg-neutral-50/50">
            <h2 className="text-sm font-bold text-neutral-900">
              Interactive Access Control Matrix
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Configure which capabilities are enabled for each enterprise user tier. Click any checkbox to update runtime security policies.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-3 text-center">Upload Assets</th>
                  <th className="py-3 px-3 text-center">Delete Assets</th>
                  <th className="py-3 px-3 text-center">Download RAW (.AI/.PSD)</th>
                  <th className="py-3 px-3 text-center">Create Expiring Links</th>
                  <th className="py-3 px-3 text-center">Dark Market Files</th>
                  <th className="py-3 px-3 text-center">User Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(Object.keys(rolePermissions) as UserRole[]).map((roleName) => {
                  const perm = rolePermissions[roleName];
                  const isCurrent = currentUser.role === roleName;
                  return (
                    <tr
                      key={roleName}
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isCurrent ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        <div className="flex items-center gap-2">
                          <span>{roleName}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#F5B800] text-neutral-950 font-bold px-1.5 py-0.2 rounded">
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
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canDelete}
                          onChange={() => handleTogglePermission(roleName, 'canDelete')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canDownloadMasterRaw}
                          onChange={() => handleTogglePermission(roleName, 'canDownloadMasterRaw')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canCreateShareLinks}
                          onChange={() => handleTogglePermission(roleName, 'canCreateShareLinks')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canAccessDarkMarketRestricted}
                          onChange={() => handleTogglePermission(roleName, 'canAccessDarkMarketRestricted')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm.canManageUsers}
                          onChange={() => handleTogglePermission(roleName, 'canManageUsers')}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
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
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Asia-Pacific (APAC)</h3>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Global HQ
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              Primary hub centered in Bangkok, Thailand. Covers Singapore, Japan, Australia, and Vietnam.
            </p>
            <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-100 text-neutral-700">
              <div className="flex justify-between">
                <span>Active Brands:</span>
                <strong className="text-neutral-900">SINGHA, LEO, U BEER</strong>
              </div>
              <div className="flex justify-between">
                <span>Dark Market Status:</span>
                <strong className="text-amber-800">Strict Enforcement (SG, MY)</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Director:</span>
                <span>Korn Boonrawd</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">Europe & UK (EMEA)</h3>
              <span className="text-[10px] font-mono bg-neutral-100 text-neutral-800 font-bold px-2 py-0.5 rounded">
                Regional Hub
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              Distribution centers in London and Frankfurt. Manages retail supermarkets and Thai restaurant partnerships.
            </p>
            <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-100 text-neutral-700">
              <div className="flex justify-between">
                <span>Active Brands:</span>
                <strong className="text-neutral-900">SINGHA</strong>
              </div>
              <div className="flex justify-between">
                <span>Dark Market Status:</span>
                <strong className="text-emerald-800">Standard Commercial</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Director:</span>
                <span>James Harrington</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">North America (AMER)</h3>
              <span className="text-[10px] font-mono bg-neutral-100 text-neutral-800 font-bold px-2 py-0.5 rounded">
                Regional Hub
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              Covers United States and Canada with primary warehouses in Los Angeles and New York.
            </p>
            <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-100 text-neutral-700">
              <div className="flex justify-between">
                <span>Active Brands:</span>
                <strong className="text-neutral-900">SINGHA, LEO</strong>
              </div>
              <div className="flex justify-between">
                <span>Dark Market Status:</span>
                <strong className="text-emerald-800">Standard Commercial</strong>
              </div>
              <div className="flex justify-between">
                <span>Regional Director:</span>
                <span>Elena Cruz</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SECURITY & AUDIT LOG */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Enterprise Security & Activity Audit Log
              </h2>
              <p className="text-xs text-neutral-600">
                Immutable event stream for compliance auditing, unauthorized attempt tracking, and link expirations.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-neutral-600" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-neutral-300 rounded text-neutral-800 outline-none text-xs"
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
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">User & Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-4">Event Details</th>
                  <th className="py-2.5 px-3">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                {auditLogs
                  .filter((l) => logFilter === 'ALL' || l.action === logFilter)
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 text-neutral-600 tabular-nums">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-neutral-900">
                        {log.user} <span className="text-neutral-600 font-normal">({log.role})</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          log.action === 'SHARE_CREATE'
                            ? 'bg-amber-100 text-amber-900'
                            : log.action === 'DOWNLOAD'
                            ? 'bg-blue-100 text-blue-900'
                            : log.action === 'REQUEST_APPROVED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-neutral-800">
                        {log.details}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 font-sans">
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
