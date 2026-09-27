import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, ShieldCheck, Settings as SettingsIcon, 
  Check, X, Loader2, Smartphone, Mail, Globe, 
  LogOut, Car, FileText, Activity
} from 'lucide-react';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export default function DriverSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const [driverProfile, setDriverProfile] = useState({ 
    name: '', email: '', phone: '', vehicle_model: '', vehicle_number: '', verification_status: 'PENDING', aadhaar_number: '' 
  });
  
  const [preferences, setPreferences] = useState({
    language: localStorage.getItem('pr_driver_lang') || 'English',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || TEST_TOKEN;
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user) {
          setDriverProfile({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            vehicle_model: data.user.vehicle_model || '',
            vehicle_number: data.user.vehicle_number || '',
            verification_status: data.user.verification_status || 'PENDING',
            aadhaar_number: data.user.aadhaar_number || ''
          });
        }
      } catch (err) {}
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('pr_driver_lang', preferences.language);
  }, [preferences]);

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          name: driverProfile.name, 
          phone: driverProfile.phone,
          vehicle_model: driverProfile.vehicle_model,
          vehicle_number: driverProfile.vehicle_number
        })
      });
      if (res.ok) showToast("Settings updated successfully");
      else showToast("Failed to update settings");
    } catch (err) { showToast("Network error"); }
    setIsSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'vehicle', label: 'Vehicle Details', icon: Car },
    { id: 'kyc', label: 'Verification & KYC', icon: ShieldCheck },
    { id: 'preferences', label: 'App Preferences', icon: SettingsIcon },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 text-slate-900 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />

      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Driver Settings</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Manage your profile</p>
            </div>
          </div>
          
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to="/driver" className="hover:text-orange-500 transition-colors">Dashboard</Link>
            <Link to="/driver/packages" className="hover:text-orange-500 transition-colors">My Packages</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          <aside className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-4 mb-4 border-b border-slate-100">
              <div className="flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-black text-lg border border-indigo-100">
                {driverProfile.name ? driverProfile.name.substring(0,2).toUpperCase() : 'DR'}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate">{driverProfile.name || 'Driver'}</p>
                <p className="text-xs text-slate-400 truncate">{driverProfile.email}</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1.5 flex-1">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <tab.icon className="size-4" /> {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-rose-500 bg-rose-50 hover:bg-rose-500 hover:!text-white transition-colors border border-rose-200">
                <LogOut className="size-4" /> Log Out
              </button>
            </div>
          </aside>

          <div className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Update your basic contact details.</p>
                </div>
                <form onSubmit={saveSettings} className="space-y-6 max-w-xl">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <div className="relative mt-2">
                      <User className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={driverProfile.name} onChange={(e) => setDriverProfile({...driverProfile, name: e.target.value})} required className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address <span className="text-slate-400 lowercase tracking-normal">(Read Only)</span></label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-4 top-3.5 size-4 text-slate-300" />
                      <input type="email" value={driverProfile.email} readOnly className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 text-slate-400 pl-11 pr-4 text-sm outline-none cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                    <div className="relative mt-2">
                      <Smartphone className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={driverProfile.phone} onChange={(e) => setDriverProfile({...driverProfile, phone: e.target.value})} required className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3.5 text-sm font-black transition hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-900/20">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* 2. VEHICLE DETAILS TAB */}
            {activeTab === 'vehicle' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Vehicle Details</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Manage the vehicle you use for driving and tours.</p>
                </div>
                <form onSubmit={saveSettings} className="space-y-6 max-w-xl">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Vehicle Model</label>
                    <div className="relative mt-2">
                      <Car className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={driverProfile.vehicle_model} onChange={(e) => setDriverProfile({...driverProfile, vehicle_model: e.target.value})} placeholder="e.g. Maruti Suzuki Ertiga" className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">License Plate (Registration)</label>
                    <div className="relative mt-2">
                      <ShieldCheck className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={driverProfile.vehicle_number} onChange={(e) => setDriverProfile({...driverProfile, vehicle_number: e.target.value.toUpperCase()})} placeholder="UK-04-AB-1234" className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-mono font-bold tracking-widest outline-none focus:border-indigo-500 uppercase shadow-sm transition-all placeholder:text-slate-400" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-indigo-500 text-white px-6 py-3.5 text-sm font-black transition hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 disabled:opacity-50">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Update Vehicle Info
                  </button>
                </form>
              </div>
            )}

            {/* 3. KYC TAB */}
            {activeTab === 'kyc' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Trust & Verification</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Your background check and compliance status.</p>
                </div>
                <div className="space-y-6 max-w-xl">
                  <div className={`p-5 rounded-2xl border ${driverProfile.verification_status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                     <div className="flex items-center gap-3 mb-2">
                       {driverProfile.verification_status === 'APPROVED' ? (
                         <ShieldCheck className="size-6 text-emerald-600" />
                       ) : (
                         <Activity className="size-6 text-amber-600" />
                       )}
                       <h3 className="text-lg font-black text-slate-900">
                         Status: <span className={driverProfile.verification_status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}>{driverProfile.verification_status}</span>
                       </h3>
                     </div>
                     <p className="text-sm text-slate-600">
                       {driverProfile.verification_status === 'APPROVED' 
                         ? 'Your account is fully verified. You can accept rides and host packages.' 
                         : 'Your documents are currently under review by our admin team.'}
                     </p>
                  </div>
                  
                  {driverProfile.aadhaar_number && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted ID</label>
                      <div className="relative mt-2">
                        <FileText className="absolute left-4 top-3.5 size-4 text-slate-300" />
                        <input type="text" value={`XXXX-XXXX-${driverProfile.aadhaar_number.slice(-4)}`} readOnly className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 text-slate-400 pl-11 pr-4 text-sm font-mono outline-none cursor-not-allowed" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">To update your KYC documents, please contact support.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">App Preferences</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Customize your driver experience.</p>
                </div>
                <div className="space-y-6 max-w-xl">
                  <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2"><Globe className="size-4 text-indigo-500" /> Interface Language</p>
                      <p className="text-sm text-slate-500 mt-1">Select your preferred language.</p>
                    </div>
                    <select 
                      value={preferences.language} 
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setPreferences({...preferences, language: newLang});
                        if (newLang === 'Hindi') {
                            document.cookie = "googtrans=/en/hi; path=/";
                            document.cookie = "googtrans=/en/hi; domain=." + document.domain + "; path=/";
                        } else {
                            document.cookie = "googtrans=/en/en; path=/";
                            document.cookie = "googtrans=/en/en; domain=." + document.domain + "; path=/";
                        }
                        window.location.reload();
                      }}
                      className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-indigo-500 shadow-sm"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-2xl shadow-slate-900/30 animate-in slide-in-from-bottom-5">
          <Check className="size-4 text-emerald-400" />{notice}
          <button onClick={() => setNotice('')}><X className="size-4 opacity-60 hover:opacity-100" /></button>
        </div>
      )}
    </main>
  );
}