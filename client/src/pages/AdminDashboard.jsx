import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, TrendingUp, Bell, Car, Check, Clock,
  IndianRupee, LayoutDashboard, Menu, Route,
  Search, Settings, ShieldCheck, Users, X, LogOut, Download, User
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [query, setQuery] = useState('');
  
  // LIVE DATABASE STATE
  const [adminProfile, setAdminProfile] = useState({ name: 'Loading...', email: 'Loading...', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [stats, setStats] = useState({ users: 0, drivers: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  // NEW: Filter State for Users Tab
  const [userFilter, setUserFilter] = useState('ALL');

  // 1. Fetch Live Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setAdminProfile({
            name: data.user.name || 'Admin',
            email: data.user.email || '',
            phone: data.user.phone || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, [navigate]);

  // 2. Fetch Dashboard Data
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setPendingDrivers(data.pendingDrivers || []);
        setStats(data.stats || { users: 0, drivers: 0, revenue: 0 });
        setAllUsers(data.allUsers || []);
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error("Failed to fetch live admin data", error);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 3. Save Settings to Database
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: adminProfile.name })
      });
      if (res.ok) setShowSettings(false);
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleExportReport = () => {
    if (bookings.length === 0) return alert("No data to export");
    const headers = ['Booking ID,Customer,Driver,Pickup,Destination,Status,Price,Date'];
    const rows = bookings.map(b => 
      `${b.id},${b.customer_name || 'Unknown'},${b.driver_name || 'Unassigned'},"${b.pickup}","${b.destination}",${b.status},${(b.passengers || 1) * 250},${new Date(b.created_at).toLocaleString()}`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rahi_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDriverAction = async (driverId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: action })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Approval Failed: ${errorData.message}`);
        return;
      }
      
      alert(`Success: Driver is now ${action}!`);
      fetchAdminData(); 
    } catch (error) {
      console.error("Action failed", error);
      alert("Network error: Check if backend server is running.");
    }
  };

  const filteredDrivers = pendingDrivers.filter(d => 
    (d.name || '').toLowerCase().includes(query.toLowerCase()) || 
    (d.vehicle_number || '').toLowerCase().includes(query.toLowerCase())
  );
  
  const routeCounts = bookings.reduce((acc, b) => {
    const route = `${b.pickup} → ${b.destination}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {});
  
  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); 

  const totalDrivers = allUsers.filter(u => u.role === 'DRIVER').length;
  const driversOnTrip = bookings.filter(b => ['DRIVER ARRIVING', 'TRIP STARTED'].includes(b.status)).length;
  const idleDrivers = Math.max(0, totalDrivers - driversOnTrip); 

  // Filtered Users Logic
  const displayedUsers = allUsers.filter(u => userFilter === 'ALL' ? true : u.role === userFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 text-slate-900 lg:flex">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between px-7">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Rahi Logo" className="h-14 w-14 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-primary/20" />
            <span className="text-lg font-black tracking-tight text-slate-900">Rahi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden"><X className="size-5" /></button>
        </div>
        
        <div className="px-4 py-5 flex-1">
          <p className="px-3 pb-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <nav className="flex flex-col gap-1">
            {[{icon: LayoutDashboard, label: 'Dashboard'}, {icon: Users, label: 'Users'}, {icon: Car, label: 'Vehicles'}, {icon: Route, label: 'Bookings'}].map((item) => (
              <button 
                key={item.label} 
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${activeTab === item.label ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <button onClick={() => setShowSettings(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900">
            <Settings className="size-[18px]" /> Settings
          </button>
          <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-4 px-3 cursor-pointer hover:opacity-80" onClick={handleLogout}>
            <div className="grid size-9 place-items-center rounded-full bg-orange-100 text-orange-600 text-xs font-black">{adminProfile.name.substring(0, 2).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-900">{adminProfile.name}</p>
              <p className="truncate text-xs text-slate-400">Administrator</p>
            </div>
            <LogOut className="size-4 text-rose-500" />
          </div>
        </div>
      </aside>
      
      <div className="min-w-0 flex-1 flex flex-col max-h-screen overflow-y-auto">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/60 bg-white/50 backdrop-blur-xl sticky top-0 z-30 px-5 sm:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="size-5" /></button>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl text-slate-900">Good morning, {adminProfile.name.split(' ')[0]}</h1>
            </div>
          </div>
        </header>
        
        <main className="p-5 sm:p-8 flex-1">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-orange-500">
                <ShieldCheck className="size-4" /> Operations Overview
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{activeTab}</h2>
            </div>
            <button onClick={handleExportReport} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
              <Download className="size-4" /> Export CSV Report
            </button>
          </div>
          
          {activeTab === 'Dashboard' && (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Total Users" value={stats.users.toLocaleString()} change="Active" detail="Registered accounts" />
                <StatCard icon={Car} label="Active Drivers" value={stats.drivers.toLocaleString()} change="Live" detail="Verified partners" />
                <StatCard icon={ShieldCheck} label="Pending Verifications" value={pendingDrivers.length.toString()} detail="Needs your attention" />
                <StatCard 
                  icon={IndianRupee} 
                  label="Monthly SaaS Revenue" 
                  value={`₹${stats.revenue.toLocaleString()}`} 
                  change="Zero-Commission" 
                  detail="Based on ₹399/mo (₹15/day plan)" 
                />
              </section>
              
              <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">Pending Verifications</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">Review and approve new drivers</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search drivers" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 sm:w-48 transition-colors shadow-sm" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <tr><th className="px-5 py-3">Driver</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3 text-right">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDrivers.map((driver) => (
                          <tr key={driver.id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="whitespace-nowrap px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid size-9 place-items-center rounded-full text-xs font-black bg-amber-100 text-amber-600">{driver.name.substring(0, 2).toUpperCase()}</div>
                                <div><p className="font-black text-slate-900">{driver.name}</p><p className="mt-0.5 text-xs text-slate-500">{driver.phone}</p></div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <p className="font-semibold text-xs text-slate-500">{driver.vehicle_model || 'Standard Sedan'}</p>
                              <p className="font-mono text-xs font-bold mt-1 text-slate-900">{driver.vehicle_number || 'PENDING'}</p>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleDriverAction(driver.id, 'APPROVED')} className="rounded-lg bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 text-xs font-black hover:bg-orange-500 hover:!text-white hover:border-orange-500 transition-colors">Approve</button>
                                <button onClick={() => handleDriverAction(driver.id, 'REJECTED')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors">Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredDrivers.length === 0 && (
                      <div className="p-12 text-center text-sm font-semibold text-slate-500">
                        <Check className="mx-auto mb-3 size-8 text-emerald-500" />
                        No pending verifications.
                      </div>
                    )}
                  </div>
                </section>
                
                <div className="flex flex-col gap-6">
                  <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-lg text-slate-900">Trending Routes</h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">Highest demand pickup & drop-offs</p>
                      </div>
                      <div className="grid size-8 place-items-center rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                        <Route className="size-4" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {topRoutes.length > 0 ? topRoutes.map(([route, count], idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-900">{idx + 1}.</span>
                            <span className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs text-slate-700">{route}</span>
                          </div>
                          <span className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                            <TrendingUp className="size-3 text-orange-500" /> {count} trips
                          </span>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-sm font-medium text-slate-500 border border-dashed border-slate-200 rounded-xl">No route data available yet.</div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-lg text-slate-900">Fleet Activity</h3>
                        <p className="mt-1 text-xs font-medium text-slate-500">Current driver utilization</p>
                      </div>
                      <div className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-500 border border-blue-100">
                        <Car className="size-4" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-emerald-500 flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500 animate-pulse"/> On Trip</span>
                          <span className="text-slate-600">{driversOnTrip}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${totalDrivers ? (driversOnTrip / totalDrivers) * 100 : 0}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-amber-500 flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500"/> Idle / Available</span>
                          <span className="text-slate-600">{idleDrivers}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${totalDrivers ? (idleDrivers / totalDrivers) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {/* USERS TAB - UPDATED WITH CATEGORIES */}
          {activeTab === 'Users' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {['ALL', 'CUSTOMER', 'DRIVER'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setUserFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm border ${userFilter === filter ? 'bg-orange-500 text-white border-orange-500 shadow-orange-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    {filter === 'ALL' ? 'All Users' : filter === 'CUSTOMER' ? 'Customers' : 'Driver Partners'}
                  </button>
                ))}
              </div>
              
              <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">User Details</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                          <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                            #{String(user.id).substring(0, 6).toUpperCase()}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-black text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase ${user.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border border-amber-200' : user.role === 'DRIVER' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {user.role === 'DRIVER' ? (
                              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.verification_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                                {user.verification_status}
                              </span>
                            ) : (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-emerald-200">Active</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {displayedUsers.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-semibold">No users found in this category.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* VEHICLES TAB - UPDATED WITH DRIVER NAME */}
          {activeTab === 'Vehicles' && (
            <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Driver</th>
                      <th className="px-5 py-3">Vehicle Details</th>
                      <th className="px-5 py-3">License Plate</th>
                      <th className="px-5 py-3">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">#{String(vehicle.id).substring(0, 6).toUpperCase()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-8 place-items-center rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {(vehicle.driver_name || 'U').substring(0, 2).toUpperCase()}
                            </div>
                            <p className="font-black text-slate-900">{vehicle.driver_name || 'Unassigned'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">{vehicle.model}</td>
                        <td className="px-5 py-4 font-mono text-slate-500 uppercase">
                          <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-200">{vehicle.vehicle_number}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{vehicle.capacity || '4 pax'}</td>
                      </tr>
                    ))}
                    {vehicles.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-semibold">No vehicles registered yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'Bookings' && (
            <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">ID / Date</th>
                      <th className="px-5 py-3">Route</th>
                      <th className="px-5 py-3">Customer & Driver</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking, idx) => (
                      <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs font-bold text-slate-400">#{String(booking.id).substring(0, 6).toUpperCase()}</p>
                          <p className="text-xs font-medium mt-1 text-slate-600">{new Date(booking.created_at || Date.now()).toLocaleDateString()}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-slate-900">{booking.pickup}</p>
                          <p className="text-sm font-bold mt-1 text-slate-500">→ {booking.destination}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-xs text-slate-600">{booking.customer_name || 'Unknown'} <span className="text-slate-400 font-normal">(Pax)</span></p>
                          <p className="font-semibold text-xs mt-1 text-slate-600">{booking.driver_name || 'Waiting...'} <span className="text-slate-400 font-normal">(Drv)</span></p>
                        </td>
                        <td className="px-5 py-4 font-black text-orange-500">₹{(booking.passengers || 1) * 250}</td>
                        <td className="px-5 py-4 text-right">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white shadow-2xl relative overflow-hidden">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Settings className="size-5 text-orange-500" /> Admin Settings
              </div>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="size-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin Name</label>
                <div className="relative flex items-center mt-2">
                  <User className="absolute left-3 size-4 text-slate-400" />
                  <input 
                    value={adminProfile.name} 
                    onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })} 
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-10 pr-3 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin Email</label>
                <div className="relative flex items-center mt-2 opacity-70">
                  <Activity className="absolute left-3 size-4 text-slate-300" />
                  <input 
                    value={adminProfile.email} 
                    readOnly
                    className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50 text-slate-400 pl-10 pr-3 text-sm outline-none cursor-not-allowed" 
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="w-full mt-4 h-11 rounded-xl bg-orange-500 text-white font-black hover:bg-orange-600 transition-colors disabled:opacity-70 shadow-lg shadow-orange-500/20"
              >
                {isSaving ? 'Saving...' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, detail }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-slate-50 text-orange-500 border border-slate-100"><Icon className="size-5" /></div>
        {change && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"><TrendingUp className="size-3.5" />{change}</span>}
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{value}</p>
        {detail && <p className="mt-1 text-xs font-medium text-slate-400">{detail}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  const styles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'TRIP STARTED': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
    COMPLETED: 'bg-slate-50 text-slate-500 border-slate-200'
  }[s] || 'bg-slate-50 text-slate-500 border-slate-200';
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border ${styles}`}>
      {(s === 'CONFIRMED' || s === 'TRIP STARTED') && <span className="size-1.5 rounded-full bg-current animate-pulse" />}
      {status}
    </span>
  );
}