import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, Clock, Lock, Check, CheckCheck } from 'lucide-react';

export default function MessagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  
  const { bookingId, partnerId, partnerName, rideType } = location.state || {};
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!bookingId) navigate(-1);
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://rahi-backend-gct8.onrender.com/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.user) setCurrentUserId(data.user.id);
    };
    fetchUser();
  }, [bookingId, navigate]);

  const fetchMessages = async () => {
    if (!bookingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://rahi-backend-gct8.onrender.com/api/messages/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
        fetch(`https://rahi-backend-gct8.onrender.com/api/messages/${bookingId}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://rahi-backend-gct8.onrender.com/api/messages/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receiverId: partnerId, content: input })
      });
      setInput('');
      fetchMessages();
    } catch (e) {}
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="flex items-center gap-4 bg-white/70 backdrop-blur-xl border-b border-white/60 p-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-slate-700">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-black">
            {partnerName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="font-black text-slate-900 leading-tight">{partnerName || 'Driver'}</h2>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 font-bold">
              <ShieldCheck className="size-3 text-emerald-500" /> Verified Partner
            </p>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-orange-50/20">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center mb-6 max-w-sm mx-auto shadow-sm">
          <p className="text-[11px] font-bold text-emerald-600 flex items-center justify-center gap-1.5 uppercase tracking-wider mb-1">
            <Lock className="size-3.5" /> End-to-End Encrypted
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Messages are secured. For your privacy, this chat will be permanently deleted 5 days after the trip concludes.
          </p>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUserId;
          let dateStr = msg.created_at;
          if (dateStr.includes(' ')) dateStr = dateStr.replace(' ', 'T');
          if (!dateStr.includes('Z')) dateStr += 'Z';
          
          return (
            <div key={idx} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end ml-auto items-end' : 'self-start mr-auto items-start'}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white text-slate-900 rounded-bl-sm border border-slate-100'}`}>
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1 font-medium">
                <Clock className="size-3" />
                {new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && (
                  msg.is_read ? <CheckCheck className="size-3.5 text-blue-500 ml-1" /> : <Check className="size-3.5 text-slate-400 ml-1" />
                )}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white/70 backdrop-blur-xl border-t border-white/60 p-4 pb-8 sm:pb-4 shadow-[0_-4px_20px_rgb(0,0,0,0.03)]">
        <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 h-12 rounded-full border border-slate-200 bg-white text-slate-900 px-5 text-sm font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm placeholder:text-slate-400"
          />
          <button type="submit" disabled={!input.trim()} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25">
            <Send className="size-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
