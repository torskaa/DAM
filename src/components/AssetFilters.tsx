import React from 'react';
import { FilterState, AssetCategory, FileFormat } from '../types/dam';
import { 
  Filter, 
  RotateCcw, 
  Users, 
  Box, 
  ShieldAlert, 
  Layers, 
  Palette
} from 'lucide-react';

interface AssetFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  categories: { name: AssetCategory; count: number }[];
  popularObjects: { label: string; count: number }[];
  totalCount: number;
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  popularObjects,
  totalCount,
}) => {
  const formats: FileFormat[] = ['AI', 'PSD', 'JPG', 'PNG', 'PDF'];
  const colors = [
    { name: 'Brand Purple', hex: '#5945F1' },
    { name: 'Volt Lime', hex: '#CAEB0E' },
    { name: 'Magenta Pink', hex: '#FD02B0' },
    { name: 'Singha Gold', hex: '#F5B800' },
    { name: 'Dark Slate', hex: '#171717' },
  ];

  return (
    <aside className="w-64 shrink-0 space-y-6 select-none bg-[var(--surface-card)] p-4 rounded-[12px] border border-[var(--border-card)] shadow-xs">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
          <Filter className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Studio Facets</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Section */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Category</label>
        <div className="space-y-0.5">
          <button
            onClick={() => onFilterChange({ ...filters, category: 'ALL' })}
            className={`w-full text-left px-2.5 py-1.5 rounded-[8px] text-xs flex items-center justify-between transition-colors cursor-pointer ${
              filters.category === 'ALL'
                ? 'bg-[var(--surface-subtle)] text-[var(--color-brand)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">{totalCount}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onFilterChange({ ...filters, category: cat.name })}
              className={`w-full text-left px-2.5 py-1.5 rounded-[8px] text-xs flex items-center justify-between transition-colors cursor-pointer ${
                filters.category === cat.name
                  ? 'bg-[var(--surface-subtle)] text-[var(--color-brand)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* People & Subject Filter */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>People & Subjects</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                hasPeople: filters.hasPeople === true ? null : true,
              })
            }
            className={`px-2 py-1.5 rounded-[8px] border text-center transition-colors cursor-pointer ${
              filters.hasPeople === true
                ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white font-medium shadow-xs'
                : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--color-brand)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            With People
          </button>
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                hasPeople: filters.hasPeople === false ? null : false,
              })
            }
            className={`px-2 py-1.5 rounded-[8px] border text-center transition-colors cursor-pointer ${
              filters.hasPeople === false
                ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white font-medium shadow-xs'
                : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--color-brand)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            Product Only
          </button>
        </div>
      </div>

      {/* Detected Elements */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          <Box className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Recognized Elements</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {popularObjects.map((obj) => {
            const isSelected = filters.objectFilter === obj.label;
            return (
              <button
                key={obj.label}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    objectFilter: isSelected ? null : obj.label,
                  })
                }
                className={`px-2 py-1 rounded-[8px] text-[11px] transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white font-medium shadow-xs'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-card)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]'
                }`}
              >
                {obj.label} <span className="text-[10px] opacity-70 font-mono tabular-nums">({obj.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File Format */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>File Format</span>
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          {formats.map((fmt) => {
            const isSelected = filters.fileFormat === fmt;
            return (
              <button
                key={fmt}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    fileFormat: isSelected ? 'ALL' : fmt,
                  })
                }
                className={`px-2.5 py-1 rounded-[8px] border text-xs font-mono font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-xs'
                    : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[var(--color-brand)] bg-[var(--surface-card)]'
                }`}
              >
                .{fmt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Market Legal Compliance */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Advertising Law</span>
        </div>
        <div className="space-y-1 text-xs">
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                marketSuitability:
                  filters.marketSuitability === 'Dark Market Compliant'
                    ? null
                    : 'Dark Market Compliant',
              })
            }
            className={`w-full text-left px-2.5 py-1.5 rounded-[8px] transition-colors flex items-center justify-between cursor-pointer border ${
              filters.marketSuitability === 'Dark Market Compliant'
                ? 'bg-[#CAEB0E]/20 border-[#CAEB0E] text-[var(--text-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <span>Dark Market (No Gold)</span>
            <span className="text-[10px] text-[var(--text-primary)] font-mono font-bold bg-[#CAEB0E]/30 px-1.5 py-0.2 rounded">P.13</span>
          </button>
        </div>
      </div>

      {/* Approval Status Lifecycle */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <span>Lifecycle Status</span>
          {filters.approvalStatus && filters.approvalStatus !== 'ALL' && (
            <button
              onClick={() => onFilterChange({ ...filters, approvalStatus: 'ALL' })}
              className="text-[10px] text-[var(--color-brand)] hover:underline cursor-pointer lowercase"
            >
              clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {(['Approved', 'In Review', 'Draft'] as const).map((st) => {
            const isSelected = filters.approvalStatus === st;
            return (
              <button
                key={st}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    approvalStatus: isSelected ? 'ALL' : st,
                  })
                }
                className={`py-1.5 px-1 rounded-[8px] border text-[11px] font-medium text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-xs font-semibold'
                    : 'border-[var(--border-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* DRM & Talent Rights */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <span>Talent Rights (DRM)</span>
          {filters.rightsStatus && filters.rightsStatus !== 'ALL' && (
            <button
              onClick={() => onFilterChange({ ...filters, rightsStatus: 'ALL' })}
              className="text-[10px] text-[var(--color-brand)] hover:underline cursor-pointer lowercase"
            >
              clear
            </button>
          )}
        </div>
        <div className="space-y-1 text-xs">
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                rightsStatus: filters.rightsStatus === 'Expiring Soon' ? 'ALL' : 'Expiring Soon',
              })
            }
            className={`w-full text-left px-2.5 py-1.5 rounded-[8px] transition-colors flex items-center justify-between cursor-pointer border ${
              filters.rightsStatus === 'Expiring Soon'
                ? 'bg-[#E03434]/15 border-[#E03434]/40 text-[#E03434] font-bold'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <span>Expiring Soon (&lt;30d)</span>
            <span className="w-2 h-2 rounded-full bg-[#E03434] animate-pulse" />
          </button>
          <button
            onClick={() =>
              onFilterChange({
                ...filters,
                rightsStatus: filters.rightsStatus === 'Active' ? 'ALL' : 'Active',
              })
            }
            className={`w-full text-left px-2.5 py-1.5 rounded-[8px] transition-colors flex items-center justify-between cursor-pointer border ${
              filters.rightsStatus === 'Active'
                ? 'bg-[var(--surface-subtle)] border-[var(--color-brand)]/40 text-[var(--color-brand)] font-bold'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <span>Active Talent Rights</span>
          </button>
        </div>
      </div>

      {/* Brand Color Swatches */}
      <div className="space-y-2 pt-3 border-t border-[var(--border-card)]">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span>Figma Palette Tokens</span>
        </div>
        <div className="flex items-center gap-2">
          {colors.map((c) => {
            const isSelected = filters.colorFilter === c.hex;
            return (
              <button
                key={c.hex}
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    colorFilter: isSelected ? null : c.hex,
                  })
                }
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full border border-black/10 transition-transform cursor-pointer ${
                  isSelected ? 'ring-2 ring-offset-2 ring-[var(--color-brand)] scale-110' : 'hover:scale-105'
                }`}
              />
            );
          })}
          {filters.colorFilter && (
            <button
              onClick={() => onFilterChange({ ...filters, colorFilter: null })}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
