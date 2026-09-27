import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RouteIntelWidget from '../components/RouteIntelWidget';
import {
  CalendarDays, Car, Check, Clock, Clock3, MapPin, Menu,
  Minus, Navigation, Plus, ShieldCheck, Star, Users, X,
  Award, Power, Pencil, CreditCard, Zap, MessageSquare,
  Compass, Sparkles, Loader2, AlertTriangle, ArrowRight
} from 'lucide-react';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const carIcon = new L.DivIcon({
  html: `<div style="background-color: #f97316; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 20px rgba(249,115,22,0.5); border: 2px solid white;">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
             <circle cx="7" cy="17" r="2"/>
             <path d="M9 17h6"/>
             <circle cx="17" cy="17" r="2"/>
           </svg>
         </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng, map]);
  return null;
}

function Logo() {
  return (
    <div className="flex items-center gap-3 relative z-10">
      <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
      <div>
        <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Rahi</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Driver Portal</p>
      </div>
    </div>
  );
}

const statuses = ['DRIVER ARRIVING', 'TRIP STARTED', 'COMPLETED'];

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [notice, setNotice] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState({ rides: 0, earnings: 0 });

  const [driverProfile, setDriverProfile] = useState({
    id: null, name: 'Loading...', email: '', phone: '', vehicle_model: '', vehicle_number: '', daily_goal: 2000, verification_status: 'PENDING', aadhaar_number: null, is_subscribed: false
  });

  const [showSubModal, setShowSubModal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(driverProfile.daily_goal);
  const [driverLocation, setDriverLocation] = useState([29.2183, 79.5130]);
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [activePool, setActivePool] = useState(null);
  const [poolForm, setPoolForm] = useState({ boardingPoint: '', destination: '', departTime: '', seats: 6, price: 300 });
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourForm, setTourForm] = useState({ title: '', duration: '', price: '', route: '', description: '' });
  const [isTourAiLoading, setIsTourAiLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user) {
          setDriverProfile({
            ...data.user,
            vehicle_model: data.user.vehicle_model || '',
            vehicle_number: data.user.vehicle_number || '',
            is_subscribed: data.user.is_subscribed || false
          });
          setTempGoal(data.user.daily_goal || 2000);
        }
      } catch (err) { }
    };
    fetchProfile();
  }, [navigate]);

  const checkMyActivePool = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/pools/my-active', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setActivePool(data.pool);
      }
    } catch (e) { }
  };

  useEffect(() => {
    checkMyActivePool();
    const interval = setInterval(checkMyActivePool, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setDriverLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn("GPS Error: ", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const submitPoolBroadcast = async (e) => {
    e.preventDefault();
    if (!driverProfile.is_subscribed) { setShowSubModal(true); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          boardingPoint: poolForm.boardingPoint, destination: poolForm.destination,
          departTime: poolForm.departTime, price: poolForm.price, seats: poolForm.seats
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActivePool(data.pool);
        setShowPoolModal(false);
        setNotice("Rahi-Pool Broadcast Live!");
      } else { setNotice(data.message || "Failed to start broadcast"); }
    } catch (err) { setNotice("Network error starting pool"); }
    setTimeout(() => setNotice(''), 3000);
  };

  const generateTourDetails = async () => {
    if (!tourForm.title && !tourForm.description) {
      setNotice("Type a location or description first!");
      setTimeout(() => setNotice(''), 2800);
      return;
    }
    setIsTourAiLoading(true);
    setNotice("AI is crafting your package...");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/ai/generate-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: tourForm.title, duration: tourForm.duration, description: tourForm.description })
      });
      const data = await res.json();
      if (res.ok) {
        setTourForm({
          ...tourForm,
          title: data.title || tourForm.title,
          route: data.route || tourForm.route,
          duration: data.duration || tourForm.duration,
          price: data.price || tourForm.price,
          description: data.description || tourForm.description
        });
        setNotice("AI successfully crafted your package!");
      } else { setNotice("AI failed to generate details."); }
    } catch (e) { setNotice("Network error connecting to AI."); }
    setIsTourAiLoading(false);
    setTimeout(() => setNotice(''), 2800);
  };

  const submitTourPackage = async (e) => {
    e.preventDefault();
    if (!driverProfile.is_subscribed) { setShowSubModal(true); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(tourForm)
      });
      if (res.ok) {
        setShowTourModal(false);
        setNotice("Tour Package Live on Platform!");
        setTourForm({ title: '', duration: '', price: '', route: '', description: '' });
      } else { setNotice("Failed to publish tour"); }
    } catch (err) { setNotice("Network error publishing tour"); }
    setTimeout(() => setNotice(''), 3000);
  };

  const endBroadcast = async () => {
    if (!activePool) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/pools/${activePool.id}/end`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setActivePool(null);
      setNotice("Broadcast ended");
    } catch (err) { }
    setTimeout(() => setNotice(''), 3000);
  };

  const saveDriverSettings = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        setDriverProfile(prev => ({ ...prev, ...updates }));
      }
    } catch (error) { }
  };

  const saveGoal = () => {
    if (tempGoal > 0) saveDriverSettings({ daily_goal: tempGoal });
    setIsEditingGoal(false);
  };

  const purchaseSubscription = async (planName) => {
    setIsUpdating(true);
    setNotice("Processing secure payment...");
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/auth/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ is_subscribed: true })
        });
        setDriverProfile(prev => ({ ...prev, is_subscribed: true }));
        setShowSubModal(false);
        setNotice(`Success! ${planName} activated.`);
      } catch (err) {
        setDriverProfile(prev => ({ ...prev, is_subscribed: true }));
        setShowSubModal(false);
        setNotice(`Success! ${planName} activated.`);
      }
      setIsUpdating(false);
      setTimeout(() => setNotice(''), 3500);
    }, 1500);
  };

  const fetchRequests = async () => {
    if (driverProfile.verification_status !== 'APPROVED') return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');
      const response = await fetch('http://localhost:5000/api/bookings/driver-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        let safeArray = [];
        if (Array.isArray(result)) safeArray = result;
        else if (result && Array.isArray(result.data)) safeArray = result.data;
        else if (result && Array.isArray(result.bookings)) safeArray = result.bookings;

        const pendingRides = safeArray.filter(r => (r?.status || '').toUpperCase() === 'PENDING');
        setRequests(pendingRides);

        const ongoing = safeArray.find(r =>
          ['CONFIRMED', 'DRIVER ARRIVING', 'TRIP STARTED'].includes((r?.status || '').toUpperCase())
        );
        setActiveRide(ongoing || null);

        const completedRides = safeArray.filter(r => (r?.status || '').toUpperCase() === 'COMPLETED');
        const totalEarnings = completedRides.reduce((sum, r) => sum + (r.price ? Number(r.price) : ((r.passengers || 1) * 250)), 0);
        setStats({ rides: completedRides.length, earnings: totalEarnings });
      }
    } catch (error) { }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [driverProfile.verification_status]);

  const handleRideAction = async (id, statusAction) => {
    if (statusAction === 'CONFIRMED' && !driverProfile.is_subscribed) {
      setShowSubModal(true);
      return;
    }
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: statusAction })
      });
      if (response.ok) {
        setNotice(`Ride ${statusAction === 'CONFIRMED' ? 'accepted' : 'rejected'}!`);
        fetchRequests();
      }
    } catch (error) { setNotice('Network error.'); }
    setIsUpdating(false);
    setTimeout(() => setNotice(''), 2800);
  };

  const handleActiveStatusUpdate = async (newStatus) => {
    if (!activeRide) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${activeRide.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setNotice(`Status updated to ${newStatus}`);
        fetchRequests();
      }
    } catch (error) { }
    setIsUpdating(false);
    setTimeout(() => setNotice(''), 2800);
  };

  const goalProgress = driverProfile.daily_goal > 0 ? Math.min(Math.round((stats.earnings / driverProfile.daily_goal) * 100), 100) : 100;

  return (
    <main className="min-h-screen bg-orange-50 text-slate-900 relative overflow-x-hidden pb-20">

      {/* AMBIENT ORANGE GLOWS */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/15 blur-[120px] rounded-full pointer-events-none z-0" />

      <header className="border-b border-white/60 bg-white/40 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to="/driver" className="text-primary drop-shadow-sm">Dashboard</Link>
            <Link to="/driver/packages" className="hover:text-primary transition-colors">My Packages</Link>
            <Link to="/driver/history" className="hover:text-primary transition-colors">Ride History</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          </nav>

          <div className="flex items-center gap-4 relative z-10">
            {driverProfile.verification_status === 'APPROVED' && (
              <>
                <button
                  onClick={() => !driverProfile.is_subscribed && setShowSubModal(true)}
                  className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border shadow-sm transition-colors ${driverProfile.is_subscribed ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-rose-50 text-rose-600 border-rose-200 cursor-pointer hover:bg-rose-100'}`}
                >
                  <Zap className="size-3.5" />
                  {driverProfile.is_subscribed ? 'PASS ACTIVE' : 'NO ACTIVE PASS'}
                </button>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-sm transition-colors ${isOnline ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/30 hover:bg-emerald-600' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                >
                  <Power className="size-3.5" />
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
              </>
            )}
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <button
                onClick={() => navigate('/driver/settings')}
                className="flex size-10 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-primary transition-all font-black text-xs uppercase shadow-md hover:shadow-lg"
              >
                {driverProfile.name !== 'Loading...' ? driverProfile.name.substring(0, 2) : '..'}
              </button>
            </div>
            <button className="rounded-lg p-2 text-slate-600 sm:hidden hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12 relative z-10">

        {/* KYC BLOCK FOR UNAPPROVED DRIVERS */}
        {driverProfile.verification_status !== 'APPROVED' ? (
          <div className="max-w-xl mx-auto mt-10">
            <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-xl text-center relative overflow-hidden">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-6 shadow-sm relative z-10 border border-amber-100">
                <AlertTriangle className="size-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2 relative z-10">Verification Pending</h2>

              {driverProfile.aadhaar_number ? (
                <>
                  <p className="text-slate-500 font-medium mb-8 relative z-10">Your documents are under review by an Administrator. Once approved, you will be able to accept rides.</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-sm font-bold border border-slate-200 text-slate-700 shadow-sm relative z-10">
                    <Clock className="size-4 animate-pulse text-amber-500" /> Awaiting Approval
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-500 font-medium mb-8 relative z-10 leading-relaxed">For passenger safety, all driver partners must upload a valid Aadhaar and Driving License before accepting bookings.</p>
                  <button
                    onClick={() => navigate('/driver/settings')}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 relative z-10"
                  >
                    Go to Settings to Verify <ArrowRight className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-black text-primary uppercase tracking-wider">
                  <span className={`size-2.5 rounded-full ${isOnline ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-slate-300'}`} />
                  {isOnline ? 'Live System Active' : 'You are currently offline'}
                </div>
                <h1 className="font-display text-balance text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Good morning, <span className="text-primary">{driverProfile.name.split(' ')[0]}</span></h1>
              </div>
              <div
                onClick={() => navigate('/driver/settings')}
                className="flex items-center gap-4 rounded-xl border border-white/60 bg-white/60 backdrop-blur-md px-5 py-3.5 shadow-md cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                  <Star className="size-4 fill-amber-400 text-amber-500" />
                  <span className="font-black text-slate-900 text-lg">4.9</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <Car className="size-4" /> {driverProfile.vehicle_number || 'Update Vehicle'}
                </div>
              </div>
            </section>

            {/* Animated Car on Road above Telemetry */}
            <div className="relative mt-10 mb-6">
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
              
              <RouteIntelWidget pickup={activeRide?.pickup || ''} destination={activeRide?.destination || ''} role="DRIVER" />
            </div>

            {/* BALANCED GRID LAYOUT */}
            <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">

              {/* LEFT COLUMN: Requests & Creation Widgets */}
              <section className="flex flex-col gap-8">

                {/* Incoming Requests Box */}
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Incoming Requests</h2>
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary shadow-sm">
                      {isOnline ? requests.length : 0} waiting
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {!isOnline ? (
                      <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-md p-12 text-center">
                        <Power className="mx-auto mb-4 size-10 text-slate-400" />
                        <p className="font-black text-slate-800 text-lg">You are offline</p>
                        <p className="mt-1 text-sm font-medium text-slate-500">Toggle your status to online to receive rides.</p>
                      </div>
                    ) : requests.length === 0 ? (
                      <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-md p-12 text-center">
                        <Check className="mx-auto mb-4 size-10 text-emerald-500" />
                        <p className="font-black text-slate-800 text-lg">You're all caught up</p>
                        <p className="mt-1 text-sm font-medium text-slate-500">Scanning for live requests from passengers...</p>
                      </div>
                    ) : (
                      requests.map((request) => (
                        <article key={request.id} className="rounded-[24px] border border-white/80 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/50 transition-colors hover:border-primary/40 group">
                          <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                              <span className="mb-2 inline-flex rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-600 uppercase tracking-wider shadow-sm">
                                {request?.booking_type || request?.bookingType || 'Private'} ride
                              </span>
                              <p className="text-2xl font-black text-slate-900 mt-1">{request?.price ? `₹${request.price}` : `₹${(request?.passengers || 1) * 250}`}</p>
                            </div>
                            <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-full shadow-sm">
                              <ShieldCheck className="size-5 text-primary" />
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex flex-col items-center pt-1.5">
                              <span className="size-3 rounded-full border-2 border-primary" />
                              <span className="my-1.5 h-10 w-px bg-slate-200" />
                              <span className="size-3 rounded-sm bg-primary" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-5">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pickup</p>
                                <p className="truncate text-sm font-black text-slate-800">{request?.pickup}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Destination</p>
                                <p className="truncate text-sm font-black text-slate-800">{request?.destination}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-lg justify-center shadow-sm"><CalendarDays className="size-3.5 text-primary" />{new Date(request?.date || Date.now()).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-lg justify-center shadow-sm"><Clock className="size-3.5 text-primary" />{request?.time || 'Now'}</div>
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 p-2 rounded-lg justify-center shadow-sm"><Users className="size-3.5 text-amber-600" />{request?.passengers || 1} pax</div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <button disabled={isUpdating || activeRide} onClick={() => handleRideAction(request.id, 'CONFIRMED')} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800 shadow-lg shadow-slate-900/20 disabled:opacity-50">
                              <Check className="size-4" /> {activeRide ? 'Finish trip first' : 'Accept Ride'}
                            </button>
                            <button disabled={isUpdating} onClick={() => handleRideAction(request.id, 'REJECTED')} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm disabled:opacity-50">
                              <X className="size-4" /> Reject
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                {/* Creation Widgets Side-by-Side */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* PAHADI POOL WIDGET */}
                  <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-6 shadow-lg shadow-primary/5 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full pointer-events-none" />
                    {!activePool ? (
                      <>
                        <div className="mb-5 relative z-10">
                          <div className="flex items-center gap-2 text-primary mb-1">
                            <Zap className="size-4" fill="currentColor" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Rahi-Pool Network</p>
                          </div>
                          <h2 className="text-xl font-black tracking-tight text-slate-900">Host a Shared Ride</h2>
                          <p className="text-sm text-slate-600 font-medium mt-1.5 leading-relaxed">Broadcast your empty seats to local passengers and maximize earnings.</p>
                        </div>
                        <button onClick={() => setShowPoolModal(true)} className="w-full mt-auto py-3.5 rounded-xl bg-primary text-white text-sm font-black shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors relative z-10">
                          Create New Broadcast
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-5 flex items-center justify-between relative z-10">
                          <div>
                            <div className="flex items-center gap-2 text-emerald-600 mb-1">
                              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                              <p className="text-[10px] font-black uppercase tracking-widest">Live Broadcast</p>
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900">Boarding Active</h2>
                          </div>
                          <button onClick={endBroadcast} className="text-xs font-black text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg shadow-md">End</button>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-sm relative z-10">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Route</p>
                              <p className="text-xs font-black text-slate-800 mt-0.5 truncate max-w-[100px]">{activePool.boarding_point} → {activePool.destination}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fare</p>
                              <p className="text-sm font-black text-primary">₹{activePool.price}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Clock3 className="size-3.5 text-slate-500" />
                              <p className="text-xs font-bold text-slate-700">{activePool.depart_time}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                              <Users className="size-3.5 text-amber-600" />
                              <p className="text-[10px] font-bold text-amber-600">{activePool.seats_booked}/{activePool.total_seats} Booked</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* TOUR PACKAGE WIDGET */}
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 shadow-lg shadow-emerald-500/5 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/50 rounded-bl-full pointer-events-none" />
                    <div className="mb-5 relative z-10">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Compass className="size-4" fill="currentColor" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Tour Packages</p>
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900">Host a Tour</h2>
                      <p className="text-sm font-medium text-slate-600 mt-1.5 leading-relaxed">Design private sightseeing packages using our AI trip planner.</p>
                    </div>
                    <button onClick={() => setShowTourModal(true)} className="w-full mt-auto py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-colors relative z-10">
                      Create Package
                    </button>
                  </div>
                </div>
              </section>

              {/* RIGHT COLUMN: GPS & Performance Tracker */}
              <aside className="flex flex-col gap-6 lg:sticky lg:top-28">

                {/* PERFORMANCE WIDGET */}
                <section className="rounded-[24px] border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary mb-5 relative z-10">
                    <Award className="size-4 text-primary" /> Performance Overview
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Earnings</p>
                      <p className="text-2xl font-black text-slate-900">₹{stats.earnings.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Rides</p>
                      <p className="text-2xl font-black text-slate-900">{stats.rides}</p>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>Daily Goal:</span>
                        {isEditingGoal ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-800">₹</span>
                            <input
                              type="number" autoFocus value={tempGoal} onChange={(e) => setTempGoal(Number(e.target.value))}
                              onBlur={saveGoal} onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                              className="w-16 bg-white border border-slate-300 rounded px-1.5 py-1 text-slate-900 outline-none focus:border-primary shadow-sm"
                            />
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-800 hover:text-primary cursor-pointer transition-colors" onClick={() => setIsEditingGoal(true)}>
                            ₹{driverProfile.daily_goal.toLocaleString()} <Pencil className="size-3 text-slate-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-primary font-black">{goalProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                      <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${goalProgress}%` }} />
                    </div>
                  </div>
                </section>

                {/* GPS COCKPIT - LIGHT MAP */}
                <section className="rounded-[24px] border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col z-0">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/60 relative z-10">
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <span className={`size-2 rounded-full ${activeRide ? 'bg-primary shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-slate-300'}`} />
                        {activeRide ? 'Active trip' : 'GPS Cockpit'}
                      </div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900">{activeRide ? `Trip #${activeRide.id}` : 'Tracking Location'}</h2>
                    </div>
                  </div>

                  <div className="h-64 w-full bg-slate-100 relative z-0 border-b border-slate-200">
                    <MapContainer center={driverLocation} zoom={16} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={driverLocation} icon={carIcon} />
                      <RecenterAutomatically lat={driverLocation[0]} lng={driverLocation[1]} />
                    </MapContainer>
                  </div>

                  <div className="p-6">
                    {activeRide ? (
                      <>
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-sm">
                          <div className="flex gap-3">
                            <MapPin className="mt-0.5 size-5 text-primary" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup</p>
                              <p className="mt-0.5 font-black text-slate-900">{activeRide.pickup}</p>
                            </div>
                          </div>
                          <div className="my-3 ml-2.5 h-6 border-l border-dashed border-slate-300" />
                          <div className="flex gap-3">
                            <Navigation className="mt-0.5 size-5 text-primary" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Drop-off</p>
                              <p className="mt-0.5 font-black text-slate-900">{activeRide.destination}</p>
                            </div>
                          </div>

                          {(activeRide.booking_type === 'PRIVATE' || activeRide.bookingType === 'PRIVATE') && activeRide.status !== 'TRIP STARTED' && (
                            <button
                              onClick={() => navigate('/messages', { state: { bookingId: activeRide.id, partnerId: activeRide.customer_id, partnerName: activeRide.customer_name || 'Passenger' } })}
                              className="mt-5 w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-black text-sm transition-colors hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="size-4" /> Secure Chat with Passenger
                            </button>
                          )}
                        </div>

                        <div className="mt-6">
                          <div className="mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trip Actions</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {statuses.map((status) => {
                              const isActive = activeRide.status === status;
                              return (
                                <button
                                  key={status} disabled={isUpdating} onClick={() => handleActiveStatusUpdate(status)}
                                  className={`flex h-12 items-center justify-between rounded-xl border px-5 text-left text-sm font-black transition-all ${isActive ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 shadow-sm'}`}
                                >
                                  <span>{status}</span>
                                  {isActive && <Check className="size-4" strokeWidth={3} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="relative flex size-3 items-center justify-center">
                            {isOnline && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex size-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-wider text-slate-900">
                              {isOnline ? 'Radar Active' : 'Radar Offline'}
                            </p>
                            <p className="text-[10px] font-mono font-semibold text-slate-500 mt-1">
                              {driverLocation[0].toFixed(4)}° N, {driverLocation[1].toFixed(4)}° E
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md border shadow-sm ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                            {isOnline ? 'SCANNING' : 'STANDBY'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

              </aside>
            </div>
          </>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. SUBSCRIPTION MODAL */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden relative">
            <button onClick={() => setShowSubModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <X className="size-4" />
            </button>
            <div className="p-6 bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Zap className="size-5" />
                <span className="font-black tracking-widest text-xs uppercase">Pro Driver Pass</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Unlock Full Access</h2>
              <p className="text-sm text-slate-600 mt-2">Subscribe to accept unlimited private rides, host Rahi-Pools, and create custom tour packages.</p>
            </div>
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <button onClick={() => purchaseSubscription('Weekly Pass')} disabled={isUpdating} className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-primary transition-colors group">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-900 group-hover:text-primary transition-colors">Weekly Pass</p>
                      <p className="text-xs text-slate-500 mt-1">₹399 / week</p>
                    </div>
                    <ArrowRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </button>
                <button onClick={() => purchaseSubscription('Monthly Pass')} disabled={isUpdating} className="w-full text-left p-4 rounded-xl border-2 border-primary bg-primary/5 shadow-sm group">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-primary">Monthly Pass</p>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-md">Best Value</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">₹1,299 / month</p>
                    </div>
                    <ArrowRight className="size-5 text-primary" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. POOL MODAL */}
      {showPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden relative">
            <button onClick={() => setShowPoolModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <X className="size-4" />
            </button>
            <div className="p-6 bg-primary/5 border-b border-primary/10">
              <h2 className="text-2xl font-black text-slate-900">Host Rahi-Pool</h2>
              <p className="text-sm text-slate-600 mt-1">Broadcast your empty seats.</p>
            </div>
            <form onSubmit={submitPoolBroadcast} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Boarding Point</label>
                  <input type="text" required value={poolForm.boardingPoint} onChange={e => setPoolForm({...poolForm, boardingPoint: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium" placeholder="e.g. Haldwani" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Destination</label>
                  <input type="text" required value={poolForm.destination} onChange={e => setPoolForm({...poolForm, destination: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium" placeholder="e.g. Nainital" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Depart Time</label>
                  <input type="time" required value={poolForm.departTime} onChange={e => setPoolForm({...poolForm, departTime: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Seats</label>
                  <input type="number" min="1" max="10" required value={poolForm.seats} onChange={e => setPoolForm({...poolForm, seats: Number(e.target.value)})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Price (₹)</label>
                  <input type="number" required value={poolForm.price} onChange={e => setPoolForm({...poolForm, price: Number(e.target.value)})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-primary text-sm font-medium" />
                </div>
              </div>
              <button type="submit" className="w-full h-12 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors mt-6">
                Start Broadcast
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. TOUR PACKAGE MODAL */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden relative">
            <button onClick={() => setShowTourModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <X className="size-4" />
            </button>
            <div className="p-6 bg-emerald-50 border-b border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Create Tour Package</h2>
                  <p className="text-sm text-slate-600 mt-1">Use AI to generate a complete itinerary.</p>
                </div>
                <button type="button" onClick={generateTourDetails} disabled={isTourAiLoading} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50">
                  {isTourAiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {isTourAiLoading ? 'Thinking...' : 'AI Auto-Fill'}
                </button>
              </div>
            </div>
            <form onSubmit={submitTourPackage} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Package Title</label>
                <input type="text" required value={tourForm.title} onChange={e => setTourForm({...tourForm, title: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium" placeholder="e.g. Kedarnath Yatra Express" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Duration</label>
                  <input type="text" required value={tourForm.duration} onChange={e => setTourForm({...tourForm, duration: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium" placeholder="e.g. 3 Days, 2 Nights" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Total Price (₹)</label>
                  <input type="number" required value={tourForm.price} onChange={e => setTourForm({...tourForm, price: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium" placeholder="e.g. 15000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Route Points</label>
                <input type="text" required value={tourForm.route} onChange={e => setTourForm({...tourForm, route: e.target.value})} className="w-full h-11 px-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium" placeholder="e.g. Haridwar -> Rishikesh -> Kedarnath" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Itinerary / Description</label>
                <textarea required value={tourForm.description} onChange={e => setTourForm({...tourForm, description: e.target.value})} className="w-full h-24 p-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 text-sm font-medium resize-none" placeholder="Enter trip details..." />
              </div>
              <button type="submit" className="w-full h-12 bg-emerald-500 text-white rounded-xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors mt-2">
                Publish Tour Package
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-[slideUp_0.3s_ease-out]">
          {notice}
        </div>
      )}

    </main>
  );
}