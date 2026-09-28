import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Car, ShieldCheck, Zap, Route, MapPin, Sparkles } from 'lucide-react';
import ThreeDImagePageflip from '../components/ThreeDImagePageflip';
import GrainCursor from '../components/GrainCursor';
import TextParticleAnimation from '../components/TextParticleAnimation';
import LiquidGlassButton from '../components/LiquidGlassButton';
import LiquidGlassCard from '../components/LiquidGlassCard';
import MagneticGallery from '../components/MagneticGallery';
import BentoGrid from '../components/BentoGrid';
import { ThreeDScrollTriggerContainer, ThreeDScrollTriggerRow } from '../components/ThreeDScrollTrigger';
import ScrollTextReveal from '../components/ScrollTextReveal';

function Logo() {
    return (
        <div className="flex items-center gap-3 relative z-10">
            <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
            <div>
                <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Rahi</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Move with the mountains</p>
            </div>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-orange-50 text-slate-900 relative overflow-hidden selection:bg-primary/20">

            {/* --- BREATHTAKING BACKGROUND --- */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <img
                    src="https://images.unsplash.com/photo-1626014903706-d98c257ed603?q=80&w=2070&auto=format&fit=crop"
                    alt="Himalayas"
                    className="w-full h-[80vh] object-cover opacity-40 mix-blend-multiply mask-image-gradient"
                    style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
                />
            </div>

            {/* --- AMBIENT GLOWS (Modern UI Vibe) --- */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0 transform-gpu" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-400/20 blur-[120px] rounded-full pointer-events-none z-0 transform-gpu" />

            {/* --- GLASS NAVBAR --- */}
            <header className="border-b border-white/60 bg-white/40 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm transition-all">
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
                    <Logo />

                    <div className="flex items-center gap-4 relative z-10">
                        <Link
                            to="/login"
                            className="hidden sm:flex items-center text-sm font-bold text-slate-600 hover:text-primary transition-colors px-4 py-2"
                        >
                            Sign In
                        </Link>
                        {/* Shiny Button Effect */}
                        <Link
                            to="/login"
                            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-black text-white transition-all hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-primary/30 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-orange-50"
                        >
                            <span className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out" />
                            Register <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <div className="relative w-full">
                <GrainCursor color="#f97316" radius={0.06} grainSize={5.0} />
                <div className="relative z-10 mx-auto max-w-7xl px-5 pt-36 pb-20 sm:px-8 lg:px-10 lg:pt-48 flex flex-col items-center text-center">
                    {/* Animated Badge */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    <LiquidGlassButton variant="glass" size="sm" className="pointer-events-none text-orange-500">
                        <Sparkles className="size-3.5 text-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">The First AI Mobility Engine for Uttarakhand</span>
                    </LiquidGlassButton>
                </div>

                {/* Headline */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out z-20 relative -mt-10">
                    <TextParticleAnimation fontSize={100} pixelSize={4.5} resolution={5} hoverRadius={120} />
                </div>

                {/* Subheadline */}
                <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 ease-out mt-6 max-w-2xl text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">
                    Experience AI-powered rides, dynamic weather telemetry, and shared Rahi-Pools tailored exclusively for the Himalayan terrain. Built for tourists, powered by locals.
                </p>

                {/* CTA Buttons */}
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 ease-out mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 text-base font-black text-white transition-all hover:bg-primary/90 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95"
                    >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        Book a Ride <MapPin className="size-5 group-hover:animate-bounce" />
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white/60 backdrop-blur-xl px-8 py-4 text-base font-black text-slate-700 transition-all hover:border-primary/50 hover:bg-white hover:text-primary shadow-sm hover:shadow-xl"
                    >
                        Partner as Driver <Car className="size-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
            </div>

            {/* --- 3D PAGE FLIP GALLERY --- */}
            <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
                <ThreeDImagePageflip />
            </div>

            {/* --- MAGNETIC GALLERY --- */}
            <MagneticGallery />

            {/* --- CORE FEATURES BENTO GRID --- */}
            <BentoGrid />

            {/* --- THREE D SCROLL TRIGGER ROWS --- */}
            <div className="relative z-20 pt-16 pb-32 bg-slate-900 overflow-hidden rounded-t-[3rem] mt-12">
                <ThreeDScrollTriggerContainer>
                    <ThreeDScrollTriggerRow baseVelocity={3} direction={1} className="mb-8">
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="w-[300px] h-[200px] mx-4 rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-white/10">
                                <img src={`/${i + 1}.jpg`} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                            </div>
                        ))}
                    </ThreeDScrollTriggerRow>
                    <ThreeDScrollTriggerRow baseVelocity={3.5} direction={-1}>
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className="w-[400px] h-[250px] mx-4 rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-white/10">
                                <img src={`/images/${i + 1}.jpg`} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                            </div>
                        ))}
                    </ThreeDScrollTriggerRow>
                </ThreeDScrollTriggerContainer>
            </div>

            {/* --- SCROLL TEXT REVEAL & GALLERY --- */}
            <ScrollTextReveal />

            {/* --- FLOATING FEATURE CARDS (Lightswind Aesthetic) --- */}
            <div className="relative z-10 mx-auto max-w-7xl px-5 pb-32 sm:px-8 lg:px-10">
                <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 ease-out">

                    <LiquidGlassCard>
                        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <ShieldCheck className="size-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-black text-slate-900">Terrain Intelligence</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            Real-time SDRF landslide alerts, hairpin bend tracking, and dual-climate weather radar for maximum passenger safety.
                        </p>
                    </LiquidGlassCard>

                    <LiquidGlassCard>
                        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Zap className="size-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-black text-slate-900">Rahi-Pool Network</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            Decentralized ride-sharing. Verified local drivers broadcast empty seats to reduce costs and carbon footprints.
                        </p>
                    </LiquidGlassCard>

                    <LiquidGlassCard>
                        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Car className="size-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-black text-slate-900">Zero-Commission</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            A transparent SaaS model. Drivers keep 100% of their earnings via a simple, affordable daily active pass.
                        </p>
                    </LiquidGlassCard>

                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer className="relative z-10 border-t border-slate-200/50 bg-white/40 backdrop-blur-md pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start">
                        <Logo />
                        <p className="mt-4 text-sm font-medium text-slate-500 max-w-sm text-center md:text-left">
                            Built for the Himalayas. Engineered for safety, sustainability, and zero-commission rides.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-slate-600">
                        <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
                        <Link to="/login" className="hover:text-primary transition-colors">Partner as Driver</Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    </div>
                </div>
                <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 mt-12 pt-8 border-t border-slate-200/50 text-center text-xs font-semibold text-slate-400">
                    &copy; {new Date().getFullYear()} Rahi Mobility. All rights reserved. Move with the Mountains.
                </div>
            </footer>
        </main>
    );
}
