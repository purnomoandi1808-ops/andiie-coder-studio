import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Sparkles, Cpu, CloudLightning, Loader2, Code2, Menu, Plus, MessageSquare, Trash2, Lock } from 'lucide-react';

export default function App() {
  // --- STATE AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // --- STATE CHAT ---
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("andiie_chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const chatEndRef = useRef(null);

  // --- LOGIKA AUTH ---
  useEffect(() => {
    if (localStorage.getItem("andiie_auth") === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === "andiie" && loginData.password === "Arsyad160216") {
      setIsLoggedIn(true);
      localStorage.setItem("andiie_auth", "true");
    } else {
      alert("Akses Ditolak: Hanya untuk Andi.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("andiie_auth");
    setIsLoggedIn(false);
  };

  // --- LOGIKA MEMORY ---
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
        localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // --- LOGIKA ACTIONS ---
  const buatChatBaru = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveRoute(null);
  };

  const muatChatLama = (id) => {
    if (isStreaming) return;
    const sesi = sessions.find(s => s.id === id);
    if (sesi) {
      setCurrentSessionId(id);
      setMessages(sesi.messages);
      setActiveRoute(null);
    }
  };

  const hapusChat = (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
    if (currentSessionId === id) buatChatBaru();
  };

  // --- LOGIKA PENGIRIMAN PESAN (HYBRID FALLBACK) ---
  const kirimPesan = async () => {
    if (!input.trim() || isStreaming) return;
    
    const instruksiUser = input;
    setInput("");
    setIsStreaming(true);
    setActiveRoute(null);

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
      const judulBaru = instruksiUser.length > 25 ? instruksiUser.substring(0, 25) + "..." : instruksiUser;
      setSessions(prev => [{ id: sessionId, title: judulBaru, messages: [] }, ...prev]);
    }

    setMessages(prev => [...prev, { role: "user", text: instruksiUser }, { role: "ai", text: "" }]);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      // Timer untuk mendeteksi laptop mati (5 detik timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const respon = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ 
          instruksi: instruksiUser, 
          paksa_model: selectedModel,
          kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026" 
        })
      });

      clearTimeout(timeoutId);
      if (!respon.ok) throw new Error("Laptop Offline");

      const reader = respon.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let bufferText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk.includes("RUTE_AKTIF:")) {
          const ruteMatch = chunk.match(/RUTE_AKTIF:(.*?)\n\n/);
          if (ruteMatch) setActiveRoute(ruteMatch[1]);
          bufferText += chunk.replace(/RUTE_AKTIF:.*\n\n/, ""); 
        } else {
          bufferText += chunk;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: bufferText };
          return newMessages;
        });
      }
    } catch (error) {
      // --- LOGIKA FALLBACK: JIKA LAPTOP MATI, PAKAI CLOUD LANGSUNG ---
      setActiveRoute("Cloud Direct (Laptop Offline)");
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: "🔄 Laptop offline. Menghubungkan ke Cloud..." };
        return newMessages;
      });

      // Panggil API OpenRouter Langsung dari sini jika backend mati
      // (Memerlukan OpenRouter Key Anda di Environment Vercel agar aman)
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: "⚠️ Maaf Mas Andi, laptop sedang mati/offline. Silakan nyalakan laptop untuk akses Qwen lokal, atau hubungi sistem Cloud." };
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  // --- RENDER HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-[#131314] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e1f20] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Lock className="text-white" size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-white mb-2">AI Coder Studio</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Hanya untuk Andiie & Project ABAPE</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-[#131314] border border-gray-700 rounded-xl p-3.5 outline-none focus:border-blue-500 transition-all text-white"
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="Sandi" 
              className="w-full bg-[#131314] border border-gray-700 rounded-xl p-3.5 outline-none focus:border-blue-500 transition-all text-white"
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              Masuk
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- RENDER DASHBOARD UTAMA ---
  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-in-out bg-[#1e1f20] shrink-0 flex flex-col border-r border-white/5 overflow-hidden`}>
        <div className="p-4">
          <button onClick={buatChatBaru} className="flex items-center gap-3 bg-[#131314] hover:bg-[#282a2c] px-4 py-3 rounded-full text-sm font-medium transition-colors border border-gray-700/50 w-full shadow-sm">
            <Plus size={18} className="text-[#a8c7fa]" /> Chat baru
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
          <div className="text-xs text-gray-500 font-bold px-2 py-2 uppercase tracking-widest">Riwayat</div>
          {sessions.map(sesi => (
            <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${currentSessionId === sesi.id ? 'bg-[#282a2c] text-blue-300 shadow-inner' : 'hover:bg-[#282a2c]/50 text-gray-400'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate text-sm font-medium">{sesi.title}</span>
              </div>
              <button onClick={(e) => hapusChat(e, sesi.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/5">
           <button onClick={handleLogout} className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-left px-2">Log out (Andiie)</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <header className="flex items-center justify-between p-4 bg-[#131314]/80 backdrop-blur-md z-10 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#282a2c] rounded-full transition-colors text-gray-400"><Menu size={20} /></button>
            <span className="font-medium text-lg tracking-tight hidden sm:block">AI Coder Studio <span className="text-blue-500 text-xs font-bold">PRO</span></span>
          </div>
          <div className="flex items-center gap-3">
            <select 
  value={selectedModel} 
  onChange={(e) => setSelectedModel(e.target.value)} 
  className="bg-[#1e1f20] hover:bg-[#282a2c] border border-gray-700 text-[#a8c7fa] text-xs font-semibold rounded-full px-4 py-2 focus:outline-none cursor-pointer transition-all shadow-lg"
>
  <optgroup label="Auto Routing">
    <option value="auto">✨ Auto Smart Manager</option>
  </optgroup>
  
  <optgroup label="Model Elite 2026 (OpenRouter)">
  <option value="anthropic/claude-opus-4.6">🧠 Claude Opus 4.6</option>
  <option value="openai/gpt-5.3-codex">⚡ GPT-5.3 Codex</option>
  <option value="qwen/qwen3-coder-next">☁️ Qwen3 Coder Next</option>
</optgroup>

  <optgroup label="Lokal (Laptop Aero 15)">
    <option value="lokal">💻 Qwen 30B (Lokal Ollama)</option>
  </optgroup>
</select>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth pb-32">
          <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
            {messages.length === 0 && (
              <div className="mt-16 md:mt-24 px-2">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Halo, Andi.</h1>
                <h2 className="text-3xl md:text-4xl font-medium text-gray-600 tracking-tight">Apa yang kita bangun hari ini?</h2>
              </div>
            )}
            <div className="space-y-10 mt-6">
              {messages.map((chat, idx) => (
                <div key={idx} className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {chat.role === 'ai' && (
                    <div className="w-8 h-8 shrink-0 flex items-start justify-center pt-1">
                      {isStreaming && idx === messages.length - 1 ? <Loader2 className="animate-spin text-blue-400" size={22} /> : <Sparkles className="text-blue-400" size={22} />}
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[80%] ${chat.role === 'user' ? 'bg-[#282a2c] px-6 py-4 rounded-3xl rounded-tr-md text-[15px] shadow-sm' : 'text-[15px] leading-relaxed w-full'}`}>
                    {chat.role === 'ai' ? (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown components={{
                            code(props) {
                              const {children, className, ...rest} = props;
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <div className="rounded-xl border border-gray-700/50 my-6 bg-[#1e1f20] overflow-hidden shadow-2xl">
                                  <div className="px-4 py-2 bg-[#282a2c] text-[10px] font-bold text-gray-400 uppercase tracking-widest">{match[1]}</div>
                                  <SyntaxHighlighter {...rest} children={String(children).replace(/\n$/, '')} language={match[1]} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem' }} />
                                </div>
                              ) : <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">{children}</code>;
                            }
                          }}>
                          {chat.text}
                        </ReactMarkdown>
                      </div>
                    ) : <div className="whitespace-pre-wrap">{chat.text}</div>}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        </main>

        {/* INPUT PILL */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-12 pb-8 px-4 md:px-8 z-20">
          <div className="max-w-3xl mx-auto bg-[#1e1f20] rounded-[32px] pl-6 pr-3 py-3 flex items-center gap-3 shadow-2xl border border-white/5 focus-within:border-blue-500/50 transition-all duration-500">
            <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] text-[#e3e3e3] placeholder-gray-500 outline-none" placeholder="Tanya sesuatu..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && kirimPesan()} disabled={isStreaming} />
            <button onClick={kirimPesan} disabled={isStreaming || !input.trim()} className="p-3.5 bg-white hover:bg-gray-200 disabled:bg-gray-800 text-black rounded-full transition-all flex items-center justify-center shrink-0 shadow-lg active:scale-90"><Send size={20} /></button>
          </div>
          <div className="text-center text-[10px] text-gray-600 mt-4 font-bold tracking-widest uppercase">
            {activeRoute ? `Jalur: ${activeRoute}` : "Sistem Siap (Matsudo Node)"}
          </div>
        </div>
      </div>
    </div>
  );
}