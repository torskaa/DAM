import React, { useState } from 'react';
import { Collection, DAMAsset } from '../types/dam';
import { 
  FolderPlus, 
  Folder, 
  Share2, 
  Download, 
  Layers, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Check,
  FolderKanban,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BentoGrid, BentoCard } from './ui/bento-grid';

interface CollectionsManagerProps {
  collections: Collection[];
  assets: DAMAsset[];
  onCreateCollection: (newCol: Collection) => void;
  onOpenCollectionInLibrary: (collectionId: string) => void;
  onShareCollection: (collection: Collection) => void;
  onDeleteCollection: (collectionId: string) => void;
}

export const CollectionsManager: React.FC<CollectionsManagerProps> = ({
  collections,
  assets,
  onCreateCollection,
  onOpenCollectionInLibrary,
  onShareCollection,
  onDeleteCollection,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCol: Collection = {
      id: `col-${Date.now().toString(36)}`,
      title: title.trim(),
      description: description.trim() || 'Curated brand asset collection',
      assetIds: selectedAssetIds.length > 0 ? selectedAssetIds : [assets[0]?.id, assets[1]?.id].filter(Boolean),
      createdAt: new Date().toISOString(),
      createdBy: 'Boon Rawd Regional Admin',
    };

    onCreateCollection(newCol);
    setIsCreateOpen(false);
    setTitle('');
    setDescription('');
    setSelectedAssetIds([]);
    setNotification(`Collection "${newCol.title}" created successfully!`);
    setTimeout(() => setNotification(null), 2500);
  };

  const toggleAssetSelect = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[var(--surface-subtle)] text-[var(--color-brand)]">
              Media Organization
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">Bento Campaign Vault</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-heading">
            Collections & Campaign Kits
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
            Curate, bundle, and distribute tailored asset collections for marketing agencies, trade distributors, and seasonal festival activations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="notion-btn-primary flex items-center gap-2 shrink-0 shadow-xs"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-[var(--surface-subtle)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 rounded-[8px] text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[var(--color-brand)] shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* BENTO GRID OF COLLECTIONS */}
      <BentoGrid className="lg:grid-cols-3">
        {collections.map((col, idx) => {
          const colAssets = assets.filter((a) => col.assetIds.includes(a.id));
          const isFeatured = idx === 0;

          const background = (
            <div className="w-full h-full relative overflow-hidden bg-[var(--surface-subtle)]">
              {colAssets.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]/50 text-xs font-mono">
                  Empty Collection
                </div>
              ) : colAssets.length === 1 ? (
                <img
                  src={colAssets[0].previewUrl}
                  alt={col.title}
                  className="w-full h-full object-cover opacity-25 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500"
                />
              ) : (
                <div className="grid grid-cols-2 h-full gap-1 opacity-25 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500">
                  {colAssets.slice(0, 4).map((a, i) => (
                    <div key={i} className="relative h-full overflow-hidden">
                      <img
                        src={a.previewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* Gradient Scrim matching theme surface */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-card)] via-[var(--surface-card)]/80 to-transparent" />

              {/* Top Quick Actions Floating */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareCollection(col);
                  }}
                  className="p-1.5 bg-[var(--surface-card)]/90 backdrop-blur-xs hover:bg-[var(--surface-hover)] hover:text-[var(--color-brand)] text-[var(--text-secondary)] rounded-[6px] border border-[var(--border-card)] shadow-xs cursor-pointer transition-colors"
                  title="Create Share Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete collection "${col.title}"?`)) {
                      onDeleteCollection(col.id);
                    }
                  }}
                  className="p-1.5 bg-[var(--surface-card)]/90 backdrop-blur-xs hover:bg-[#E53535]/15 hover:text-[#E53535] text-[var(--text-secondary)] rounded-[6px] border border-[var(--border-card)] shadow-xs cursor-pointer transition-colors"
                  title="Delete Collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );

          return (
            <BentoCard
              key={col.id}
              name={col.title}
              description={col.description}
              badge={`${col.assetIds.length} Assets`}
              Icon={isFeatured ? Sparkles : FolderKanban}
              className={isFeatured ? "lg:col-span-2" : "lg:col-span-1"}
              background={background}
              cta="Open Collection in Library"
              onClick={() => onOpenCollectionInLibrary(col.id)}
            />
          );
        })}

        {/* Plus Card to Create New Kit */}
        <div
          onClick={() => setIsCreateOpen(true)}
          className="group relative col-span-3 lg:col-span-1 flex flex-col items-center justify-center p-8 rounded-[14px] border-2 border-dashed border-[var(--border-card)] hover:border-[var(--color-brand)]/50 bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] transition-all duration-300 cursor-pointer min-h-[22rem] text-center"
        >
          <div className="w-14 h-14 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-card)] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[var(--color-brand)]/40 shadow-xs transition-all">
            <Plus className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] transition-colors" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)] font-heading group-hover:text-[var(--color-brand)] transition-colors">
            Create Campaign Collection
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
            Bundle vectors, dielines, and photo assets into a reusable distribution kit.
          </p>
          <span className="mt-4 px-3 py-1.5 rounded-[8px] bg-[var(--surface-subtle)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-primary)] shadow-xs group-hover:bg-[var(--color-brand)] group-hover:text-white group-hover:border-[var(--color-brand)] transition-all">
            + New Kit
          </span>
        </div>
      </BentoGrid>

      {/* Create Collection Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div 
            className="bg-[var(--surface-card)] text-[var(--text-primary)] w-full max-w-xl rounded-[12px] p-6 border border-[var(--border-card)] shadow-2xl text-xs space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 font-heading">
                <FolderPlus className="w-4 h-4 text-[var(--color-brand)]" />
                <span>Create New Collection</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">Collection Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Songkran Festival Visual Kit"
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] focus:border-[var(--color-brand)] outline-none text-[var(--text-primary)] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the purpose of this asset pack..."
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-card)] rounded-[8px] focus:border-[var(--color-brand)] outline-none text-[var(--text-primary)] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--text-primary)] block mb-1">
                  Select Initial Assets ({selectedAssetIds.length} selected)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-[var(--border-card)] rounded-[8px] bg-[var(--surface-subtle)]">
                  {assets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetSelect(asset.id)}
                        className={`relative aspect-square rounded-[6px] overflow-hidden border cursor-pointer ${
                          isSelected ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/30' : 'border-[var(--border-card)] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={asset.previewUrl}
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-[var(--color-brand)] text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-card)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 border border-[var(--border-card)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-[8px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="notion-btn-primary"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
