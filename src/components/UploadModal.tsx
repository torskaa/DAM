import React, { useState } from 'react';
import { DAMAsset, BrandName, AssetCategory, FileFormat } from '../types/dam';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  Loader2, 
  FileCode, 
  Box, 
  Users, 
  Palette, 
  Layers, 
  Tag
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetUploaded: (newAsset: DAMAsset) => void;
  defaultBrand: BrandName | 'ALL';
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onAssetUploaded,
  defaultBrand,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState<BrandName>(defaultBrand === 'ALL' ? 'SINGHA' : defaultBrand);
  const [category, setCategory] = useState<AssetCategory>('Campaign Imagery');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Sample templates to quickly demo AI Auto-Tagging
  const handleUseSample = (type: 'lifestyle' | 'can' | 'bottle' | 'darkmarket') => {
    let sampleTitle = '';
    let sampleUrl = '';
    let sampleCat: AssetCategory = 'Campaign Imagery';

    if (type === 'lifestyle') {
      sampleTitle = 'Singha Nightlife Rooftop Party with Friends';
      sampleUrl = '/src/assets/images/singha_beer_lifestyle_toast_1793083582441.jpg';
      sampleCat = 'Campaign Imagery';
    } else if (type === 'can') {
      sampleTitle = 'Singha Gold Canned Brew on Crushed Ice';
      sampleUrl = '/src/assets/images/singha_packaging_can_ice_1793083582580.jpg';
      sampleCat = 'Packaging';
    } else if (type === 'bottle') {
      sampleTitle = 'Singha Heritage Amber Bottle on Wood Counter';
      sampleUrl = '/src/assets/images/singha_craft_bottle_bar_1793083583140.jpg';
      sampleCat = 'Campaign Imagery';
    } else {
      sampleTitle = 'Singha Dark Market Alcohol Restricted Logo';
      sampleUrl = '/src/assets/images/singha_posm_coaster_sign_1793083583266.jpg';
      sampleCat = 'Logos & Identity';
    }

    setTitle(sampleTitle);
    setCategory(sampleCat);
    setPreviewImage(sampleUrl);
    runAiAnalysis(sampleTitle, sampleCat, brand, sampleUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        runAiAnalysis(file.name, category, brand, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiAnalysis = async (assetTitle: string, assetCat: string, assetBrand: string, imageSrc?: string) => {
    setIsAnalyzing(true);
    setAnalysisStep('1/4 Analyzing visual entities & beverage objects...');

    setTimeout(() => {
      setAnalysisStep('2/4 Scanning faces, human gestures & party atmosphere...');
    }, 600);

    setTimeout(() => {
      setAnalysisStep('3/4 Generating multilingual DAM tags in Thai & English...');
    }, 1200);

    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (imageSrc && imageSrc.startsWith('data:')) {
        const parts = imageSrc.split(',');
        mimeType = parts[0].match(/:(.*?);/)?.[1];
        imageBase64 = parts[1];
      }

      const res = await fetch('/api/ai/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assetTitle,
          category: assetCat,
          brand: assetBrand,
          imageBase64,
          mimeType,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        setEditableTags(data.analysis.autoTags || []);
        if (data.analysis.suggestedCategory) {
          setCategory(data.analysis.suggestedCategory);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !editableTags.includes(newTagInput.trim())) {
      setEditableTags([...editableTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter((t) => t !== tagToRemove));
  };

  const handleCommitAsset = () => {
    const ext = selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() || 'JPG' : 'JPG';
    const newAsset: DAMAsset = {
      id: `asset-${Date.now().toString(36)}`,
      title: title || 'New Brand Asset',
      filename: selectedFile ? selectedFile.name : `${title.replace(/\s+/g, '_')}.${ext.toLowerCase()}`,
      brand,
      category,
      fileFormat: (ext === 'AI' || ext === 'PSD' || ext === 'PDF' || ext === 'PNG' ? ext : 'JPG') as FileFormat,
      fileSize: selectedFile ? `${(selectedFile.size / 1048576).toFixed(1)} MB` : '28.5 MB',
      fileSizeBytes: selectedFile ? selectedFile.size : 29884416,
      dimensions: { width: 4000, height: 3000 },
      resolutionDpi: 300,
      colorSpace: 'sRGB / FOGRA39 CMYK',
      previewUrl: previewImage || '/src/assets/images/singha_beer_lifestyle_toast_1793083582441.jpg',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Boon Rawd Regional Admin',
      version: '1.0',
      versions: [
        {
          version: '1.0',
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Regional Admin',
          notes: 'Initial upload via AI auto-tagger',
          fileSize: '28.5 MB',
        },
      ],
      marketSuitability: analysisResult?.marketSuitability || 'Standard Commercial',
      tags: editableTags.length > 0 ? editableTags : ['Singha', 'Beverage', 'Brand Asset'],
      detectedObjects: analysisResult?.detectedObjects || [
        { label: 'Singha Product', confidence: 0.95, category: 'Product' },
      ],
      detectedFaces: analysisResult?.detectedFaces || { count: 0, hasPeople: false },
      dominantColors: analysisResult?.dominantColors?.map((c: string) => ({ hex: c, name: 'Brand Color' })) || [
        { hex: '#F5B800', name: 'Singha Gold' },
      ],
      descriptionEn: analysisResult?.contentSummaryEn || `Brand asset for ${brand}`,
      descriptionTh: analysisResult?.contentSummaryTh || `ไฟล์สินทรัพย์ดิจิทัลแบรนด์ ${brand}`,
      downloadsCount: 0,
      viewsCount: 1,
    };

    onAssetUploaded(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#F5B800] text-neutral-950 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 leading-tight">
                Upload & AI Auto-Tag Assets
              </h2>
              <p className="text-[11px] text-neutral-600">
                Gemini Vision analyzes objects, faces, colors, and generates bilingual metadata
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* Quick Demo Pre-load Bar */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-950">Test Instant AI Vision Auto-Tagging</p>
                <p className="text-[11px] text-amber-800">
                  Select a test image to see real-time object & face classification:
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleUseSample('lifestyle')}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold rounded text-[11px] transition-colors cursor-pointer"
              >
                🍻 People Toasting
              </button>
              <button
                type="button"
                onClick={() => handleUseSample('can')}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold rounded text-[11px] transition-colors cursor-pointer"
              >
                🧊 Cold Can on Ice
              </button>
              <button
                type="button"
                onClick={() => handleUseSample('bottle')}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold rounded text-[11px] transition-colors cursor-pointer"
              >
                🪵 Amber Bottle
              </button>
              <button
                type="button"
                onClick={() => handleUseSample('darkmarket')}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold rounded text-[11px] transition-colors cursor-pointer"
              >
                🛡️ Dark Market Logo
              </button>
            </div>
          </div>

          {/* File Dropzone or Preview */}
          <div className="border-2 border-dashed border-neutral-300 hover:border-amber-400 rounded-xl p-6 text-center transition-colors relative bg-neutral-50/40">
            {previewImage ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-28 h-28 object-cover rounded-lg border border-neutral-200 shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 text-sm truncate">{title || 'Selected Asset'}</p>
                  <p className="text-[11px] text-neutral-600 font-mono mt-0.5">
                    {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1048576).toFixed(1)} MB)` : 'High-Res Studio Asset'}
                  </p>
                  <label className="mt-2 inline-block text-[11px] text-amber-600 hover:text-amber-800 font-semibold underline cursor-pointer">
                    Change file
                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.ai,.psd,.pdf" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="font-semibold text-neutral-800">
                  Drag and drop files here, or <span className="text-amber-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Supports High-Res JPG, PNG, Illustrator (.AI), Photoshop (.PSD), and Brand PDF guidelines
                </p>
                <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.ai,.psd,.pdf" />
              </label>
            )}
          </div>

          {/* AI Analyzing Progress State */}
          {isAnalyzing && (
            <div className="p-4 bg-neutral-900 text-white rounded-lg flex items-center gap-3 animate-in fade-in">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div>
                <p className="font-bold text-xs text-amber-400">Gemini 3.8 AI Vision Analyzing Asset...</p>
                <p className="text-[11px] text-neutral-300 font-mono">{analysisStep}</p>
              </div>
            </div>
          )}

          {/* Asset Metadata Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">Asset Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Singha 330ml Can on Crushed Ice"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">Brand World</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as any)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900 text-xs bg-white"
              >
                <option value="SINGHA">SINGHA</option>
                <option value="LEO">LEO</option>
                <option value="U BEER">U BEER</option>
                <option value="BOON RAWD">BOON RAWD BREWERY</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900 text-xs bg-white"
              >
                <option value="Logos & Identity">Logos & Identity</option>
                <option value="Packaging">Packaging</option>
                <option value="Campaign Imagery">Campaign Imagery</option>
                <option value="POSM & Retail">POSM & Retail</option>
                <option value="Guidelines & Print">Guidelines & Print</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">Market Suitability</label>
              <select
                value={analysisResult?.marketSuitability || 'Standard Commercial'}
                onChange={() => {}}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900 text-xs bg-white"
              >
                <option value="Standard Commercial">Standard Commercial</option>
                <option value="Dark Market Compliant">Dark Market Compliant (PDF P.13)</option>
                <option value="Internal B2B">Internal B2B</option>
              </select>
            </div>
          </div>

          {/* AI Extraction Preview (Objects, Faces, Tags) */}
          {analysisResult && (
            <div className="space-y-4 pt-3 border-t border-neutral-200">
              
              {/* Detected Objects */}
              <div>
                <span className="font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
                  <Box className="w-3.5 h-3.5 text-neutral-600" />
                  <span>AI Detected Objects & Entities</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.detectedObjects?.map((obj: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-neutral-800 font-medium text-[11px] flex items-center gap-1"
                    >
                      <span>{obj.label}</span>
                      <span className="text-[10px] text-amber-700 font-mono">
                        ({Math.round(obj.confidence * 100)}%)
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Faces */}
              {analysisResult.detectedFaces?.hasPeople && (
                <div className="p-3 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-600" />
                    <div>
                      <p className="font-bold text-neutral-900">
                        {analysisResult.detectedFaces.count} People / Faces Detected
                      </p>
                      <p className="text-[11px] text-neutral-600">
                        Expression: {analysisResult.detectedFaces.expression || 'Cheerful celebration'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Face Tagged
                  </span>
                </div>
              )}

              {/* Editable Search Tags */}
              <div>
                <span className="font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Auto-Generated Search Tags (Bilingual Thai & English)</span>
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editableTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs flex items-center gap-1"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-amber-700 hover:text-amber-950 ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add custom tag..."
                    className="px-2.5 py-1.5 border border-neutral-300 rounded text-xs focus:border-amber-400 outline-none w-48"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-semibold text-xs cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-md font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCommitAsset}
              disabled={!previewImage}
              className="px-5 py-2 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Commit to Brand Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
