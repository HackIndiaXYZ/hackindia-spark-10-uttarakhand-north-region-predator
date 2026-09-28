import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Phone, ArrowRight, Route, ShieldCheck, Mountain } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER' // Default role for signup
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`https://rahi-backend-gct8.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Save ONLY the JWT token to local storage (required for HTTP headers)
        localStorage.setItem('token', data.token);
        
        // STRICT ROUTING: Rely entirely on the database role returned from the backend
        const userRole = (data.user?.role || '').toUpperCase();
        
        // Check if admin email was used
        if (data.user?.email === 'admin@pahadiride.com' || userRole === 'ADMIN') {
          navigate('/admin');
        } else if (userRole === 'DRIVER') {
          navigate('/driver');
        } else {
          navigate('/customer');
        }
      } else {
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-amber-50/30 text-slate-900 flex items-center justify-center relative overflow-hidden">
      
      {/* --- PURE CSS TAXI & MOUNTAIN ANIMATION --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drive {
          0% { transform: translateX(-150px); }
          100% { transform: translateX(100vw); }
        }
        .taxi-container {
          position: absolute;
          bottom: 10%;
          left: 0;
          width: 100%;
          animation: drive 12s linear infinite;
          z-index: 0;
        }
        .road-line {
          position: absolute;
          bottom: 10%;
          width: 100%;
          height: 2px;
          background: repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 20px, transparent 20px, transparent 40px);
          z-index: -1;
        }
      `}} />

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <Mountain className="absolute bottom-[12%] left-10 size-64 text-slate-400" strokeWidth={0.5} />
        <Mountain className="absolute bottom-[12%] right-20 size-96 text-slate-400" strokeWidth={0.5} />
        <Mountain className="absolute bottom-[12%] left-1/2 size-80 text-slate-400" strokeWidth={0.5} />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-300/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* The Road and Moving Taxi */}
      <div className="road-line" />
      <div className="taxi-container flex items-center gap-2">
        {/* Headlight Glow Effect */}
        <div className="absolute right-[-40px] w-20 h-10 bg-amber-400/20 blur-xl rounded-full" />
        <Car className="size-10 text-orange-500 fill-orange-400" />
      </div>

      {/* --- AUTHENTICATION CARD --- */}
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_8px_60px_rgb(0,0,0,0.06)] relative z-10">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <img src="/logo.png" alt="Rahi Logo" className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-primary/20" />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Rahi</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Move with the mountains.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="size-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <>
              <div className="relative flex items-center">
                <User className="absolute left-4 size-5 text-slate-400" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name" 
                  required={!isLogin}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-12 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm placeholder:text-slate-400" 
                />
              </div>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 size-5 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number" 
                  required={!isLogin}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-12 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm placeholder:text-slate-400" 
                />
              </div>
            </>
          )}

          <div className="relative flex items-center">
            <Mail className="absolute left-4 size-5 text-slate-400" />
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address" 
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-12 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-4 size-5 text-slate-400" />
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password" 
              required
              className="h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 pl-12 pr-4 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm placeholder:text-slate-400" 
            />
          </div>

          {!isLogin && (
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">I am joining as a:</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'CUSTOMER'})}
                  className={`rounded-xl border p-3 text-sm font-bold transition-all ${formData.role === 'CUSTOMER' ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500/30' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                >
                  Passenger
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'DRIVER'})}
                  className={`rounded-xl border p-3 text-sm font-bold transition-all ${formData.role === 'DRIVER' ? 'border-amber-500 bg-amber-50 text-amber-600 ring-1 ring-amber-500/30' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                >
                  Driver
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-black text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-70 shadow-md shadow-orange-500/20"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="ml-2 font-bold text-orange-500 hover:underline underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

      </div>
    </div>
  );
}
