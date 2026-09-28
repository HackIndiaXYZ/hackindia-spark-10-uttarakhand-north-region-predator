import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Compass, Star, MapPin, CalendarDays, IndianRupee, 
  MessageSquareQuote, Tent, Clock3, UserRound, Check, X, ShieldCheck, MessageSquare, Car, Users
} from 'lucide-react';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 

function Logo() {
  return (
    <div className="flex items-center gap-3 relative z-10">
      <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
      <div>
        <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Rahi</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Driver Packages</p>
      </div>
    </div>
  );
}

export default function DriverPackages() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ONGOING');
  
  const [myCatalog, setMyCatalog] = useState([]);
  const [ongoingTours, setOngoingTours] = useState([]);
  const [historyTours, setHistoryTours] = useState([]);
  
  const [notice, setNotice] = useState('');
  const [userProfile, setUserProfile] = useState({ id: null, name: 'Loading...' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      if (!token) return navigate('/');

      const meRes = await fetch('https://rahi-backend-gct8.onrender.com/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const meData = await meRes.json();
      const userId = meData.user?.id;
      if (userId) setUserProfile(meData.user);

      const pkgRes = await fetch('https://rahi-backend-gct8.onrender.com/api/packages');
      if (pkgRes.ok) {
        const allPkgs = await pkgRes.json();
        setMyCatalog(allPkgs.filter(p => p.driver_id === userId));
      }

      const bkgRes = await fetch('https://rahi-backend-gct8.onrender.com/api/bookings/driver-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bkgRes.ok) {
        const result = await bkgRes.json();
        let allBookings = Array.isArray(result) ? result : (result.data || result.bookings || []);
        const packageBookings = allBookings.filter(b => (b.booking_type || b.bookingType)?.toUpperCase() === 'PACKAGE');
        packageBookings.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

        setOngoingTours(packageBookings.filter(b => ['PENDING', 'CONFIRMED', 'DRIVER ARRIVING', 'TRIP STARTED'].includes((b.status || '').toUpperCase())));
        setHistoryTours(packageBookings.filter(b => ['COMPLETED', 'CANCELLED'].includes((b.status || '').toUpperCase())));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const updateBookingStatus = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      const response = await fetch(`https://rahi-backend-gct8.onrender.com/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setNotice(`Tour status updated to ${newStatus}`);
        fetchAllData();
      } else { setNotice('Failed to update status'); }
    } catch (error) { setNotice('Network error'); }
    setIsUpdating(false);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleUnpublish = async (pkgId) => {
    if (!window.confirm("Are you sure you want to unpublish this tour? It will be removed from the customer catalog.")) return;
    
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://rahi-backend-gct8.onrender.com/api/packages/${pkgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotice('Tour package unpublished successfully.');
        fetchAllData(); 
      } else {
        setNotice('Failed to unpublish package.');
      }
    } catch (error) { setNotice('Network error.'); }
    setIsUpdating(false);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 text-slate-900 relative overflow-hidden pb-20">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />

      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />
          
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex relative z-10">
            <Link to="/driver" className="hover:text-orange-500 transition-colors">Dashboard</Link>
            <Link to="/driver/packages" className="text-emerald-600 drop-shadow-sm">My Packages</Link>
          </nav>

          <div className="flex items-center gap-4 relative z-10">
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <button 
                onClick={() => navigate('/driver/settings')}
                className="flex size-10 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-emerald-500 transition-all font-black text-xs uppercase shadow-md hover:shadow-lg"
              >
                {userProfile.name !== 'Loading...' ? userProfile.name.substring(0, 2) : '..'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 relative z-10">
        <div className="flex flex-wrap gap-4 mb-10 border-b border-slate-200 pb-4">
          <button onClick={() => setActiveTab('ONGOING')} className={`px-6 py-3 rounded-xl text-sm font-black transition-all shadow-sm border ${activeTab === 'ONGOING' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>Ongoing Tours ({ongoingTours.length})</button>
          <button onClick={() => setActiveTab('HISTORY')} className={`px-6 py-3 rounded-xl text-sm font-black transition-all shadow-sm border ${activeTab === 'HISTORY' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>History & Reviews</button>
          <button onClick={() => setActiveTab('CATALOG')} className={`px-6 py-3 rounded-xl text-sm font-black transition-all shadow-sm border ${activeTab === 'CATALOG' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>My Published Catalog</button>
        </div>

        {activeTab === 'ONGOING' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Active Tour Bookings</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Manage your upcoming and in-progress packages.</p>
            </div>
            {ongoingTours.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white/50 backdrop-blur-md shadow-sm">
                <Compass className="mx-auto size-12 mb-4 text-emerald-500/30" />
                <p className="text-xl font-black text-slate-900">No active bookings</p>
                <p className="text-sm text-slate-500 mt-2 font-medium">When a customer books your package, it will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {ongoingTours.map(tour => {
                  const status = (tour.status || 'PENDING').toUpperCase();
                  const price = tour.price ? `₹${tour.price}` : 'Pending';
                  
                  return (
                    <div key={tour.id} className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row gap-8 justify-between hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md border ${status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{status}</span>
                          <span className="text-xs text-slate-400 font-mono font-bold">ID: {tour.id}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{tour.destination}</h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5 text-sm font-semibold">
                          <span className="flex items-center gap-2 text-slate-600"><CalendarDays className="size-4 text-emerald-500" /> {new Date(tour.date).toLocaleDateString()} at {tour.time}</span>
                          <span className="flex items-center gap-2 text-slate-600"><Users className="size-4 text-emerald-500" /> {tour.passengers || 1} Passengers</span>
                          <span className="flex items-center gap-1.5 font-black text-emerald-600 text-lg"><IndianRupee className="size-5" /> {price}</span>
                        </div>
                        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm">
                          <div className="bg-orange-100 p-3 rounded-full"><UserRound className="size-5 text-orange-500" /></div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Customer</p>
                            <p className="text-base font-black text-slate-900 mt-0.5">{tour.customer_name || 'Passenger'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-end gap-3 min-w-[240px] md:border-l border-slate-200 md:pl-8 pt-6 md:pt-0">
                        {status === 'PENDING' ? (
                          <>
                            <button disabled={isUpdating} onClick={() => updateBookingStatus(tour.id, 'CONFIRMED')} className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-4 rounded-xl font-black text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 disabled:opacity-50"><Check className="size-4" /> Accept Tour</button>
                            <button disabled={isUpdating} onClick={() => updateBookingStatus(tour.id, 'REJECTED')} className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-500 px-5 py-4 rounded-xl font-black text-sm hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors disabled:opacity-50 shadow-sm"><X className="size-4" /> Decline</button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => navigate('/messages', { state: { bookingId: tour.id, partnerId: tour.customer_id, partnerName: tour.customer_name || 'Passenger' } })}
                              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-4 rounded-xl font-black text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                            >
                              <MessageSquare className="size-4" /> Message Customer
                            </button>

                            {status === 'CONFIRMED' && (
                              <button disabled={isUpdating} onClick={() => updateBookingStatus(tour.id, 'TRIP STARTED')} className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-4 rounded-xl font-black text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 disabled:opacity-50">Start Tour</button>
                            )}
                            
                            {status === 'TRIP STARTED' && (
                              <button disabled={isUpdating} onClick={() => updateBookingStatus(tour.id, 'COMPLETED')} className="w-full flex items-center justify-center gap-2 bg-indigo-500 text-white px-5 py-4 rounded-xl font-black text-sm hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-50"><ShieldCheck className="size-4" /> Finish & Complete</button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Past Trips & Feedback</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">View your completed tours and the ratings left by customers.</p>
            </div>
            <div className="grid gap-6">
              {historyTours.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white/50 backdrop-blur-md shadow-sm">
                  <Star className="mx-auto size-12 mb-4 text-emerald-500/30" />
                  <p className="text-xl font-black text-slate-900">No completed tours yet.</p>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Once you finish a package, reviews will appear here.</p>
                </div>
              ) : (
                historyTours.map((tour) => {
                  const status = (tour.status || '').toUpperCase();
                  return (
                    <div key={tour.id} className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>{status}</span>
                            <span className="text-xs text-slate-400 font-mono">ID: {tour.id}</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900">{tour.destination}</h3>
                          <div className="flex items-center gap-5 mt-3 text-sm text-slate-500 font-semibold">
                            <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {new Date(tour.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5 text-emerald-600"><IndianRupee className="size-4" /> {tour.price || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                          <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-black text-lg">{tour.customer_name?.charAt(0) || 'C'}</div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Passenger</p>
                            <p className="text-base font-black text-slate-900">{tour.customer_name || 'Anonymous'}</p>
                          </div>
                        </div>
                      </div>

                      {tour.rating ? (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 relative">
                          <MessageSquareQuote className="absolute top-6 right-6 size-12 text-emerald-500/10" />
                          <div className="flex items-center gap-1.5 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`size-5 ${i < tour.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-base font-medium leading-relaxed italic text-slate-700">"{tour.review || 'No written feedback provided.'}"</p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100 shadow-sm">
                          <p className="text-sm text-slate-500 italic">Customer has not left a review yet.</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PUBLISHED CATALOG */}
        {activeTab === 'CATALOG' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">My Published Catalog</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">These are the packages currently visible to customers on the platform.</p>
            </div>
            
            {myCatalog.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white/50 backdrop-blur-md shadow-sm">
                <Tent className="mx-auto size-12 mb-4 text-emerald-500/30" />
                <p className="text-xl font-black text-slate-900">No templates published.</p>
                <p className="text-sm mt-2 text-slate-500 font-medium">Go to your main dashboard to host a new tour.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {myCatalog.map(pkg => (
                  <div key={pkg.id} className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 relative border-b border-emerald-100">
                      <div className="absolute -top-10 -right-10 size-32 bg-emerald-400/15 blur-3xl rounded-full group-hover:bg-emerald-400/30 transition-colors" />
                      <div className="absolute top-5 right-5 bg-emerald-100 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 border border-emerald-200">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 pr-20 leading-tight">{pkg.title}</h3>
                      <p className="text-sm text-emerald-600 mt-2 font-bold uppercase tracking-wider">{pkg.route}</p>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-5">
                          <span className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            <Clock3 className="size-4 text-emerald-500" /> {pkg.duration}
                          </span>
                          <span className="text-2xl font-black text-emerald-600">₹{pkg.price}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-6">{pkg.description}</p>
                      </div>
                      <button 
                        disabled={isUpdating}
                        onClick={() => handleUnpublish(pkg.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-500 py-3.5 text-sm font-black hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <X className="size-4" /> Unpublish Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
