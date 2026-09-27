import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import RouteIntelWidget from '../components/RouteIntelWidget';
import {
  CalendarDays, Check, Clock3, Compass, MapPin, Menu,
  Minus, Navigation, Plus, Route, Sparkles, X, Loader2,
  Zap, MessageSquare, ArrowRight, Luggage, Car
} from 'lucide-react';

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

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block space-y-2 relative z-10">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <div className="relative flex items-center group">
        <Icon className="pointer-events-none absolute left-4 size-[18px] text-slate-400 group-focus-within:text-primary transition-colors" strokeWidth={2.2} />
        {children}
      </div>
    </label>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(false);
  const [rideType, setRideType] = useState('private');
  const [notice, setNotice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [myRides, setMyRides] = useState([]);

  const [packagePrice, setPackagePrice] = useState(null);
  const [isPackageMode, setIsPackageMode] = useState(false);
  const [userProfile, setUserProfile] = useState({ id: null, name: 'Loading...', email: '' });

  useEffect(() => {
    if (location.state && location.state.selectedPackage) {
      const pkg = location.state.selectedPackage;
      const routeParts = pkg.route ? pkg.route.split('-') : [];
      const startLocation = routeParts[0] ? routeParts[0].trim() : pkg.route;
      const endLocation = routeParts.length > 1 ? routeParts[routeParts.length - 1].trim() : pkg.title;

      setPickup(startLocation);
      setDestination(`${endLocation} (${pkg.title})`);
      setIsPackageMode(true);
      setRideType('PACKAGE');
      setPackagePrice(pkg.price);

      navigate(location.pathname, { replace: true, state: {} });
      if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setNotice(`Package selected! Pick a date & time to confirm.`);
      setTimeout(() => setNotice(''), 3500);
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user) setUserProfile(data.user);
      } catch (err) { }
    };
    fetchProfile();
  }, [navigate]);

  const fetchMyRides = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings/my', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const result = await response.json();
        setMyRides(Array.isArray(result) ? result : (result?.data || result?.bookings || []));
      }
    } catch (error) { }
  };

  useEffect(() => {
    fetchMyRides();
    const interval = setInterval(fetchMyRides, 5000);
    return () => clearInterval(interval);
  }, []);

  async function autoFill() {
    if (!prompt) return;
    setIsAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/parse-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: prompt })
      });
      const result = await response.json();
      if (response.ok) {
        setPickup(result.data.pickup || '');
        setDestination(result.data.destination || '');
        setDate(result.data.date || '');
        setTime(result.data.time || '');
        setPassengers(result.data.passengers || 1);
        setLuggage(result.data.luggage || false);
        setPackagePrice(null);
        setIsPackageMode(false);
        setNotice('Trip details filled by AI!');
      }
    } catch (error) { }
    finally { setIsAiLoading(false); setTimeout(() => setNotice(''), 2800); }
  }

  async function submitBooking(event) {
    event.preventDefault()
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          pickup, destination, date, time, passengers,
          bookingType: rideType.toUpperCase(),
          paymentMethod: 'UPI',
          price: packagePrice || null
        })
      });

      if (response.ok) {
        setNotice('Booking Confirmed Successfully!');
        fetchMyRides();
        setPrompt(''); setPickup(''); setDestination(''); setDate(''); setTime('');
        setPackagePrice(null);
        setIsPackageMode(false);
      } else { setNotice('Booking failed'); }
    } catch (error) { setNotice('Network error during booking'); }
    setTimeout(() => setNotice(''), 2800);
  }

  const activeRide = myRides.find(r => ['CONFIRMED', 'DRIVER ARRIVING', 'TRIP STARTED'].includes((r.status || '').toUpperCase()));

  return (
    <main className="min-h-screen bg-orange-50 text-slate-900 relative overflow-x-hidden">

      {/* BEAUTIFUL MOUNTAIN HERO IMAGE & ORANGE FADE */}
      <div className="absolute top-0 left-0 w-full h-[600px] z-0 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1626014903706-d98c257ed603?q=80&w=2070&auto=format&fit=crop" alt="Himalayas" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/80 to-orange-50" />
      </div>

      {/* AMBIENT ORANGE GLOWS */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/20 blur-[120px] rounded-full pointer-events-none z-0" />

      <header className="border-b border-white/60 bg-white/40 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to="/customer" className="text-primary drop-shadow-sm">Book a ride</Link>
            <Link to="/customer/pools" className="hover:text-primary transition-colors">Rahi-Pool</Link>
            <Link to="/customer/packages" className="hover:text-primary transition-colors">Tour Packages</Link>
            <Link to="/customer/rides" className="hover:text-primary transition-colors">My rides</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          </nav>
          <div className="flex items-center gap-3 relative z-10">
            <button onClick={() => navigate('/customer/settings')} className="flex size-10 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-primary transition-all font-black text-xs uppercase shadow-md hover:shadow-lg">
              {userProfile.name !== 'Loading...' ? userProfile.name.substring(0, 2) : '..'}
            </button>
            <button className="rounded-lg p-2 text-slate-600 md:hidden hover:bg-slate-100 hover:text-slate-900 transition-colors"><Menu className="size-5" /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-16 pt-9 sm:px-8 lg:px-10 lg:pt-12 relative z-10">

        {/* Animated Car on Road above Telemetry */}
        <div className="relative mt-4 mb-6">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes dashDrive {
              0% { left: -60px; opacity: 0; }
              5% { opacity: 1; }
              95% { opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }
            .dash-road {
              position: absolute;
              top: -14px;
              left: 0;
              width: 100%;
              height: 2px;
              background: repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 15px, transparent 15px, transparent 30px);
              z-index: 5;
            }
            .dash-car-container {
              position: absolute;
              top: -27px;
              left: 0;
              width: 100%;
              height: 30px;
              overflow: hidden;
              z-index: 10;
              pointer-events: none;
            }
            .dash-car-inner {
              position: absolute;
              animation: dashDrive 7s linear infinite;
              display: flex;
              align-items: center;
              gap: 4px;
              top: 0;
            }
          `}} />
          <div className="dash-road" />
          <div className="dash-car-container">
            <div className="dash-car-inner">
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-1.5 bg-orange-300 rounded-full opacity-50"></div>
                <div className="h-0.5 w-3 bg-orange-400 rounded-full opacity-80"></div>
              </div>
              <Car className="size-6 text-orange-500 fill-orange-400" />
            </div>
          </div>
          
          <RouteIntelWidget pickup={activeRide?.pickup || ''} destination={activeRide?.destination || ''} role="CUSTOMER" />
        </div>

        <section className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-black text-orange-500 uppercase tracking-wider"><span className="size-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
            <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl drop-shadow-sm">Where are you headed <span className="text-orange-500" style={{ fontFamily: "'Inter', sans-serif" }}>today?</span></h1>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-start">
          <div id="book" className="space-y-6">

            {/* AI BOOKING CARD - MODERN LIGHT THEME */}
            <section className="relative p-[1px] rounded-[24px] bg-gradient-to-b from-primary/30 to-transparent overflow-hidden shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />
              <div className="relative bg-white/80 backdrop-blur-2xl rounded-[23px] p-6 sm:p-8">
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Sparkles className="size-4 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.14em]">AI Booking Engine</span>
                </div>
                <h2 className="font-display text-2xl font-black tracking-tight text-slate-900">Let AI handle the details</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Type normally in Hindi or English. We'll extract your route, time, and passengers.</p>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-5 min-h-[100px] w-full resize-none rounded-xl border border-slate-200 bg-white/60 text-slate-900 placeholder-slate-400 p-4 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                  placeholder='e.g., "Mujhe kal subah 8 baje Haldwani se Nainital jana hai, 4 log hain"'
                />
                <button
                  type="button"
                  onClick={autoFill}
                  disabled={isAiLoading || !prompt}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-3.5 text-sm font-black transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {isAiLoading ? 'Analyzing Intent...' : 'Magic Auto-Fill'}
                </button>
              </div>
            </section>

            {/* MANUAL BOOKING FORM - LIGHT THEME */}
            <form ref={formRef} onSubmit={submitBooking} className="rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Step 2 of 2</p>
                  <h2 className="mt-1 font-display text-xl font-black tracking-tight text-slate-900">Fine-tune your ride</h2>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Pickup location" icon={MapPin}><input value={pickup} onChange={(e) => setPickup(e.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-white/60 backdrop-blur-md text-slate-900 pl-11 pr-4 text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 shadow-sm" placeholder="e.g. Haldwani" /></Field>
                <Field label="Destination" icon={MapPin}><input value={destination} onChange={(e) => setDestination(e.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-white/60 backdrop-blur-md text-slate-900 pl-11 pr-4 text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400 shadow-sm" placeholder="e.g. Nainital" /></Field>
                <Field label="Date" icon={CalendarDays}><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-white/60 backdrop-blur-md text-slate-900 pl-11 pr-4 text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" /></Field>
                <Field label="Time" icon={Clock3}><input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-white/60 backdrop-blur-md text-slate-900 pl-11 pr-4 text-sm font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" /></Field>
              </div>

              {isPackageMode && (
                <div className="col-span-full mt-6 mb-2 relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm">
                  <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-emerald-100/50 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Compass className="size-4" />
                        <p className="text-[10px] font-black uppercase tracking-wider">Tour Package Selected</p>
                      </div>
                      <p className="text-sm font-bold text-slate-600">Fixed-price curated itinerary</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600">₹{packagePrice}</p>
                      <button type="button" onClick={() => { setIsPackageMode(false); setRideType('private'); setPackagePrice(null); setPickup(''); setDestination(''); }} className="text-[10px] uppercase font-bold text-slate-400 hover:text-rose-500 transition-colors mt-1 underline underline-offset-2">Cancel Package</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Passengers</p>
                  <p className="mt-1 text-sm font-medium text-slate-400">How many are travelling?</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-2 py-1.5 shadow-sm">
                  <button type="button" onClick={() => setPassengers(Math.max(1, passengers - 1))} className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><Minus className="size-4" /></button>
                  <span className="w-5 text-center text-sm font-bold text-slate-900">{passengers}</span>
                  <button type="button" onClick={() => setPassengers(Math.min(8, passengers + 1))} className="flex size-8 items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 shadow-md"><Plus className="size-4" /></button>
                </div>
              </div>

              <button type="button" onClick={() => setLuggage(!luggage)} className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white/60 p-4 text-left hover:border-primary/40 transition-colors shadow-sm">
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Luggage className="size-4 text-primary" /></span>
                  <span><span className="block text-sm font-bold text-slate-900">I have luggage</span><span className="block text-xs font-medium text-slate-500">We'll make sure there's room.</span></span>
                </span>
                <span className={`flex size-5 items-center justify-center rounded-md border transition-colors ${luggage ? 'border-primary bg-primary text-white' : 'border-slate-300'}`}>{luggage && <Check className="size-3.5" strokeWidth={3} />}</span>
              </button>

              {!isPackageMode && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Ride type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['private', 'shared']).map((type) => (
                      <button type="button" key={type} onClick={() => setRideType(type)} className={`rounded-xl border p-4 text-left transition-all shadow-sm ${rideType === type ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]' : 'border-slate-200 bg-white/60 hover:border-slate-300'}`}>
                        <span className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{type === 'private' ? 'Private Ride' : 'Shared Ride'}</span>
                          <span className={`size-4 rounded-full border-4 transition-colors ${rideType === type ? 'border-primary' : 'border-slate-200'}`} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-4 text-sm font-black transition hover:bg-slate-800 shadow-xl shadow-slate-900/20">
                Confirm Booking {packagePrice ? `(₹${packagePrice})` : ''} <Navigation className="size-4" fill="currentColor" />
              </button>
            </form>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">

            {activeRide && (
              <div className="rounded-[24px] border border-primary/20 bg-white p-6 relative overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span className="relative flex size-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-3 bg-primary"></span>
                    </span>
                    Active Trip
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">ID: {activeRide.id}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight">{activeRide.pickup} <ArrowRight className="inline size-4 mx-1 text-slate-400" /> {activeRide.destination}</h3>
                <p className="text-sm text-primary mb-6 font-bold uppercase tracking-wider">{activeRide.status}</p>

                {(activeRide.booking_type === 'PRIVATE' || activeRide.bookingType === 'PRIVATE') && (
                  <button
                    onClick={() => navigate('/messages', { state: { bookingId: activeRide.id, partnerId: activeRide.driver_id, partnerName: activeRide.driver_name || 'Driver' } })}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    <MessageSquare className="size-4" /> Secure Message Driver
                  </button>
                )}
              </div>
            )}

            {/* PAHADI POOL WIDGET - LIGHT */}
            <div className="rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-2xl p-6 relative overflow-hidden group shadow-xl shadow-slate-200/50 transition-colors hover:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <Zap className="size-8 text-primary mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">Rahi-Pool Network</h3>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">Join verified local drivers heading your way. Share the ride, save money, and reduce your carbon footprint.</p>
              <Link to="/customer/pools" className="inline-flex w-full items-center justify-center gap-2 bg-slate-900 text-white font-bold text-sm px-5 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 relative z-10">
                View Live Pools <Navigation className="size-4 rotate-90" />
              </Link>
            </div>

            {/* CURATED TOURISM - LIGHT */}
            <div className="rounded-[24px] border border-white/80 bg-white/60 backdrop-blur-2xl p-6 relative overflow-hidden group shadow-xl shadow-slate-200/50 transition-colors hover:border-emerald-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <Compass className="size-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">Curated Tourism</h3>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">Explore the hidden gems of Uttarakhand with fixed-price, guided tours hosted by local experts.</p>
              <Link to="/customer/packages" className="inline-flex w-full items-center justify-center gap-2 bg-emerald-500 text-white font-bold text-sm px-5 py-3.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 relative z-10">
                Explore Packages <Navigation className="size-4 rotate-90" />
              </Link>
            </div>

          </aside>
        </div>
      </div>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/30 animate-in slide-in-from-bottom-5"><Check className="size-4 text-emerald-400" />{notice}<button onClick={() => setNotice('')}><X className="size-4 opacity-60 hover:opacity-100" /></button></div>}
    </main>
  );
}