import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Car, Check, ChevronRight, Clock3,
  IndianRupee, MapPin, Route, TrendingUp, X, MessageSquare
} from 'lucide-react';

const statusStyles = {
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-700',
  CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
  'DRIVER ARRIVING': 'border-blue-200 bg-blue-50 text-blue-700',
  'TRIP STARTED': 'border-indigo-200 bg-indigo-50 text-indigo-700',
  DEFAULT: 'border-gray-200 bg-gray-50 text-gray-600'
};

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export default function MyRidesPage() {
  const navigate = useNavigate();
  const [myRides, setMyRides] = useState([]);
  const [stats, setStats] = useState({ total: 0, spent: 0, upcoming: 0 });
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchMyRides = async () => {
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      const response = await fetch('http://localhost:5000/api/bookings/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        let safeArray = Array.isArray(result) ? result : (result.data || result.bookings || []);
        
        // Exclude packages from regular rides
        safeArray = safeArray.filter(r => (r.booking_type || r.bookingType)?.toUpperCase() !== 'PACKAGE');
        
        safeArray.sort((a, b) => {
          const timeA = (a.created_at || a.createdAt) ? new Date(a.created_at || a.createdAt).getTime() : new Date(`${a.date}T${a.time || '00:00'}`).getTime();
          const timeB = (b.created_at || b.createdAt) ? new Date(b.created_at || b.createdAt).getTime() : new Date(`${b.date}T${b.time || '00:00'}`).getTime();
          return timeB - timeA;
        });
        
        setMyRides(safeArray);

        const total = safeArray.length;
        const upcoming = safeArray.filter(r => ['PENDING', 'CONFIRMED', 'DRIVER ARRIVING'].includes((r.status || '').toUpperCase())).length;
        const spent = safeArray.reduce((acc, r) => {
          if ((r.status || '').toUpperCase() === 'CANCELLED') return acc;
          return acc + (r.price ? Number(r.price) : ((r.passengers || 1) * 250));
        }, 0);

        setStats({ total, spent, upcoming });
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchMyRides();
    const interval = setInterval(fetchMyRides, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelRide = async (rideId) => {
    if (!rideId) return;
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      const response = await fetch(`http://localhost:5000/api/bookings/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (response.ok) { setNotice('Ride cancelled successfully.'); fetchMyRides(); }
    } catch (error) { setNotice('Network error.'); }
    setTimeout(() => setNotice(''), 2800);
  };

  const filteredRides = myRides.filter(ride => {
    const status = (ride.status || 'PENDING').toUpperCase();
    if (filter === 'ALL') return true;
    if (filter === 'UPCOMING') return ['PENDING', 'CONFIRMED', 'DRIVER ARRIVING'].includes(status);
    if (filter === 'COMPLETED') return ['COMPLETED', 'TRIP STARTED'].includes(status);
    if (filter === 'CANCELLED') return status === 'CANCELLED';
    return true;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 text-slate-900 relative">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <nav className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">Rahi</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">My Rides</p>
            </div>
          </div>
          <Link to="/customer" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:border-orange-200">
            <ArrowLeft className="size-4" /> Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14 relative z-10">
        <header className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2"><span className="size-2 rounded-full bg-orange-500 animate-pulse" /> Your activity</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Ride History &amp; Analytics</h1>
          </div>
        </header>

        <section className="mb-12">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="flex min-h-36 flex-col justify-between rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow group">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Rides</p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 border border-orange-100 group-hover:bg-orange-500 group-hover:!text-white transition-colors"><Route className="size-4" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </article>
            <article className="flex min-h-36 flex-col justify-between rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow group">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Spent</p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100 group-hover:bg-emerald-500 group-hover:!text-white transition-colors"><IndianRupee className="size-4" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">₹{stats.spent.toLocaleString()}</p>
            </article>
            <article className="flex min-h-36 flex-col justify-between rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow group">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Upcoming</p>
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100 group-hover:bg-blue-500 group-hover:!text-white transition-colors"><TrendingUp className="size-4" /></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.upcoming}</p>
            </article>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap gap-2">
            {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm border ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl divide-y divide-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            {filteredRides.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500 font-medium">No rides found.</div>
            ) : (
              filteredRides.map((ride, idx) => {
                const status = (ride.status || 'PENDING').toUpperCase();
                const isPrivate = (ride.bookingType || ride.booking_type) === 'PRIVATE';
                
                return (
                  <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-orange-50/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${statusStyles[status] || statusStyles.DEFAULT}`}>{status}</span>
                        <span className="text-xs text-slate-400 font-medium">{new Date(ride.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-black text-sm text-slate-900">{ride.pickup} → {ride.destination}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isPrivate && status !== 'PENDING' && status !== 'CANCELLED' && status !== 'COMPLETED' && (
                        <button 
                          onClick={() => navigate('/messages', { state: { bookingId: ride.id, partnerId: ride.driver_id, partnerName: ride.driver_name || 'Driver' } })}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-colors"
                        >
                          <MessageSquare className="size-3.5" /> Message Driver (E2EE)
                        </button>
                      )}
                      <button onClick={() => handleCancelRide(ride.id)} disabled={status === 'CANCELLED' || status === 'COMPLETED'} className="border border-slate-200 bg-white px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 transition-colors shadow-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/30 animate-in slide-in-from-bottom-5"><Check className="size-4 text-emerald-400" />{notice}</div>}
    </main>
  );
}