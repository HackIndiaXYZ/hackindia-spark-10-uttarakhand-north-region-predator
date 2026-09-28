import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Route, MapPin, CalendarDays, Settings, Package, Users, ShieldCheck, Home } from 'lucide-react';

export default function GlobalMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on Auth Page or Message Page
  if (location.pathname === '/login' || location.pathname.startsWith('/message')) {
    return null;
  }

  const role = location.pathname.startsWith('/customer') ? 'CUSTOMER' :
               location.pathname.startsWith('/driver') ? 'DRIVER' :
               location.pathname.startsWith('/admin') ? 'ADMIN' : 'HOME';

  const customerLinks = [
    { to: '/customer', label: 'Book a Ride', icon: MapPin },
    { to: '/customer/pools', label: 'Rahi-Pool', icon: Users },
    { to: '/customer/packages', label: 'Tour Packages', icon: Package },
    { to: '/customer/rides', label: 'My Rides', icon: Route },
    { to: '/support', label: 'Support', icon: ShieldCheck },
    { to: '/customer/settings', label: 'Settings', icon: Settings },
  ];

  const driverLinks = [
    { to: '/driver', label: 'Dashboard', icon: Home },
    { to: '/driver/packages', label: 'Tour Packages', icon: Package },
    { to: '/driver/history', label: 'History', icon: CalendarDays },
    { to: '/driver/settings', label: 'Settings', icon: Settings },
  ];

  const links = role === 'CUSTOMER' ? customerLinks : role === 'DRIVER' ? driverLinks : [];

  const handleNavigate = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  if (links.length === 0) return null;

  return (
    <>
      {/* Floating Hamburger Button for Mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 md:hidden flex items-center justify-center size-14 rounded-full bg-orange-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:scale-105 transition-transform"
      >
        <Menu className="size-6" />
      </button>

      {/* Fullscreen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white/90 backdrop-blur-xl transition-opacity p-6">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Rahi" className="size-10 rounded-full border border-orange-200 shadow-sm" />
              <span className="font-black text-xl text-slate-900">Rahi Navigation</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900">
              <X className="size-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {links.map((link, idx) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <button 
                  key={idx}
                  onClick={() => handleNavigate(link.to)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-white text-slate-700 border border-slate-100 shadow-sm hover:border-orange-200'
                  }`}
                >
                  <Icon className={`size-5 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                  <span className="font-black text-lg tracking-wide">{link.label}</span>
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              handleNavigate('/');
            }}
            className="mt-auto p-4 font-bold text-red-500 text-center uppercase tracking-widest text-sm"
          >
            Log Out
          </button>
        </div>
      )}
    </>
  );
}
