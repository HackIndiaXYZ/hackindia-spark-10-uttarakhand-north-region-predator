import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass, Check, X, MapPin, MessageSquare, Star, Tent, IndianRupee, Phone, UserRound, CalendarDays } from 'lucide-react';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export default function CustomerPackages() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('EXPLORE');
  const [availablePackages, setAvailablePackages] = useState([]);
  const [myPackages, setMyPackages] = useState([]);
  const [notice, setNotice] = useState('');
  const [userProfile, setUserProfile] = useState({ id: null, name: 'Loading...' });
  
  const [reviewModal, setReviewModal] = useState({ isOpen: false, bookingId: null });
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || TEST_TOKEN;
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user) setUserProfile(data.user);
      } catch (err) {}
    };
    fetchProfile();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      const pkgRes = await fetch('http://localhost:5000/api/packages');
      if (pkgRes.ok) setAvailablePackages(await pkgRes.json());

      const histRes = await fetch('http://localhost:5000/api/bookings/my', { headers: { 'Authorization': `Bearer ${token}` } });
      if (histRes.ok) {
        const result = await histRes.json();
        let safeArray = Array.isArray(result) ? result : (result.data || result.bookings || []);
        safeArray = safeArray.filter(r => (r.booking_type || r.bookingType) === 'PACKAGE');
        safeArray.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        setMyPackages(safeArray);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBookNow = (pkg) => {
    navigate('/customer', { state: { selectedPackage: pkg } });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      const response = await fetch(`http://localhost:5000/api/bookings/${reviewModal.bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating, review: reviewText })
      });
      if (response.ok) {
        setNotice('Review submitted successfully!');
        setReviewModal({ isOpen: false, bookingId: null });
        fetchAllData();
      } else { setNotice('Failed to submit review.'); }
    } catch (error) { setNotice('Network error.'); }
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 text-slate-900 relative pb-20">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
            <div>
              <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Rahi</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Tours & Packages</p>
            </div>
          </div>
          
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex">
            <Link to="/customer" className="hover:text-orange-500 transition-colors">Book a ride</Link>
            <Link to="/customer/rides" className="hover:text-orange-500 transition-colors">My rides</Link>
            <Link to="/customer/packages" className="text-emerald-600 drop-shadow-sm">Tour Packages</Link>
          </nav>
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/customer/settings')} className="flex size-10 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-emerald-500 transition-all font-black text-xs uppercase shadow-md hover:shadow-lg">
                {userProfile.name.substring(0,2)}
             </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 relative z-10">
        
        <div className="flex gap-4 mb-8 border-b border-slate-200 pb-4">
          <button 
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm border ${activeTab === 'EXPLORE' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            Explore Tours
          </button>
          <button 
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm border ${activeTab === 'BOOKINGS' ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/25' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            My Bookings
          </button>
        </div>

        {activeTab === 'EXPLORE' && (
          <div className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Curated Tourism Packages</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Book highly rated guided tours directly with our verified local drivers.</p>
            </div>
            
            {availablePackages.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white/50 backdrop-blur-md shadow-sm">
                <Compass className="mx-auto size-12 mb-4 text-emerald-500/30" />
                <p className="text-xl font-black text-slate-900">No active packages right now</p>
                <p className="text-sm text-slate-500 mt-2 font-medium">Check back later as drivers update their routes.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {availablePackages.map(pkg => (
                  <div key={pkg.id} className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl overflow-hidden hover:border-emerald-300 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col group">
                    <div className="h-32 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 flex flex-col justify-end relative overflow-hidden shrink-0 border-b border-emerald-100">
                      <div className="absolute -top-10 -right-10 size-24 bg-emerald-400/15 blur-2xl rounded-full group-hover:bg-emerald-400/30 transition-colors" />
                      <h3 className="relative z-10 text-xl font-black text-slate-900 leading-tight">{pkg.title}</h3>
                      <p className="relative z-10 text-xs text-emerald-600 mt-1.5 font-bold uppercase tracking-wider">{pkg.route}</p>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Tent className="size-3.5" /> {pkg.duration}
                          </div>
                          <p className="text-xl font-black text-slate-900">₹{pkg.price}</p>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3">{pkg.description}</p>
                        
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-5 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-full">
                              <UserRound className="size-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Hosted By</p>
                              <p className="text-sm font-bold text-slate-900">{pkg.driver_name}</p>
                            </div>
                          </div>
                          <a href={`tel:${pkg.driver_phone}`} className="bg-white p-2.5 rounded-lg hover:bg-emerald-500 hover:!text-white transition-colors shadow-sm border border-slate-200 text-slate-600" title="Call Driver to Enquire">
                            <Phone className="size-4" />
                          </a>
                        </div>
                      </div>
                      <button onClick={() => handleBookNow(pkg)} className="w-full py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'BOOKINGS' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">My Tourism Bookings</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Manage your curated mountain adventures and leave reviews for your guides.</p>
            </div>

            <div className="grid gap-6">
              {myPackages.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white/50 backdrop-blur-md shadow-sm">
                  <Tent className="mx-auto size-12 mb-4 text-emerald-500/30" />
                  <p className="text-xl font-black text-slate-900">No tours booked yet.</p>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Explore Uttarakhand packages from the Explore tab.</p>
                </div>
              ) : (
                myPackages.map((pkg) => {
                  const status = (pkg.status || 'PENDING').toUpperCase();
                  const dateStr = pkg.date ? new Date(pkg.date).toLocaleDateString() : 'TBD';
                  const price = pkg.price ? `₹ ${pkg.price}` : 'Price Pending';

                  return (
                    <div key={pkg.id} className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row gap-6 justify-between hover:border-emerald-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">ID: {pkg.id}</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">{pkg.destination}</h3>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-500"><CalendarDays className="size-4" /> {dateStr} at {pkg.time}</span>
                          <span className="flex items-center gap-1 font-black text-emerald-600"><IndianRupee className="size-4" /> {price}</span>
                        </div>

                        {pkg.review && (
                          <div className="mt-5 bg-emerald-50 p-4 rounded-xl border border-emerald-100 relative">
                            <div className="flex gap-1 mb-2">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`size-3 ${i < pkg.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />)}
                            </div>
                            <p className="text-sm italic text-slate-600">"{pkg.review}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-end gap-3 min-w-[200px] border-t border-slate-100 sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6">
                        {status !== 'COMPLETED' && status !== 'CANCELLED' && (
                          <button 
                            onClick={() => navigate('/messages', { 
                              state: { bookingId: pkg.id, partnerId: pkg.driver_id, partnerName: pkg.driver_name || 'Guide' } 
                            })}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                          >
                            <MessageSquare className="size-4" /> Message Guide
                          </button>
                        )}
                        
                        {status === 'COMPLETED' && !pkg.rating && (
                          <button 
                            onClick={() => setReviewModal({ isOpen: true, bookingId: pkg.id })}
                            className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl font-bold text-sm hover:bg-emerald-500 hover:!text-white hover:border-emerald-500 transition-colors"
                          >
                            <Star className="size-4" /> Leave a Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white shadow-2xl relative overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2 text-lg font-black text-emerald-600">
                <Star className="size-5" /> Rate Your Tour
              </div>
              <button onClick={() => setReviewModal({ isOpen: false, bookingId: null })} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={submitReview} className="p-6 space-y-5">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                    <Star className={`size-8 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                  </button>
                ))}
              </div>
              <div>
                <textarea 
                  required 
                  value={reviewText} 
                  onChange={(e) => setReviewText(e.target.value)} 
                  placeholder="How was the driver, the route, and the experience?" 
                  className="mt-2 h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 text-slate-900 p-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm placeholder:text-slate-400" 
                />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-bottom-5"><Check className="size-4 text-emerald-400" />{notice}<button onClick={() => setNotice('')}><X className="size-4 opacity-60 hover:opacity-100" /></button></div>}

    </main>
  );
}