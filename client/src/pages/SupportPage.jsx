import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, HelpCircle, Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function SupportPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('CUSTOMER');
  const [name, setName] = useState('');
  
  const [activeTab, setActiveTab] = useState('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user) {
          setRole(data.user.role);
          setName(data.user.name);
        }
      } catch (err) {}
    };
    fetchUser();
  }, [navigate]);

  const dashboardLink = role === 'DRIVER' ? '/driver' : '/customer';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const tabs = [
    { id: 'contact', label: 'Contact Us', icon: MessageSquare },
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-orange-500/20">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(dashboardLink)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Help & Support</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">We're here for you</p>
            </div>
          </div>
          
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to={dashboardLink} className="hover:text-orange-500 transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-4 mb-4 border-b border-slate-100">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-50 text-orange-500 font-black text-lg border border-orange-100">
                {name ? name.substring(0,2).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate">Hi, {name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">How can we help?</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1.5">
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

            <div className="mt-8 p-4 rounded-xl border border-orange-100 bg-orange-50/50">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Emergency</p>
                <p className="text-sm font-bold text-slate-900">SDRF Helpdesk: <span className="text-orange-500">1070</span></p>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm min-h-[500px]">
            
            {/* 1. CONTACT TAB */}
            {activeTab === 'contact' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Send us a message</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Our support team will get back to you within 24 hours.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {submitted && (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700">
                                <CheckCircle2 className="size-5" />
                                <span className="text-sm font-bold">Message sent successfully! We'll be in touch.</span>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
                            <select 
                                required
                                value={formData.subject}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 px-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                            >
                                <option value="" disabled>Select a topic</option>
                                <option value="ride">Issue with a Ride</option>
                                <option value="payment">Billing / Payment</option>
                                <option value="account">Account Settings</option>
                                <option value="app">App Bug / Feedback</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</label>
                            <textarea 
                                required
                                rows={5}
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                placeholder="Describe your issue in detail..."
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 p-4 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                            ></textarea>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-white px-6 py-3.5 text-sm font-black transition hover:bg-orange-600 shadow-lg shadow-orange-500/20 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send Message
                        </button>
                    </form>

                    <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-10">
                        <h3 className="text-lg font-black text-slate-900">Get in touch directly</h3>
                        
                        <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <Phone className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">+91 1800-RAHI-HELP</p>
                                <p className="text-xs text-slate-500 mt-0.5">Mon-Fri, 9AM to 6PM</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <Mail className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">support@rahi.dev</p>
                                <p className="text-xs text-slate-500 mt-0.5">Email us anytime</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                                <MapPin className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Rahi HQ</p>
                                <p className="text-xs text-slate-500 mt-0.5">Dehradun, Uttarakhand, India</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* 2. FAQs TAB */}
            {activeTab === 'faq' && (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Quick answers to common questions.</p>
                </div>

                <div className="space-y-4">
                    {[
                        { q: 'How do Rahi-Pools work?', a: 'Rahi-Pools allow verified local drivers to broadcast empty seats for long-distance trips. Customers can book individual seats, making travel much more affordable and sustainable.'},
                        { q: 'What is the Zero-Commission model?', a: 'Unlike other apps, we do not take a percentage of driver earnings. Drivers purchase an affordable daily/weekly Active Pass and keep 100% of their ride fares.'},
                        { q: 'Are SDRF alerts real-time?', a: 'Yes. Rahi integrates directly with SDRF and local meteorological APIs to provide real-time landslide warnings and weather conditions along your route.'},
                        { q: 'How do I become a driver?', a: 'Sign up using a Driver account. You will need to upload your RC, Aadhar, and Driving License. Once our team verifies your documents, you can start purchasing Active Passes.'}
                    ].map((faq, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
                            <p className="font-bold text-slate-900 mb-2 flex gap-3"><HelpCircle className="size-5 text-orange-500 shrink-0" /> {faq.q}</p>
                            <p className="text-sm font-medium text-slate-600 pl-8 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
