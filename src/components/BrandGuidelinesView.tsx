import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileCode, 
  Type, 
  Palette, 
  Info,
  ExternalLink,
  Crown,
  FileText,
  Bookmark
} from 'lucide-react';
import { BentoGrid, BentoCard } from './ui/bento-grid';

interface BrandGuidelinesViewProps {
  onOpenPdf: () => void;
  onFilterCategory: (cat: any) => void;
}

export const BrandGuidelinesView: React.FC<BrandGuidelinesViewProps> = ({
  onOpenPdf,
  onFilterCategory,
}) => {
  const params = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const validSections: ('intro' | 'master' | 'dark' | 'secondary' | 'color' | 'font')[] = [
    'master', 'dark', 'secondary', 'color', 'font', 'intro'
  ];

  const currentSection = (params.section && validSections.includes(params.section as any)) 
    ? (params.section as 'intro' | 'master' | 'dark' | 'secondary' | 'color' | 'font')
    : 'master';

  const [section, setSection] = useState<'intro' | 'master' | 'dark' | 'secondary' | 'color' | 'font'>(currentSection);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    if (params.section && validSections.includes(params.section as any)) {
      setSection(params.section as any);
    }
  }, [params.section]);

  const handleSelectSection = (sec: 'intro' | 'master' | 'dark' | 'secondary' | 'color' | 'font') => {
    setSection(sec);
    navigate(`/guidelines/${sec}`);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadGuidelineAsset = (name: string, ext: string = 'ai') => {
    setDownloadNotice(`Downloading official certified asset package: ${name}.${ext}`);
    setTimeout(() => {
      setDownloadNotice(null);
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${name.replace(/\s+/g, '_')}_Master_Approved.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Guidelines Header Strip */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <span>Singha Corporation</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Official Brand Manual</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="text-neutral-700 font-semibold">2018–2026 Edition</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mt-2 font-heading">
            Singha Brand World Identity Guidelines
          </h1>
          <p className="text-sm text-[#615d59] mt-1 max-w-2xl font-['Lyon_Text',Georgia,serif]">
            Official identity manual detailing Master Logo, Dark Market advertising legal compliance, ESTD 1933 Secondary Mark, color breakdowns, and typography hierarchy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDownloadGuidelineAsset('Singha_Master_Identity_Vector_Kit', 'zip')}
            className="px-3.5 py-1.5 border border-[rgba(0,0,0,0.15)] text-black hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Vectors (.ZIP)</span>
          </button>

          <button
            onClick={onOpenPdf}
            className="notion-btn-primary flex items-center gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Handbook PDF (15 MB)</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-[#e6f3fe] text-[#0075de] border border-[#0075de]/30 rounded-[8px] text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#0075de]" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Brand Identity Pillars BentoGrid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal font-heading">
            Brand Identity System Bento Overview
          </span>
          <span className="text-[11px] text-stone font-mono">
            Click any Bento module to inspect design specifications
          </span>
        </div>

        <BentoGrid className="lg:grid-cols-3">
          <BentoCard
            name="01. Master Logo & Mythical Lion"
            description="The core Singha emblem crafted since 1933 representing royal craftsmanship and prestige."
            badge="Basic Design · Sec 1"
            Icon={Crown}
            className={section === 'master' ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-paper-warmth flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <span className="text-6xl text-amber-500">🦁</span>
              </div>
            }
            cta="Inspect Master Logo"
            onClick={() => handleSelectSection('master')}
          />

          <BentoCard
            name="02. Dark Market Vector Compliance"
            description="Special legal mark for countries with strict alcohol advertising prohibitions."
            badge="Legal Protocol · Sec 2"
            Icon={ShieldAlert}
            className={section === 'dark' ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-amber-400 flex items-center justify-center p-6 opacity-25 group-hover:scale-105 transition-all">
                <div className="w-24 h-24 rounded-full border-4 border-black flex items-center justify-center font-bold text-black text-2xl font-mono">
                  1933
                </div>
              </div>
            }
            cta="Inspect Dark Market Rules"
            onClick={() => handleSelectSection('dark')}
          />

          <BentoCard
            name="03. ESTD 1933 Secondary Mark"
            description="Mandatory 12-degree heritage slope mark used on premium glassware, coasters, and packaging."
            badge="Brand Assets · Sec 3"
            Icon={Bookmark}
            className={section === 'secondary' ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-sky-tint flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <span className="text-4xl font-black text-notion-blue rotate-12">ESTD 1933</span>
              </div>
            }
            cta="Inspect 1933 Mark"
            onClick={() => handleSelectSection('secondary')}
          />

          <BentoCard
            name="04. Color System & Pantone"
            description="Official color formulas including Singha Gold (Pantone 123 C), Lion Blue, and Indochina White."
            badge="Palette Specs · Sec 4"
            Icon={Palette}
            className={section === 'color' ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-md' : ''}
            background={
              <div className="w-full h-full grid grid-cols-2 p-4 gap-1 opacity-30 group-hover:scale-105 transition-all">
                <div className="bg-[#ffb110] rounded-xs" />
                <div className="bg-[#0075de] rounded-xs" />
                <div className="bg-[#111111] rounded-xs" />
                <div className="bg-[#f6f5f4] rounded-xs" />
              </div>
            }
            cta="Inspect Color Formulas"
            onClick={() => handleSelectSection('color')}
          />

          <BentoCard
            name="05. Typography Hierarchy"
            description="Korolev Display for international packaging and DB Helvethaica for Indochina commercial print."
            badge="Type System · Sec 5"
            Icon={Type}
            className={section === 'font' ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-paper-warmth flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <span className="text-5xl font-black text-charcoal">Aa Bb Gg</span>
              </div>
            }
            cta="Inspect Typography"
            onClick={() => handleSelectSection('font')}
          />

          <BentoCard
            name="06. Official Handbook (PDF)"
            description="Download the full 22-page certified brand manual published by Boon Rawd Brewery global HQ."
            badge="Master PDF · Sec 6"
            Icon={FileText}
            className={section === 'intro' ? 'border-notion-blue ring-2 ring-notion-blue/20 shadow-md' : ''}
            background={
              <div className="w-full h-full bg-paper-warmth flex items-center justify-center p-6 opacity-30 group-hover:scale-105 transition-all">
                <span className="text-4xl text-charcoal">📖</span>
              </div>
            }
            cta="View Handbook PDF"
            onClick={onOpenPdf}
          />
        </BentoGrid>
      </div>

      {/* Horizontal Guideline Sub-nav */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white border border-black/[0.08] rounded-[8px]">
        {[
          { id: 'master', label: '01. Master Logo' },
          { id: 'dark', label: '02. Dark Market Logo' },
          { id: 'secondary', label: '03. Secondary Logo (1933)' },
          { id: 'color', label: '04. Color Breakdown' },
          { id: 'font', label: '05. Typography (Korolev)' },
          { id: 'intro', label: '06. Brand Introduction' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectSection(item.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-[8px] whitespace-nowrap transition-colors cursor-pointer ${
              section === item.id
                ? 'bg-sky-tint text-notion-blue font-semibold shadow-xs'
                : 'text-stone hover:text-charcoal hover:bg-black/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: MASTER LOGO (PDF Page 12) */}
      {section === 'master' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                  Basic Design · Section 1
                </span>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight mt-1 mb-2">
                  Singha Brand Symbol & Master Logo Versions
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The Master Logo consists of the Singha core icon and typography which have been carefully crafted to reflect the heritage of the brand and quality of our beer. Since 1933, the mythical lion symbol remains Thailand's most revered emblem of royal craftsmanship.
                </p>
              </div>

              <button
                onClick={() => handleDownloadGuidelineAsset('Singha_Master_Logo_All_Versions', 'ai')}
                className="px-3.5 py-2 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Master Vector (.AI)</span>
              </button>
            </div>

            {/* Logo Visual Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              {/* CMYK & RGB */}
              <div className="p-6 rounded-lg border border-neutral-200 bg-neutral-50/50 flex flex-col items-center text-center">
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl text-[#F5B800]">🦁</div>
                    <span className="text-sm font-black tracking-widest text-[#F5B800] block mt-1">SINGHA</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">CMYK & RGB Version</h4>
                <p className="text-[11px] text-neutral-600 mt-1 mb-3">
                  Full color version with gradient - CMYK version for printing and RGB version for on-line usage.
                </p>
                <button
                  onClick={() => handleDownloadGuidelineAsset('Singha_Logo_CMYK_RGB', 'eps')}
                  className="text-xs font-bold text-neutral-900 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .EPS</span>
                </button>
              </div>

              {/* Pantone Version */}
              <div className="p-6 rounded-lg border border-neutral-200 bg-neutral-50/50 flex flex-col items-center text-center">
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl text-[#D49B00]">🦁</div>
                    <span className="text-sm font-black tracking-widest text-neutral-900 block mt-1">SINGHA</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">Pantone 3559 C Version</h4>
                <p className="text-[11px] text-neutral-600 mt-1 mb-3">
                  This is a 2-process version for primary corporate printing and spot-color packaging.
                </p>
                <button
                  onClick={() => handleDownloadGuidelineAsset('Singha_Logo_Pantone_3559C', 'ai')}
                  className="text-xs font-bold text-neutral-900 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .AI</span>
                </button>
              </div>

              {/* Simplified Version */}
              <div className="p-6 rounded-lg border border-neutral-200 bg-neutral-50/50 flex flex-col items-center text-center">
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl text-neutral-900">🦁</div>
                    <span className="text-sm font-black tracking-widest text-neutral-900 block mt-1">SINGHA</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-neutral-900">Simplified & Kurz Version</h4>
                <p className="text-[11px] text-neutral-600 mt-1 mb-3">
                  Simplified kurba-friendly version for screen printing restrictions and embroidery on uniforms.
                </p>
                <button
                  onClick={() => handleDownloadGuidelineAsset('Singha_Logo_Simplified_Kurz', 'ai')}
                  className="text-xs font-bold text-neutral-900 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .AI</span>
                </button>
              </div>
            </div>

            {/* Clear Space & Minimum Size Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>Clear Space Rule (Letter "S" Matrix)</span>
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The clear space around the logo is the cap height of the letter "S". When used on a background, no other typography or logos may enter this buffer zone.
                </p>
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-center font-mono text-xs text-amber-900">
                  Buffer Perimeter = 1.0 × "S" Cap Height
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>Minimum Print Size</span>
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  To maintain legibility, the Master Logo must never be reproduced smaller than <strong>18mm width</strong> in print, or <strong>64px width</strong> in digital applications.
                </p>
                <div className="p-4 bg-neutral-100 rounded-lg flex items-center justify-center font-mono text-xs text-neutral-700">
                  Min Width: 18mm (Print) / 64px (Digital)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DARK MARKET LOGO (PDF Page 13) */}
      {section === 'dark' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-950 font-bold rounded text-xs mb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>Legal Advertising Compliance Rule</span>
                </div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight mb-2">
                  Dark Market Logo Specifications
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  In territories that do not permit usage of gold colour and brand typography off premises, we have created this "Dark Market" logo with Singha icon in white within a yellow device. <strong>Only use the supplied artwork and not make other logo versions. No gold allowed.</strong>
                </p>
              </div>

              <button
                onClick={() => handleDownloadGuidelineAsset('Singha_Dark_Market_Logo_Official', 'ai')}
                className="px-3.5 py-2 bg-[#FDB813] hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Dark Market Vector (.AI)</span>
              </button>
            </div>

            {/* Dark Market Visual comparison */}
            <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="p-8 rounded-xl bg-[#FDB813] flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-36 h-36 border-4 border-white flex flex-col items-center justify-center rounded-lg shadow-md bg-[#FDB813]">
                  <span className="text-5xl text-white">🦁</span>
                </div>
                <span className="mt-4 text-xs font-bold font-mono tracking-widest text-neutral-950">
                  APPROVED DARK MARKET LOCKUP
                </span>
                <span className="text-[11px] text-neutral-800">
                  White silhouette on Pantone 7408 C yellow holding device
                </span>
              </div>

              {/* Don'ts Rules Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Strict "Don'ts" Rules (PDF Page 13)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-2.5 rounded bg-red-50/70 border border-red-200 text-red-900">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>No Gold Allowed:</strong> Never render the Dark Market emblem in metallic gold or gradient gold.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded bg-red-50/70 border border-red-200 text-red-900">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Do not change background color:</strong> The holding device must strictly be Pantone 7408 C.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded bg-red-50/70 border border-red-200 text-red-900">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span><strong>Do not add drop shadows or 3D bevels</strong> to the white icon or device shape.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SECONDARY LOGO ESTD 1933 (PDF Page 14) */}
      {section === 'secondary' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                  Basic Design · Section 3
                </span>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight mt-1 mb-2">
                  Secondary Logo - ESTD 1933 Heritage Mark
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The ESTD 1933 mark commemorates Boon Rawd Brewery's historic founding by Phraya Bhirom Bhakdi. The progressive slope is scaled up and down based on a fixed <strong>12-degree angle</strong>.
                </p>
              </div>

              <button
                onClick={() => handleDownloadGuidelineAsset('Singha_ESTD_1933_Slope_Mark', 'ai')}
                className="px-3.5 py-2 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ESTD 1933 Kit (.AI)</span>
              </button>
            </div>

            {/* 12-Degree Slope Diagram */}
            <div className="my-8 p-8 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <div className="inline-block transform -rotate-12 bg-[#F5B800] text-neutral-950 font-black text-xl px-5 py-2.5 rounded-sm shadow-md tracking-wider">
                  ESTD 1933
                </div>
                <p className="text-xs font-mono text-neutral-700 font-bold pt-4">
                  Progressive Slope: Exactly 12° Angle
                </p>
                <p className="text-[11px] text-neutral-600">
                  Used consistently with master imagery and promotional displays across Southeast Asia and global distribution.
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-700">
                <p className="font-bold text-neutral-900">Approved Usage Variants:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Horizontal bar with right-leaning 12° wedge</li>
                  <li>Vertical banner flag lockup</li>
                  <li>Combined with master Singha Lion crest</li>
                  <li>Dark market single-color flat yellow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: COLOR BREAKDOWN (PDF Page 15) */}
      {section === 'color' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight mb-1">
                  Singha Master Color Breakdown (CMYK, RGB & Pantone)
                </h2>
                <p className="text-xs text-neutral-600">
                  Exact color specifications certified by Boon Rawd Brewery. Click any swatch or code to copy to clipboard.
                </p>
              </div>

              <button
                onClick={() => handleDownloadGuidelineAsset('Singha_Brand_Color_Swatches_ASE', 'ase')}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Adobe Swatch (.ASE)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Pantone 3559 C */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
                <div className="w-full h-24 rounded-lg bg-[#F5B800] border border-black/10 shadow-inner" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Singha Gold</h4>
                  <p className="text-[11px] text-neutral-600 font-semibold">Pantone 3559 C</p>
                </div>
                <div className="space-y-1 text-xs font-mono tabular-nums text-neutral-700">
                  <div 
                    onClick={() => copyCode('#F5B800')}
                    className="flex justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer"
                  >
                    <span>HEX</span>
                    <span className="font-bold">#F5B800</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                    <span>RGB</span>
                    <span>245, 184, 0</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded">
                    <span>CMYK</span>
                    <span>0, 25, 100, 4</span>
                  </div>
                </div>
              </div>

              {/* Pantone 7408 C (Dark Market Yellow) */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
                <div className="w-full h-24 rounded-lg bg-[#FDB813] border border-black/10 shadow-inner" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Dark Market Yellow</h4>
                  <p className="text-[11px] text-neutral-600 font-semibold">Pantone 7408 C</p>
                </div>
                <div className="space-y-1 text-xs font-mono tabular-nums text-neutral-700">
                  <div 
                    onClick={() => copyCode('#FDB813')}
                    className="flex justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer"
                  >
                    <span>HEX</span>
                    <span className="font-bold">#FDB813</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                    <span>RGB</span>
                    <span>253, 184, 19</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded">
                    <span>CMYK</span>
                    <span>0, 30, 95, 0</span>
                  </div>
                </div>
              </div>

              {/* Pantone Black 6 C */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
                <div className="w-full h-24 rounded-lg bg-[#231F20] border border-black/10 shadow-inner" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Singha Jet Black</h4>
                  <p className="text-[11px] text-neutral-600 font-semibold">Pantone Black 6 C</p>
                </div>
                <div className="space-y-1 text-xs font-mono tabular-nums text-neutral-700">
                  <div 
                    onClick={() => copyCode('#231F20')}
                    className="flex justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer"
                  >
                    <span>HEX</span>
                    <span className="font-bold">#231F20</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                    <span>RGB</span>
                    <span>35, 31, 32</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded">
                    <span>CMYK</span>
                    <span>0, 0, 0, 100</span>
                  </div>
                </div>
              </div>

              {/* Pure White */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs space-y-3">
                <div className="w-full h-24 rounded-lg bg-white border border-neutral-300 shadow-inner" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Opaque White</h4>
                  <p className="text-[11px] text-neutral-600 font-semibold">Base White Understrike</p>
                </div>
                <div className="space-y-1 text-xs font-mono tabular-nums text-neutral-700">
                  <div 
                    onClick={() => copyCode('#FFFFFF')}
                    className="flex justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer"
                  >
                    <span>HEX</span>
                    <span className="font-bold">#FFFFFF</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-neutral-50 rounded">
                    <span>RGB</span>
                    <span>255, 255, 255</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded">
                    <span>CMYK</span>
                    <span>0, 0, 0, 0</span>
                  </div>
                </div>
              </div>
            </div>

            {copiedCode && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-xs flex items-center gap-2 mt-4">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied <strong>{copiedCode}</strong> to clipboard!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: FONT RULES (PDF Page 16) */}
      {section === 'font' && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                  Basic Design · Section 5
                </span>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight mt-1 mb-2">
                  Brand Font Hierarchy: Korolev Condensed
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  We use two primary weights of Korolev Condensed: Bold and Heavy. The two weights are used consistently for titles, packaging callouts, and body copy across all global Singha Corporation advertising collateral.
                </p>
              </div>

              <button
                onClick={() => handleDownloadGuidelineAsset('Singha_Korolev_Typography_Spec', 'pdf')}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Font Spec (.PDF)</span>
              </button>
            </div>

            <div className="space-y-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-600 uppercase font-bold">
                  Headline Weight · Korolev Condensed Heavy
                </span>
                <p className="text-3xl font-black tracking-tight text-neutral-950 uppercase font-sans">
                  THE ORIGINAL THAI BEER
                </p>
                <p className="font-mono text-xs text-neutral-600 tracking-wider">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789
                </p>
              </div>

              <div className="h-px bg-neutral-200" />

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-600 uppercase font-bold">
                  Body Copy Weight · Korolev Condensed Bold
                </span>
                <p className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                  SINGHA BEER IS THE SPIRITUAL HEART OF THAILAND, OUR PRIDE, AND OUR HERITAGE.
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Since we introduced it in 1933, Singha has won many awards and spread to more than fifty countries. For millions of people around the world, it reflects the energy, warmth, and simple luxuries of Thai life.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: INTRODUCTION & HERITAGE (PDF Page 11) */}
      {section === 'intro' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-xs space-y-6">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
              Basic Design · Introduction
            </span>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight mt-1 mb-2">
              Singha Beer - The Spiritual Heart of Thailand
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Our pride, and our heritage. Since we introduced it in 1933, Singha has won many awards and spread to more than fifty countries worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="rounded-xl overflow-hidden border border-neutral-200">
              <img
                src="/src/assets/images/singha_beer_lifestyle_toast_1793083582441.jpg"
                alt="Friends toasting Singha"
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-white">
                <h4 className="text-xs font-bold text-neutral-900">Connecting People Globally</h4>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Reflecting the warmth, generosity, and authentic celebration of modern Thai hospitality.
                </p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-neutral-200">
              <img
                src="/src/assets/images/singha_craft_bottle_bar_1793083583140.jpg"
                alt="Singha craft bottle"
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-white">
                <h4 className="text-xs font-bold text-neutral-900">Artisan Brewing Tradition</h4>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  100% premium barley malt, European Saaz hops, and royal royal Garuda seal granted by King Rama VII.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
