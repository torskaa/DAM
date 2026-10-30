import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Command, 
  X, 
  LayoutDashboard, 
  FolderKanban, 
  BookOpen, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Upload, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { DAMAsset } from '../types/dam';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: DAMAsset[];
  onOpenUpload: () => void;
  onSelectAsset: (asset: DAMAsset) => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  assets,
  onOpenUpload,
  onSelectAsset,
}: CommandPaletteModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Handle global keydown ESC and Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { title: 'Assets Library', path: '/assets', icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Collections & Campaign Kits', path: '/collections', icon: FolderKanban, category: 'Navigation' },
    { title: 'Brand Guidelines: Master Logo', path: '/guidelines/master', icon: BookOpen, category: 'Guidelines' },
    { title: 'Brand Guidelines: Dark Market', path: '/guidelines/dark', icon: BookOpen, category: 'Guidelines' },
    { title: 'Expiring Share Vault', path: '/shares', icon: Share2, category: 'Security' },
    { title: 'Global RBAC & Governance', path: '/roles', icon: ShieldCheck, category: 'Admin' },
    { title: 'AI Recognition & Search Lab', path: '/ai-lab', icon: Sparkles, category: 'AI Tools' },
    { title: 'Official Handbook (PDF)', path: '/handbook', icon: FileText, category: 'Documentation' },
  ];

  const filteredNav = quickNav.filter((n) => 
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  const matchedAssets = query.trim()
    ? assets.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          a.brand.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-xs px-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-xl bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] shadow-2xl overflow-hidden flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[var(--border-card)] bg-[var(--surface-card)]">
          <Search className="w-[18px] h-[18px] text-[var(--text-secondary)] mr-3 shrink-0" strokeWidth={1.5} />
          <input 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent py-4 outline-none text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-['Geist',sans-serif]"
            placeholder="Search assets, guidelines, or type a command..."
          />
          <kbd 
            onClick={onClose}
            className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 ml-2 text-[10px] font-medium font-mono text-[var(--text-secondary)] bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[4px] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
          >
            ESC
          </kbd>
          <button 
            onClick={onClose}
            className="ml-3 p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[var(--border-card)] text-xs">
          {/* Quick Actions */}
          <div className="py-1">
            <span className="px-3 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Quick Actions
            </span>
            <div
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] hover:text-[var(--color-brand)] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-4 h-4 text-[var(--color-brand)]" />
                <span className="font-medium text-[13px]">Upload New Media Asset with AI</span>
              </div>
              <span className="notion-pill bg-[var(--color-brand)] text-white text-[10px]">Action</span>
            </div>
          </div>

          {/* Matched Assets if searching */}
          {matchedAssets.length > 0 && (
            <div className="py-1">
              <span className="px-3 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Matching Assets ({matchedAssets.length})
              </span>
              {matchedAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    onClose();
                    onSelectAsset(asset);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={asset.previewUrl}
                      alt={asset.title}
                      className="w-7 h-7 rounded-[4px] object-cover shrink-0 border border-[var(--border-card)]"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[340px]">
                        {asset.title}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {asset.brand} · .{asset.fileFormat} · {asset.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                </div>
              ))}
            </div>
          )}

          {/* Navigation Items */}
          <div className="py-1">
            <span className="px-3 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Pages & Guidelines
            </span>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  onClick={() => {
                    onClose();
                    navigate(item.path);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-[13px]">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">{item.category}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[var(--surface-subtle)] border-t border-[var(--border-card)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <span>Navigation & System Commands</span>
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[var(--surface-card)] border border-[var(--border-card)] rounded text-[10px] text-[var(--text-primary)]">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 bg-[var(--surface-card)] border border-[var(--border-card)] rounded text-[10px] text-[var(--text-primary)]">esc</kbd> to dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
