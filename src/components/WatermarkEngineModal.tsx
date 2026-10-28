import React, { useState, useEffect, useRef } from 'react';
import { DAMAsset, UserSession } from '../types/dam';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Sliders, 
  Eye, 
  RotateCw,
  Copy,
  Lock
} from 'lucide-react';

interface WatermarkEngineModalProps {
  asset: DAMAsset | null;
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  isMandatoryForRole?: boolean;
}

export const WatermarkEngineModal: React.FC<WatermarkEngineModalProps> = ({
  asset,
  isOpen,
  onClose,
  userSession,
  isMandatoryForRole = false,
}) => {
  if (!isOpen || !asset) return null;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [watermarkText, setWatermarkText] = useState(
    `CONFIDENTIAL · BOON RAWD BREWERY · ${userSession.name.toUpperCase()} · ${new Date().toISOString().split('T')[0]}`
  );
  const [styleMode, setStyleMode] = useState<'diagonal-matrix' | 'center-seal' | 'bottom-bar'>('diagonal-matrix');
  const [opacity, setOpacity] = useState<number>(0.35);
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(24);
  const [watermarkColor, setWatermarkColor] = useState<'white' | 'gold' | 'charcoal'>('white');
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Render canvas with image + protective dynamic watermark
  useEffect(() => {
    if (!asset || !canvasRef.current) return;
    setIsRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset.previewUrl;

    img.onload = () => {
      // Set canvas dimension matching asset or max 1600px preview width for performance
      const maxW = 1600;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw original image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Setup watermark style
      ctx.save();
      ctx.globalAlpha = opacity;

      let fillHex = '#FFFFFF';
      let strokeHex = 'rgba(0, 0, 0, 0.4)';
      if (watermarkColor === 'gold') {
        fillHex = '#FFB110';
        strokeHex = 'rgba(17, 17, 17, 0.6)';
      } else if (watermarkColor === 'charcoal') {
        fillHex = '#111111';
        strokeHex = 'rgba(255, 255, 255, 0.3)';
      }

      ctx.fillStyle = fillHex;
      ctx.strokeStyle = strokeHex;
      ctx.lineWidth = 1.5;

      const baseFontSize = (canvas.width / 1000) * fontSizeRatio;
      ctx.font = `600 ${Math.max(14, baseFontSize)}px Inter, system-ui, -apple-system, sans-serif`;

      if (styleMode === 'diagonal-matrix') {
        // Repeated diagonal tiled watermark across canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-28 * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        const stepX = Math.max(280, canvas.width / 3.2);
        const stepY = Math.max(120, canvas.height / 5);

        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
            ctx.strokeText(watermarkText, x, y);
            ctx.fillText(watermarkText, x, y);
          }
        }
      } else if (styleMode === 'center-seal') {
        // Center security badge & stamp
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const sealSize = Math.min(canvas.width, canvas.height) * 0.38;

        ctx.beginPath();
        ctx.arc(cx, cy, sealSize, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${baseFontSize * 1.3}px Inter, sans-serif`;
        ctx.strokeText('BOON RAWD INTERNAL USE', cx, cy - sealSize * 0.25);
        ctx.fillText('BOON RAWD INTERNAL USE', cx, cy - sealSize * 0.25);

        ctx.font = `500 ${baseFontSize * 0.85}px Inter, sans-serif`;
        ctx.strokeText(userSession.name, cx, cy);
        ctx.fillText(userSession.name, cx, cy);

        ctx.font = `400 ${baseFontSize * 0.7}px monospace`;
        ctx.strokeText(`AGENCY ACCESS · ${new Date().toLocaleDateString()}`, cx, cy + sealSize * 0.25);
        ctx.fillText(`AGENCY ACCESS · ${new Date().toLocaleDateString()}`, cx, cy + sealSize * 0.25);
      } else if (styleMode === 'bottom-bar') {
        // High visibility bottom security bar
        const barHeight = Math.max(48, canvas.height * 0.08);
        ctx.globalAlpha = Math.min(0.85, opacity * 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#FFB110';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${Math.max(12, baseFontSize * 0.75)}px Inter, sans-serif`;
        ctx.fillText(
          `PROTECTED ASSET: ${asset.title.toUpperCase()} · LICENSED TO: ${userSession.name.toUpperCase()} (${userSession.role})`,
          24,
          canvas.height - barHeight / 2
        );
      }

      ctx.restore();
      setIsRendering(false);
    };
  }, [asset, watermarkText, styleMode, opacity, fontSizeRatio, watermarkColor, userSession]);

  const handleDownloadWatermarked = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${asset.title.replace(/\s+/g, '_')}_WATERMARKED.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-[12px] shadow-2xl flex flex-col overflow-hidden border border-black/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08] bg-paper-warmth">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-sky-tint text-notion-blue flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-notion-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-charcoal">
                  Dynamic Watermark Engine
                </h2>
                {isMandatoryForRole && (
                  <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-marigold/20 text-charcoal border border-marigold/30">
                    Enforced for {userSession.role}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-graphite font-mono">
                Asset: {asset.title} ({asset.filename})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone hover:text-charcoal hover:bg-black/[0.05] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Left Interactive Canvas, Right Controls */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* Canvas Preview Area */}
          <div className="lg:w-7/12 bg-charcoal flex flex-col items-center justify-center p-6 relative overflow-auto select-none">
            <canvas
              ref={canvasRef}
              className="max-h-[58vh] max-w-full object-contain rounded-[8px] shadow-2xl border border-white/10"
            />
            {isRendering && (
              <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center text-white text-xs gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-marigold" />
                <span>Applying protective security layer...</span>
              </div>
            )}
          </div>

          {/* Right Parameters Panel */}
          <div className="lg:w-5/12 flex flex-col bg-white border-l border-black/[0.08] overflow-y-auto p-5 space-y-5 text-xs text-charcoal">
            
            {/* Role Notice */}
            <div className="p-3 bg-sky-tint border border-notion-blue/20 rounded-[8px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-notion-blue text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Enterprise Content Protection</span>
              </div>
              <p className="text-[11px] text-graphite leading-relaxed">
                Dynamic watermarking permanently imprints viewer identification, licensing authority, and audit timestamps directly into client downloads to prevent unapproved distribution.
              </p>
            </div>

            {/* Layout Style Choice */}
            <div>
              <label className="block text-[11px] font-bold text-stone uppercase tracking-wider mb-2">
                Watermark Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStyleMode('diagonal-matrix')}
                  className={`p-2.5 rounded-[8px] border text-center font-medium transition-colors cursor-pointer ${
                    styleMode === 'diagonal-matrix'
                      ? 'border-notion-blue bg-sky-tint text-notion-blue font-bold shadow-xs'
                      : 'border-black/[0.08] hover:bg-paper-warmth text-graphite'
                  }`}
                >
                  <div className="text-xs mb-0.5">Diagonal</div>
                  <div className="text-[10px] text-stone">Full Grid</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStyleMode('center-seal')}
                  className={`p-2.5 rounded-[8px] border text-center font-medium transition-colors cursor-pointer ${
                    styleMode === 'center-seal'
                      ? 'border-notion-blue bg-sky-tint text-notion-blue font-bold shadow-xs'
                      : 'border-black/[0.08] hover:bg-paper-warmth text-graphite'
                  }`}
                >
                  <div className="text-xs mb-0.5">Center Seal</div>
                  <div className="text-[10px] text-stone">Official Stamp</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStyleMode('bottom-bar')}
                  className={`p-2.5 rounded-[8px] border text-center font-medium transition-colors cursor-pointer ${
                    styleMode === 'bottom-bar'
                      ? 'border-notion-blue bg-sky-tint text-notion-blue font-bold shadow-xs'
                      : 'border-black/[0.08] hover:bg-paper-warmth text-graphite'
                  }`}
                >
                  <div className="text-xs mb-0.5">Bottom Strip</div>
                  <div className="text-[10px] text-stone">Banner Tag</div>
                </button>
              </div>
            </div>

            {/* Watermark Custom Text */}
            <div>
              <label className="block text-[11px] font-bold text-stone uppercase tracking-wider mb-1.5">
                Watermark Legend Text
              </label>
              <textarea
                rows={2}
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                disabled={isMandatoryForRole}
                className="w-full p-2.5 rounded-[8px] border border-black/[0.08] bg-paper-warmth text-charcoal font-mono text-[11px] focus:outline-none focus:border-notion-blue resize-none disabled:opacity-70"
              />
              {isMandatoryForRole && (
                <span className="text-[10px] text-stone mt-1 block">
                  Text template is locked to verify legal recipient identity.
                </span>
              )}
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-[11px] font-bold text-stone uppercase tracking-wider mb-2">
                Tone & Contrast
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWatermarkColor('white')}
                  className={`px-3 py-1.5 rounded-[8px] border text-xs font-medium cursor-pointer transition-colors ${
                    watermarkColor === 'white'
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-graphite border-black/[0.08] hover:bg-paper-warmth'
                  }`}
                >
                  Opaque White
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkColor('gold')}
                  className={`px-3 py-1.5 rounded-[8px] border text-xs font-medium cursor-pointer transition-colors ${
                    watermarkColor === 'gold'
                      ? 'bg-marigold text-charcoal font-bold border-marigold'
                      : 'bg-white text-graphite border-black/[0.08] hover:bg-paper-warmth'
                  }`}
                >
                  Singha Gold
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkColor('charcoal')}
                  className={`px-3 py-1.5 rounded-[8px] border text-xs font-medium cursor-pointer transition-colors ${
                    watermarkColor === 'charcoal'
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-graphite border-black/[0.08] hover:bg-paper-warmth'
                  }`}
                >
                  Charcoal Black
                </button>
              </div>
            </div>

            {/* Sliders: Opacity & Size */}
            <div className="space-y-3 pt-2 border-t border-black/[0.06]">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-graphite">Watermark Opacity</span>
                  <span className="font-mono text-stone">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.80"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-notion-blue cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-graphite">Font Scale</span>
                  <span className="font-mono text-stone">{fontSizeRatio}pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="44"
                  step="2"
                  value={fontSizeRatio}
                  onChange={(e) => setFontSizeRatio(parseInt(e.target.value))}
                  className="w-full accent-notion-blue cursor-pointer"
                />
              </div>
            </div>

            {/* Download Watermarked Action */}
            <div className="pt-4 border-t border-black/[0.08] space-y-2">
              <button
                type="button"
                onClick={handleDownloadWatermarked}
                className="w-full py-2.5 px-4 rounded-[8px] bg-notion-blue hover:bg-notion-blue/90 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Watermarked File Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Watermarked JPG</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-stone text-center leading-normal">
                Rendered client-side via HTML5 2D Canvas engine. Original master vector & RAW assets remain unmodified in the DAM core vault.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
