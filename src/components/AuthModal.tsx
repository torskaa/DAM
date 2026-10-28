import React, { useState } from 'react';
import { UserSession } from '../types/dam';
import { X, Check, Globe, Shield, User, Mail, Lock, Building, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onUpdateUser: (updatedUser: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form states
  const [role, setRole] = useState<'Regional Downloader' | 'Content Creator' | 'Brand Administrator'>('Brand Administrator');
  const [region, setRegion] = useState('Asia Pacific');
  const [country, setCountry] = useState('Thailand');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['SINGHA', 'LEO', 'U BEER']);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••');
  const [firstName, setFirstName] = useState(currentUser.name.split(' ')[0] || 'Korn');
  const [lastName, setLastName] = useState(currentUser.name.split(' ')[1] || 'Boonrawd');
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || 'Head of Global Brand Assets');
  const [companyName, setCompanyName] = useState(currentUser.companyName || 'Boon Rawd Brewery Co., Ltd.');
  const [contactPerson, setContactPerson] = useState(currentUser.boonrawdContact || 'Somchai Prasert (Corporate Affairs)');
  const [contactEmail, setContactEmail] = useState('somchai.p@boonrawd.co.th');
  const [message, setMessage] = useState('Requesting elevated brand manager credentials for APAC digital asset distribution.');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const toggleBrand = (b: string) => {
    if (selectedBrands.includes(b)) {
      if (selectedBrands.length > 1) {
        setSelectedBrands(selectedBrands.filter((item) => item !== b));
      }
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      email,
      name: `${firstName} ${lastName}`.trim() || 'Singha Administrator',
      role,
      region,
      country,
      brandAccess: selectedBrands,
      companyName,
      jobTitle,
      boonrawdContact: contactPerson,
    });
    onClose();
  };

  const handleCompleteRegistration = () => {
    setIsCompleted(true);
    onUpdateUser({
      ...currentUser,
      email,
      name: `${firstName} ${lastName}`.trim() || 'Singha Administrator',
      role,
      region,
      country,
      brandAccess: selectedBrands,
      companyName,
      jobTitle,
      boonrawdContact: contactPerson,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Brand Showcase (Faithful to PDF Pages 2-7 with Golden World Map) */}
        <div className="md:w-5/12 bg-[#FFFDF5] border-r border-amber-100 p-8 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-[#F5B800] text-neutral-950 flex items-center justify-center font-black">
                S
              </div>
              <div>
                <span className="font-extrabold text-xs tracking-tight text-neutral-900 block">
                  SINGHA BRAND WORLD
                </span>
                <span className="text-[10px] text-neutral-600 font-mono">
                  SINGHA CORPORATION, 2018–2026
                </span>
              </div>
            </div>

            <div className="my-6">
              <div className="text-4xl text-[#F5B800] mb-2">🦁</div>
              <h3 className="text-base font-black text-neutral-900 tracking-tight">
                Global Media & Brand Library
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Single sign-on access to master packaging vector artwork, lifestyle campaign assets, and legal dark market logos.
              </p>
            </div>
          </div>

          {/* Dotted Golden Map Representation */}
          <div className="pt-6 border-t border-amber-200/60">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold mb-1">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>50+ Countries Distribution</span>
            </div>
            <p className="text-[11px] text-neutral-600">
              Active Regional Hub: <strong>{region}</strong> ({country})
            </p>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="md:w-7/12 p-8 flex flex-col justify-between">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-6">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIsCompleted(false);
                  }}
                  className={`text-xs font-bold transition-colors pb-1 ${
                    mode === 'login'
                      ? 'text-neutral-900 border-b-2 border-[#F5B800]'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setIsCompleted(false);
                  }}
                  className={`text-xs font-bold transition-colors pb-1 ${
                    mode === 'register'
                      ? 'text-neutral-900 border-b-2 border-[#F5B800]'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LOGIN MODE */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Log in</h3>
                  <div className="h-0.5 w-6 bg-amber-400 mt-1 mb-4" />
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-amber-400 outline-none text-neutral-900"
                  />
                </div>

                <div className="text-right">
                  <a href="#forgot" className="text-[11px] text-neutral-600 hover:text-neutral-900 underline">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold rounded-md shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Submit & Access DAM
                </button>
              </form>
            )}

            {/* REGISTER WIZARD MODE (Steps 1 to 4) */}
            {mode === 'register' && !isCompleted && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      Create Account · Step {step} of 4
                    </h3>
                    <div className="h-0.5 w-6 bg-amber-400 mt-1" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-600">
                    {step === 1 ? 'Roles & Brands' : step === 2 ? 'Credentials' : step === 3 ? 'Profile' : 'Contact Person'}
                  </span>
                </div>

                {/* Step 1: Role, Region, Country, Brands (PDF Page 3-4) */}
                {step === 1 && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Request User Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white focus:border-amber-400 outline-none"
                      >
                        <option value="Brand Administrator">Brand Administrator (Full Creator & Share Access)</option>
                        <option value="Content Creator">Content Creator (Upload & Edit)</option>
                        <option value="Regional Downloader">Regional Downloader (Approved Master Downloads)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-neutral-800 block mb-1">Region</label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white"
                        >
                          <option value="Asia Pacific">Asia Pacific</option>
                          <option value="Europe & UK">Europe & UK</option>
                          <option value="North America">North America</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-neutral-800 block mb-1">Country</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white"
                        >
                          <option value="Thailand">Thailand</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Japan">Japan</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Select Brands</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['SINGHA', 'LEO', 'U BEER'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => toggleBrand(b)}
                            className={`p-2 rounded border text-center font-bold text-xs transition-colors ${
                              selectedBrands.includes(b)
                                ? 'bg-amber-100 border-amber-400 text-amber-950'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            {selectedBrands.includes(b) && '✓ '}
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Email & Password (PDF Page 5) */}
                {step === 2 && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@boonrawd.co.th"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Confirm password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: User Information (PDF Page 6) */}
                {step === 3 && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-neutral-800 block mb-1">Firstname</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-800 block mb-1">Lastname</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Job title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Company name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Boonrawd Contact Person (PDF Page 7) */}
                {step === 4 && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Boonrawd Contact Person</label>
                      <input
                        type="text"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Contact name at Boonrawd Brewery"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Contact email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Contact email"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-800 block mb-1">Message</label>
                      <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="rounded border-neutral-300 text-amber-500"
                      />
                      <span>I agree to the Singha Brand World Terms of Use</span>
                    </label>
                  </div>
                )}

                {/* Step Wizard Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => (s - 1) as any)}
                      className="px-3 py-2 border border-neutral-200 text-neutral-700 rounded flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : <div />}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => (s + 1) as any)}
                      className="px-4 py-2 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold rounded flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCompleteRegistration}
                      disabled={!termsAccepted}
                      className="px-5 py-2 bg-[#F5B800] hover:bg-[#E5A900] text-neutral-950 font-bold rounded shadow-xs disabled:opacity-50"
                    >
                      Create account
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* REGISTER COMPLETED MODAL (PDF Page 8) */}
            {mode === 'register' && isCompleted && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">Register Completed</h3>
                <div className="h-0.5 w-8 bg-amber-400 mx-auto" />
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Your account has been granted <strong>{role}</strong> status with access to <strong>{selectedBrands.join(', ')}</strong> assets in <strong>{region}</strong>.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Enter Brand World Library
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
