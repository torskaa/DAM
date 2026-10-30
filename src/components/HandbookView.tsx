import React, { useState } from 'react';
import { Download, BookOpen, Send, Check, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { BentoGrid, BentoCard } from './ui/bento-grid';
import {
  FileTextIcon,
  GlobeIcon,
  ReaderIcon,
  DownloadIcon,
  ChatBubbleIcon
} from '@radix-ui/react-icons';

export const HandbookView: React.FC = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const pdfUrl = '/assets/aistudio/SINGHA-brandworld-design-05032018_31699fbc.pdf';

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setShowContactModal(false);
      setSubject('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Singha Brand World Handbook
            </h1>
            <span className="notion-pill bg-[#ffb110] text-black">
              Official Master PDF
            </span>
          </div>
          <p className="text-sm text-[#615d59] mt-1 max-w-2xl font-['Lyon_Text',Georgia,serif]">
            The complete 22-page master brand identity design guide for Boon Rawd Brewery global operations, agencies, and licensed partners.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={pdfUrl}
            download="SINGHA-brandworld-design-05032018.pdf"
            className="notion-btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download PDF (15.1 MB)</span>
          </a>
          <button
            onClick={() => setShowContactModal(true)}
            className="notion-btn-ghost flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enquiries</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <BentoGrid className="lg:auto-rows-[18rem]">
        {/* Card 1: Master Yellow Book (Span 2) */}
        <BentoCard
          name="Official Singha Handbook Edition"
          description="High-resolution 22-page vector guide containing official color formulas, typography rules, clearspace geometry, and packaging guidelines."
          Icon={ReaderIcon}
          className="lg:col-span-2 bg-gradient-to-br from-[#fffdfa] via-white to-[#ffb110]/15"
          badge="15.1 MB PDF"
          background={
            <div className="absolute right-6 top-6 flex items-center gap-4 opacity-85">
              <div className="w-24 h-32 bg-[#ffb110] rounded-r-lg rounded-l-xs p-3 flex flex-col justify-between border-l-2 border-[#e89d01] shadow-md transform rotate-3">
                <span className="text-[8px] font-mono text-black/60 text-right">2018–2026</span>
                <div className="text-center font-bold text-black text-xs">
                  <div>🦁</div>
                  <div className="text-[10px] tracking-widest mt-1">SINGHA</div>
                </div>
                <span className="text-[7px] font-mono text-black/70">BOON RAWD</span>
              </div>
            </div>
          }
          href={pdfUrl}
          cta="Download Master Handbook"
        />

        {/* Card 2: User Account & Roles (Span 1) */}
        <BentoCard
          name="Pages 01–09: User Account & Roles"
          description="Role request workflows for Downloaders, Creators, and Regional Country Admins with verification protocols."
          Icon={FileTextIcon}
          className="lg:col-span-1"
          badge="Governance"
          background={
            <div className="absolute right-4 bottom-12 p-2 rounded-lg bg-black/5 text-[10px] font-mono text-[#615d59]">
              Regional Approvals: 24h
            </div>
          }
          href={pdfUrl}
          cta="Read Pages 01-09"
        />

        {/* Card 3: Brand World Switcher (Span 1) */}
        <BentoCard
          name="Page 10: Brand World Switcher"
          description="Portfolio partition protocols across Singha, Leo, and U Beer corporate identity systems."
          Icon={GlobeIcon}
          className="lg:col-span-1"
          badge="Multi-Brand"
          background={
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#0075de]/10 blur-xl" />
          }
          href={pdfUrl}
          cta="Read Page 10"
        />

        {/* Card 4: Master & Dark Market Logos (Span 1) */}
        <BentoCard
          name="Pages 11–14: Advertising Compliance"
          description="Legal clear space, minimum print thresholds, and dark market alcohol legislation compliance matrices."
          Icon={ShieldCheck}
          className="lg:col-span-1"
          badge="Dark Market SOP"
          background={
            <div className="absolute right-4 top-4 text-xs font-mono px-2 py-1 rounded bg-black text-[#ffb110]">
              Zero-Alcohol Rules
            </div>
          }
          href={pdfUrl}
          cta="Read Pages 11-14"
        />

        {/* Card 5: Color, Font & Downloads (Span 1) */}
        <BentoCard
          name="Pages 15–22: Color, Font & Grids"
          description="Pantone 3559 C & 7408 C breakdown, Korolev typographic hierarchy, and master asset resolution specs."
          Icon={DownloadIcon}
          className="lg:col-span-1"
          badge="Color Specs"
          background={
            <div className="absolute right-4 top-4 flex gap-1">
              <span className="w-4 h-4 rounded-full bg-[#ffb110] border border-black/10" />
              <span className="w-4 h-4 rounded-full bg-[#0075de] border border-black/10" />
              <span className="w-4 h-4 rounded-full bg-black border border-black/10" />
            </div>
          }
          href={pdfUrl}
          cta="Read Pages 15-22"
        />
      </BentoGrid>

      {/* Contact Form Modal (PDF Page 21) */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div 
            className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 text-left border border-neutral-200 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <h3 className="text-base font-bold text-neutral-900">Contact form</h3>
              <div className="h-0.5 w-8 bg-amber-400 mx-auto my-1.5" />
              <p className="text-xs text-neutral-600">
                Got an Idea? Question? Found a bug? We would love to hear your feedback.
              </p>
            </div>

            {isSent ? (
              <div className="py-8 text-center text-emerald-800 space-y-2">
                <Check className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Message Sent Successfully!</p>
                <p className="text-xs text-neutral-600">
                  Boon Rawd Brewery Brand World team will reply within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Asset format inquiry or regional request"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please specify your brand world question or feedback..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-md font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold rounded-md transition-colors cursor-pointer"
                  >
                    Next & Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
