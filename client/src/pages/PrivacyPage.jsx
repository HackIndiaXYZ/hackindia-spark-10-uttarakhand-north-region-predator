import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
                            <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Privacy Policy</p>
                        </div>
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-3xl px-5 py-12">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">Last updated: October 2026</p>
                    
                    <div className="space-y-8 text-slate-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Location Information</h2>
                            <p>When you use the services for transportation, we collect precise location data about the trip from the Rahi app used by the Driver in order to enhance passenger safety and provide accurate ETA tracking.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Information</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, including to facilitate payments, send receipts, and provide real-time SDRF safety alerts in disaster-prone areas.</p>
                        </section>
                        
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Information Sharing</h2>
                            <p>We may share the information we collect with vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf.</p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
