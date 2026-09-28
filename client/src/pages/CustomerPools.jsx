import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, Check, X, Clock3, MapPin, Users, Loader2, UserRound, Navigation } from 'lucide-react';

const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export default function CustomerPools() {
  const navigate = useNavigate();
  const location = useLocation();

  const [livePools, setLivePools] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [poolConfirmation, setPoolConfirmation] = useState(null);
  const [isPoolBooking, setIsPoolBooking] = useState(false);
  const [poolSeats, setPoolSeats] = useState(1);
  const [notice, setNotice] = useState('');
  const [userProfile, setUserProfile] = useState({ id: null, name: 'Loading...' });

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      
      const meRes = await fetch('https://rahi-backend-gct8.onrender.com/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const meData = await meRes.json();
      if (meRes.ok && meData.user) setUserProfile(meData.user);

      const poolRes = await fetch('https://rahi-backend-gct8.onrender.com/api/pools');
      if (poolRes.ok) setLivePools(await poolRes.json());

      const histRes = await fetch('https://rahi-backend-gct8.onrender.com/api/bookings/my', { headers: { 'Authorization': `Bearer ${token}` } });
      if (histRes.ok) {
        const result = await histRes.json();
        setMyRides(Array.isArray(result) ? result : (result.data || result.bookings || []));
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const executePoolBooking = async (pool) => {
    setIsPoolBooking(true);
    try {
      const token = localStorage.getItem('token') || TEST_TOKEN;
      const res = await fetch(`https://rahi-backend-gct8.onrender.com/api/pools/${pool.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ seats: poolSeats })
      });
      if (res.ok) {
        setNotice(`Seat Confirmed! Proceed to ${pool.boarding_point}.`);
        fetchAllData(); 
        setPoolConfirmation(null); 
      } else { 
        setNotice('Booking failed or seat unavailable.'); 
      }
    } catch (error) { setNotice('Network error during booking'); }
    setIsPoolBooking(false); 
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 text-slate-900 relative pb-20">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-300/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <header className="border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
            <div>
              <p className="font-display text-[19px] font-black leading-none tracking-tight text-slate-900">Rahi</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Rahi-Pool Network</p>
            </div>
          </div>
          
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex">
            <Link to="/customer" className="hover:text-orange-500 transition-colors">Book a ride</Link>
            <Link to="/customer/pools" className="text-indigo-600 drop-shadow-sm">Rahi-Pool</Link>
            <Link to="/customer/packages" className="hover:text-orange-500 transition-colors">Tour Packages</Link>
          </nav>
          
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/customer/settings')} className="flex size-10 items-center justify-center rounded-full bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-indigo-500 transition-all font-black text-xs uppercase shadow-md hover:shadow-lg">
                {userProfile.name.substring(0,2)}
             </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 relative z-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Live Shared Rides</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">Join verified local drivers heading your way. Save money and reduce your carbon footprint.</p>
          </div>
          {livePools.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{livePools.length} Active Pools</span>
            </div>
          )}
        </div>

        {livePools.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white/50 backdrop-blur-md shadow-sm max-w-2xl mx-auto mt-10">
            <Zap className="mx-auto size-12 mb-4 text-indigo-500/30" />
            <p className="text-xl font-black text-slate-900">No drivers broadcasting right now</p>
            <p className="text-sm text-slate-500 mt-2 font-medium">Check back later or book a private cab from the dashboard.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {livePools.map((pool) => {
              const isJoined = myRides.some(r => 
                r.pickup === pool.boarding_point && 
                r.destination === pool.destination && 
                ['PENDING', 'CONFIRMED', 'DRIVER ARRIVING', 'TRIP STARTED'].includes((r.status || '').toUpperCase())
              );

              return (
                <div key={pool.id} className="rounded-3xl border border-white/80 bg-white/80 backdrop-blur-xl overflow-hidden hover:border-indigo-300 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col group">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 border-b border-indigo-100 relative overflow-hidden shrink-0">
                    <div className="absolute -top-10 -right-10 size-24 bg-indigo-400/15 blur-2xl rounded-full group-hover:bg-indigo-400/30 transition-colors" />
                    <div className="flex justify-between items-start mb-1 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Route</p>
                      <p className="font-black text-xl text-slate-900">₹{pool.price}</p>
                    </div>
                    <h3 className="font-black text-lg text-slate-900 relative z-10 leading-tight">
                      {pool.boarding_point.split(',')[0]} <span className="text-indigo-500 mx-1">→</span> {pool.destination}
                    </h3>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <Clock3 className="size-4 text-slate-400" />
                          <span className="font-bold text-slate-700">{pool.depart_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600">
                          <Users className="size-4" />
                          <span className="font-black text-xs">{pool.seats_left} seats left</span>
                        </div>
                      </div>

                      <div className="space-y-3 pl-1">
                         <div className="flex items-start gap-3">
                           <MapPin className="size-4 text-indigo-500 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Boarding At</p>
                             <p className="text-sm font-medium text-slate-700">{pool.boarding_point}</p>
                           </div>
                         </div>
                         <div className="flex items-start gap-3">
                           <UserRound className="size-4 text-emerald-500 mt-0.5" />
                           <div>
                             <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver ({pool.vehicle_model || 'Shared Jeep'})</p>
                             <p className="text-sm font-medium text-slate-700">{pool.driver_name} <span className="text-slate-400 text-xs">({pool.driver_phone})</span></p>
                           </div>
                         </div>
                      </div>
                    </div>

                    {isJoined ? (
                      <button disabled className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-black py-3.5 rounded-xl flex justify-center items-center gap-2 cursor-not-allowed">
                        <Check className="size-4" strokeWidth={3} /> Joined Pool
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setPoolSeats(1); setPoolConfirmation(pool); }}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-black py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        Book Seat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {poolConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white shadow-2xl relative overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50">
              <div className="flex items-center gap-2 text-lg font-black text-indigo-600"><Users className="size-5" /> Confirm Seat</div>
              <button onClick={() => setPoolConfirmation(null)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="size-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">You are about to secure seats heading to <strong className="text-slate-900">{poolConfirmation.destination}</strong>.</p>
              
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Number of Seats</p>
                  <p className="text-lg font-black text-slate-900 mt-1">₹{poolConfirmation.price * poolSeats} <span className="text-xs font-medium text-slate-500">(₹{poolConfirmation.price}/seat)</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPoolSeats(Math.max(1, poolSeats - 1))}
                    className="size-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                  >-</button>
                  <span className="font-black text-lg w-4 text-center">{poolSeats}</span>
                  <button 
                    onClick={() => setPoolSeats(Math.min(poolConfirmation.seats_left, poolSeats + 1))}
                    className="size-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                  >+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPoolConfirmation(null)} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button disabled={isPoolBooking} onClick={() => executePoolBooking(poolConfirmation)} className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white text-sm font-black hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/25">
                  {isPoolBooking ? <Loader2 className="size-4 animate-spin mx-auto" /> : 'Confirm Seat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-bottom-5"><Check className="size-4 text-emerald-400" />{notice}<button onClick={() => setNotice('')}><X className="size-4 opacity-60" /></button></div>}
    </main>
  );
}
