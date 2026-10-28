import React, { useState } from 'react';
import { Download, BookOpen, Send, Check, MessageSquare, ExternalLink } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto py-8 px-4 text-center space-y-8">
      {/* Title */}
      <div>
        <span className="notion-pill bg-[#ffb110] text-black">
          Official Documentation
        </span>
        <h1 className="text-3xl font-bold text-black tracking-tight mt-3">
          Singha Brand World Handbook
        </h1>
        <p className="text-sm text-[#615d59] mt-2 max-w-lg mx-auto font-['Lyon_Text',Georgia,serif]">
          The complete 22-page master brand identity design guide for Boon Rawd Brewery global operations, agencies, and licensed partners.
        </p>
      </div>

      {/* Book Presentation */}
      <div className="flex flex-col items-center justify-center">
        {/* Yellow Book Cover Representation */}
        <div className="w-56 h-76 bg-[#ffb110] rounded-r-[12px] rounded-l-[4px] p-6 flex flex-col items-center justify-between border-l-4 border-[#e89d01] relative group transition-transform duration-200 hover:scale-102">
          <div className="w-full flex justify-end">
            <span className="text-[10px] font-mono font-medium tracking-widest text-black/60">
              2018–2026
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="text-5xl text-black">🦁</div>
            <h3 className="text-lg font-bold text-black tracking-wider">
              SINGHA
            </h3>
            <div className="h-0.5 w-12 bg-black mx-auto" />
            <p className="text-xs font-bold tracking-widest text-black uppercase">
              HANDBOOK
            </p>
          </div>

          <div className="text-[9px] font-mono tracking-widest text-black/80 font-medium">
            BOON RAWD BREWERY CO., LTD.
          </div>
        </div>

        {/* Action Buttons (Download & Contact) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={pdfUrl}
            download="SINGHA-brandworld-design-05032018.pdf"
            className="notion-btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Master Handbook (15.1 MB)</span>
          </a>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="notion-btn-ghost flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read PDF in Browser</span>
          </a>

          <button
            onClick={() => setShowContactModal(true)}
            className="px-3.5 py-1.5 border border-[rgba(0,0,0,0.15)] text-black hover:bg-[rgba(0,0,0,0.04)] rounded-[8px] font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback & Enquiries</span>
          </button>
        </div>
      </div>

      {/* Chapters Summary */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 text-left shadow-xs mt-8">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4">
          Handbook Table of Contents (22 Pages)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-neutral-900">Pages 01–09: User Account & Roles</span>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Role request workflow for Downloaders, Creators, and Regional Country Admins.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-neutral-900">Page 10: Brand World Switcher</span>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Portfolio selection for Singha, Leo, and U Beer identity libraries.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-neutral-900">Pages 11–14: Master & Dark Market Logos</span>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Symbol clear spaces, minimum sizes, alcohol advertising legislation compliance.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <span className="font-bold text-neutral-900">Pages 15–22: Color, Font & Asset Grid</span>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              Pantone 3559 C & 7408 C breakdown, Korolev typography, and assets download portal.
            </p>
          </div>
        </div>
      </div>

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
