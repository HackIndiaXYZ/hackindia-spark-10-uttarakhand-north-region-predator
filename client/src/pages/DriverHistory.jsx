import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, CalendarDays, IndianRupee, History, Star, Loader2, Filter, Compass, CheckCircle2, XCircle, Activity } from 'lucide-react';

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

export default function DriverHistory() {
  const navigate = useNavigate();
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        const response = await fetch('https://rahi-backend-gct8.onrender.com/api/bookings/driver-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          let bookings = Array.isArray(result) ? result : (result.data || result.bookings || []);

          const historyData = bookings.filter(b => (b.status || '').toUpperCase() !== 'PENDING');
          historyData.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
          setAllRides(historyData);

          const earnings = historyData
            .filter(r => (r.status || '').toUpperCase() === 'COMPLETED')
            .reduce((sum, r) => sum + (r.price ? Number(r.price) : ((r.passengers || 1) * 250)), 0);
          setTotalEarnings(earnings);
        }
      } catch (error) { }
      setLoading(false);
    };
    fetchHistory();
  }, [navigate]);

  const filteredRides = allRides.filter(ride => {
    const status = (ride.status || '').toUpperCase();
    const type = (ride.booking_type || ride.bookingType || '').toUpperCase();

    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ONGOING') return ['CONFIRMED', 'DRIVER ARRIVING', 'TRIP STARTED'].includes(status);
    if (activeFilter === 'COMPLETED') return status === 'COMPLETED';
    if (activeFilter === 'CANCELLED') return ['CANCELLED', 'REJECTED'].includes(status);
    if (activeFilter === 'PACKAGES') return type === 'PACKAGE';
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (['CANCELLED', 'REJECTED'].includes(status)) return 'bg-rose-50 text-rose-600 border-rose-200';
    return 'bg-primary/10 text-primary border-primary/20 animate-pulse';
  };

  return (
    <main className="min-h-screen bg-orange-50 text-slate-900 relative overflow-hidden pb-20">

      {/* AMBIENT ORANGE GLOWS */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-400/15 blur-[120px] rounded-full pointer-events-none z-0" />

      <header className="border-b border-white/40 bg-white/40 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to="/driver" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/driver/packages" className="hover:text-primary transition-colors">My Packages</Link>
            <Link to="/driver/history" className="text-primary drop-shadow-sm">Ride History</Link>
          </nav>
          <div className="flex items-center gap-4 relative z-10">
            <Link to="/driver" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
              <ArrowLeft className="size-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-primary">
              <History className="size-4" /> Ride Ledger
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Daily Ride History</h1>
          </div>
          <div className="text-left sm:text-right bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Lifetime Earnings</p>
            <p className="text-2xl font-black text-slate-900">₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        {/* FILTER BAR - LIGHT */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-slate-200 pb-6">
          <button onClick={() => setActiveFilter('ALL')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${activeFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Filter className="size-3.5" /> All Rides
          </button>
          <button onClick={() => setActiveFilter('ONGOING')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${activeFilter === 'ONGOING' ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Activity className="size-3.5" /> Ongoing
          </button>
          <button onClick={() => setActiveFilter('PACKAGES')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${activeFilter === 'PACKAGES' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Compass className="size-3.5" /> Tour Packages
          </button>
          <button onClick={() => setActiveFilter('COMPLETED')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${activeFilter === 'COMPLETED' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <CheckCircle2 className="size-3.5" /> Completed
          </button>
          <button onClick={() => setActiveFilter('CANCELLED')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm border ${activeFilter === 'CANCELLED' ? 'bg-rose-500 text-white border-rose-500 shadow-rose-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <XCircle className="size-3.5" /> Cancelled
          </button>
        </div>

        {/* DATA RENDERING */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>
        ) : filteredRides.length === 0 ? (
          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-md p-16 text-center shadow-sm">
            <History className="mx-auto size-12 mb-4 opacity-20 text-primary" />
            <p className="text-xl font-black text-slate-900">No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} history found.</p>
            <p className="text-sm font-medium text-slate-500 mt-2">Adjust your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRides.map(ride => {
              const status = (ride.status || '').toUpperCase();
              const isCompleted = status === 'COMPLETED';
              const price = ride.price ? `₹${ride.price}` : `₹${(ride.passengers || 1) * 250}`;

              return (
                <div key={ride.id} className="rounded-[24px] border border-white/80 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-xl shadow-slate-200/50 hover:border-primary/30 transition-colors flex flex-col md:flex-row gap-6 justify-between group">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md border shadow-sm ${getStatusBadge(status)}`}>
                        {status}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
                        {ride.booking_type || ride.bookingType || 'PRIVATE RIDE'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">ID:{ride.id}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex flex-col items-center">
                        <span className={`size-2.5 rounded-full border-2 ${isCompleted ? 'border-emerald-500' : 'border-primary'}`} />
                        <span className="h-6 w-px bg-slate-200 my-1" />
                        <span className={`size-2.5 rounded-sm ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} />
                      </div>
                      <div className="flex flex-col gap-3">
                        <p className="text-lg font-black text-slate-900 leading-none">{ride.pickup}</p>
                        <p className="text-lg font-black text-slate-900 leading-none">{ride.destination}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-6 text-sm font-semibold pt-4 border-t border-slate-200">
                      <span className="flex items-center gap-2 text-slate-500"><CalendarDays className="size-4 text-primary" /> {new Date(ride.date || ride.created_at).toLocaleDateString()}</span>
                      {isCompleted && <span className="flex items-center gap-1.5 font-black text-slate-900 text-lg"><IndianRupee className="size-4 text-emerald-500" /> {price}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3 min-w-[220px] md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-black border border-primary/20 shadow-sm">
                        {ride.customer_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Passenger</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">{ride.customer_name || 'Anonymous'}</p>
                      </div>
                    </div>

                    {ride.rating && (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`size-3.5 ${i < ride.rating ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 italic font-medium leading-relaxed">"{ride.review}"</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
