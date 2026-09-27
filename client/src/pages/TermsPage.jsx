import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    const navigate = useNavigate();
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-orange-500/20">
            <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
                            <ArrowLeft className="size-5" />
                        </button>
                        <div>
                            <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Terms of Service</p>
                        </div>
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-3xl px-5 py-12">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Terms of Service</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Last updated: October 2026</p>
                    
                    <div className="space-y-8 text-slate-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Agreement to Terms</h2>
                            <p>By accessing or using Rahi Mobility, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
                            <p>Rahi provides a decentralized ride-sharing platform connecting drivers and passengers. We do not employ drivers; we provide the technology platform to facilitate connections.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Responsibilities</h2>
                            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Zero-Commission Model</h2>
                            <p>Drivers using our platform retain 100% of their ride fares. Access to the driver platform is maintained through an Active Pass subscription. Rahi holds no liability for transactions that occur outside of our platform.</p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
