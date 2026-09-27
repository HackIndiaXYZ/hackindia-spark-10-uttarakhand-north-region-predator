    import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, User, ShieldCheck, Settings as SettingsIcon, CreditCard, 
  HeartHandshake, Check, X, Loader2, Smartphone, Mail, Globe, 
  Bell, ToggleLeft, ToggleRight, LogOut, Lock, AlertTriangle 
} from 'lucide-react';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export default function CustomerSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  // States
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [preferences, setPreferences] = useState({
    language: localStorage.getItem('pr_lang') || 'English',
    notifications: localStorage.getItem('pr_notifs') !== 'false',
    promoEmails: true
  });
  const [security, setSecurity] = useState({
    twoFactor: localStorage.getItem('pr_2fa') === 'true'
  });
  const [payment, setPayment] = useState(localStorage.getItem('pr_payment') || 'UPI');
  const [emergency, setEmergency] = useState({ contactName: '', contactPhone: '' });

  // Load initial data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || TEST_TOKEN;
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user) {
          setProfile({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || ''
          });
          // Assuming emergency contacts might be in the user object in a real DB
          if (data.user.emergency_contact_name) {
            setEmergency({
              contactName: data.user.emergency_contact_name,
              contactPhone: data.user.emergency_contact_phone
            });
          }
        }
      } catch (err) {}
    };
    fetchProfile();
  }, [navigate]);

  // Persist local preferences immediately
  useEffect(() => {
    localStorage.setItem('pr_lang', preferences.language);
    localStorage.setItem('pr_notifs', preferences.notifications);
    localStorage.setItem('pr_2fa', security.twoFactor);
    localStorage.setItem('pr_payment', payment);
  }, [preferences, security, payment]);

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone })
      });
      if (res.ok) showToast("Profile updated successfully");
      else showToast("Failed to update profile");
    } catch (err) { showToast("Network error"); }
    setIsSaving(false);
  };

  const saveEmergencyContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          emergency_contact_name: emergency.contactName, 
          emergency_contact_phone: emergency.contactPhone 
        })
      });
      if (res.ok) showToast("Emergency contact secured");
      else showToast("Failed to save contact");
    } catch (err) { showToast("Network error"); }
    setIsSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'safety', label: 'Emergency SOS', icon: HeartHandshake },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 text-slate-900 relative overflow-hidden">
      {/* Decorative Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-400/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />

      {/* HEADER NAV */}
      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4 relative z-10">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Account Settings</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Manage your profile</p>
            </div>
          </div>
          
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to="/customer" className="hover:text-orange-500 transition-colors">Dashboard</Link>
            <Link to="/customer/rides" className="hover:text-orange-500 transition-colors">My rides</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-4 mb-4 border-b border-slate-100">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-50 text-orange-500 font-black text-lg border border-orange-100">
                {profile.name.substring(0,2).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate">{profile.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{profile.email}</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1.5 flex-1">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
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

          {/* MAIN CONTENT AREA */}
          <div className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Personal Information</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Update your personal details and how we can reach you.</p>
                </div>
                <form onSubmit={saveProfile} className="space-y-6 max-w-xl">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <div className="relative mt-2">
                      <User className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address <span className="text-slate-400 lowercase tracking-normal">(Read Only)</span></label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-4 top-3.5 size-4 text-slate-300" />
                      <input type="email" value={profile.email} readOnly className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 text-slate-400 pl-11 pr-4 text-sm outline-none cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                    <div className="relative mt-2">
                      <Smartphone className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} required className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3.5 text-sm font-black transition hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-900/20">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* 2. SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Security & Auth</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Protect your account with extra layers of security.</p>
                </div>
                
                <div className="space-y-6 max-w-xl">
                  <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2"><Lock className="size-4 text-orange-500" /> Password</p>
                      <p className="text-sm text-slate-500 mt-1">Last changed 3 months ago</p>
                    </div>
                    <button onClick={() => showToast("Password reset link sent to email")} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition border border-slate-200">Reset</button>
                  </div>

                  <div className="flex items-start justify-between p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="pr-4">
                      <p className="font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-500" /> Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">Require a 6-digit code from Google Authenticator every time you log in from a new device.</p>
                    </div>
                    <button onClick={() => setSecurity({...security, twoFactor: !security.twoFactor})} className="mt-1 focus:outline-none">
                      {security.twoFactor ? <ToggleRight className="size-8 text-orange-500" /> : <ToggleLeft className="size-8 text-slate-300" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">App Preferences</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Customize your Rahi experience.</p>
                </div>
                
                <div className="space-y-6 max-w-xl divide-y divide-slate-100">
                  <div className="flex items-center justify-between pb-6">
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2"><Globe className="size-4 text-orange-500" /> Interface Language</p>
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
                      className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer focus:border-orange-500 shadow-sm"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-6">
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2"><Bell className="size-4 text-orange-500" /> Push Notifications</p>
                      <p className="text-sm text-slate-500 mt-1">Trip updates, driver arrivals, and SOS alerts.</p>
                    </div>
                    <button onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})} className="focus:outline-none">
                      {preferences.notifications ? <ToggleRight className="size-8 text-orange-500" /> : <ToggleLeft className="size-8 text-slate-300" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-6">
                    <div>
                      <p className="font-black text-slate-900 flex items-center gap-2"><Mail className="size-4 text-orange-500" /> Promotional Emails</p>
                      <p className="text-sm text-slate-500 mt-1">Discounts, new tour packages, and news.</p>
                    </div>
                    <button onClick={() => setPreferences({...preferences, promoEmails: !preferences.promoEmails})} className="focus:outline-none">
                      {preferences.promoEmails ? <ToggleRight className="size-8 text-orange-500" /> : <ToggleLeft className="size-8 text-slate-300" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PAYMENT TAB */}
            {activeTab === 'payment' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Payment Methods</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Manage how you pay for rides and tours.</p>
                </div>
                
                <div className="space-y-4 max-w-xl">
                  {['UPI', 'Card', 'Cash'].map((method) => (
                    <div 
                      key={method}
                      onClick={() => setPayment(method)}
                      className={`cursor-pointer flex items-center justify-between p-5 rounded-2xl border transition-all shadow-sm ${payment === method ? 'border-orange-300 bg-orange-50 ring-1 ring-orange-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${payment === method ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{method}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{method === 'Cash' ? 'Pay directly to driver' : 'Fast and secure digital payment'}</p>
                        </div>
                      </div>
                      <div className={`size-5 rounded-full border-4 transition-colors ${payment === method ? 'border-orange-500' : 'border-slate-200'}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SAFETY & SOS TAB */}
            {activeTab === 'safety' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-6 text-rose-500" />
                    <h2 className="text-2xl font-black text-slate-900">Emergency SOS</h2>
                  </div>
                  <p className="text-sm text-slate-500">Save a trusted contact. We will automatically share your live GPS location with them if you trigger the SOS button during a ride.</p>
                </div>
                
                <form onSubmit={saveEmergencyContact} className="space-y-6 max-w-xl">
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 mb-6">
                     <p className="text-sm text-rose-600 font-semibold flex items-start gap-2">
                       <ShieldCheck className="size-5 shrink-0" />
                       Your safety is our priority. SOS alerts bypass server queues to instantly ping local authorities and your emergency contact.
                     </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trusted Contact Name</label>
                    <div className="relative mt-2">
                      <User className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={emergency.contactName} onChange={(e) => setEmergency({...emergency, contactName: e.target.value})} placeholder="e.g. Papa, Brother" className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-sm placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trusted Phone Number</label>
                    <div className="relative mt-2">
                      <Smartphone className="absolute left-4 top-3.5 size-4 text-slate-400" />
                      <input type="text" value={emergency.contactPhone} onChange={(e) => setEmergency({...emergency, contactPhone: e.target.value})} placeholder="+91" className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-11 pr-4 text-sm font-medium outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-sm placeholder:text-slate-400" />
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isSaving || !emergency.contactName || !emergency.contactPhone} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-rose-500 text-white px-6 py-3.5 text-sm font-black transition hover:bg-rose-600 disabled:opacity-50 shadow-lg shadow-rose-500/20">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <HeartHandshake className="size-4" />} Save Contact Securely
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/30 animate-in slide-in-from-bottom-5">
          <Check className="size-4 text-emerald-400" />{notice}
          <button onClick={() => setNotice('')}><X className="size-4 opacity-60" /></button>
        </div>
      )}
    </main>
  );
}