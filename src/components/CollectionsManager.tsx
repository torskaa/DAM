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
  ExternalLink,
  Check
} from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="notion-pill bg-[#ffb110] text-black">
              Media Organization
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight mt-1.5">
            Collections & Campaign Kits
          </h1>
          <p className="text-sm text-[#615d59] mt-1 max-w-2xl font-['Lyon_Text',Georgia,serif]">
            Curate, bundle, and distribute tailored asset collections for marketing agencies, trade partners, and seasonal festivals.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="notion-btn-primary flex items-center gap-2 shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-[#e6f3fe] text-[#0075de] border border-[#0075de]/30 rounded-[8px] text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#0075de] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const colAssets = assets.filter((a) => col.assetIds.includes(a.id));
          return (
            <div
              key={col.id}
              className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] overflow-hidden hover:border-[rgba(0,0,0,0.18)] transition-all flex flex-col group"
            >
              {/* Cover Mosaic of assets inside */}
              <div 
                onClick={() => onOpenCollectionInLibrary(col.id)}
                className="relative h-44 bg-[#f6f5f4] overflow-hidden cursor-pointer"
              >
                {colAssets.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-[#757575] text-xs font-mono">
                    Empty Collection
                  </div>
                ) : colAssets.length === 1 ? (
                  <img
                    src={colAssets[0].previewUrl}
                    alt={col.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                  />
                ) : (
                  <div className="grid grid-cols-2 h-full gap-0.5">
                    {colAssets.slice(0, 4).map((a, idx) => (
                      <div key={idx} className="relative h-full overflow-hidden">
                        <img
                          src={a.previewUrl}
                          alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px]">
                  {col.assetIds.length} Assets
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 
                    onClick={() => onOpenCollectionInLibrary(col.id)}
                    className="text-base font-bold text-black group-hover:text-[#0075de] transition-colors cursor-pointer"
                  >
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#615d59] mt-1 line-clamp-2 font-['Lyon_Text',Georgia,serif]">
                    {col.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenCollectionInLibrary(col.id)}
                    className="notion-btn-ghost flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span>View Assets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onShareCollection(col)}
                      className="p-1.5 hover:bg-[#e6f3fe] rounded-[8px] text-[#757575] hover:text-[#0075de] transition-colors cursor-pointer"
                      title="Create Expiring Link for Collection"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCollection(col.id)}
                      className="p-1.5 hover:bg-[#f64932]/10 rounded-[8px] text-[#757575] hover:text-[#f64932] transition-colors cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Collection Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="bg-white w-full max-w-xl rounded-[12px] p-6 border border-[rgba(0,0,0,0.08)] shadow-lg text-xs space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.08)]">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#0075de]" />
                <span>Create New Collection</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[#757575] hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-black block mb-1">Collection Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Songkran Festival Visual Kit"
                  className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-[8px] focus:border-[#0075de] outline-none text-black text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-black block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the purpose of this asset pack..."
                  className="w-full px-3 py-2 border border-[rgba(0,0,0,0.12)] rounded-[8px] focus:border-[#0075de] outline-none text-black text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-black block mb-1">
                  Select Initial Assets ({selectedAssetIds.length} selected)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1.5 border border-[rgba(0,0,0,0.08)] rounded-[8px] bg-[#f6f5f4]">
                  {assets.map((asset) => {
                    const isSelected = selectedAssetIds.includes(asset.id);
                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetSelect(asset.id)}
                        className={`relative aspect-square rounded-[6px] overflow-hidden border cursor-pointer ${
                          isSelected ? 'border-[#0075de] ring-2 ring-[#0075de]/30' : 'border-[rgba(0,0,0,0.08)] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={asset.previewUrl}
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-[#0075de] text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[9px]">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(0,0,0,0.08)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-1.5 border border-[rgba(0,0,0,0.15)] text-black hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] font-medium transition-colors cursor-pointer"
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
