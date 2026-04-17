import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Sparkles, Loader2, Menu, Plus, MessageSquare, Trash2, Lock, Play, X, LayoutTemplate, Paperclip, Code, Download, Music } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'; 
import JSZip from 'jszip'; 

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); 
  const [selectedModel, setSelectedModel] = useState("auto");
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [attachments, setAttachments] = useState([]); 
  const fileInputRef = useRef(null);
  const [previewCode, setPreviewCode] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState("preview"); 

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("andiie_chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => { if(window.innerWidth > 768) setIsSidebarOpen(true); else setIsSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("andiie_auth") === "true") setIsLoggedIn(true);
    const fetchChats = async () => {
      if (supabase) {
        const { data } = await supabase.from('andiie_chats').select('*').order('updated_at', { ascending: false });
        if (data && data.length > 0) {
          setSessions(data); localStorage.setItem("andiie_chat_history", JSON.stringify(data));
        }
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (isStreaming) return;
    if (currentSessionId && messages.length > 0) {
      const pengirimOtomatis = setTimeout(() => {
        setSessions(prev => {
          const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
          localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
          if (supabase) {
            const sesiSaatIni = updated.find(s => s.id === currentSessionId);
            if (sesiSaatIni) {
              supabase.from('andiie_chats').upsert({ 
                id: currentSessionId, title: sesiSaatIni.title, messages: messages, updated_at: new Date()
              }).then(({ error }) => { if (error) console.error("Supabase Error:", error.message); });
            }
          }
          return updated;
        });
      }, 2000); 
      return () => clearTimeout(pengirimOtomatis);
    }
  }, [messages, currentSessionId, isStreaming]); 

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isStreaming]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === "andiie" && loginData.password === "Arsyad160216") {
      setIsLoggedIn(true); localStorage.setItem("andiie_auth", "true");
    } else { alert("Akses Ditolak: Hanya untuk Andi."); }
  };
  const handleLogout = () => { localStorage.removeItem("andiie_auth"); setIsLoggedIn(false); };

  const buatChatBaru = () => {
    setCurrentSessionId(null); setMessages([]); setActiveRoute(null); setIsPreviewOpen(false); setAttachments([]);
    if(window.innerWidth < 768) setIsSidebarOpen(false); 
  };
  const muatChatLama = (id) => {
    if (isStreaming) return;
    const sesi = sessions.find(s => s.id === id);
    if (sesi) {
      setCurrentSessionId(id); setMessages(sesi.messages); setActiveRoute(null); setAttachments([]); 
      if(window.innerWidth < 768) setIsSidebarOpen(false); 
    }
  };
  const hapusChat = async (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated); localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
    if (currentSessionId === id) buatChatBaru();
    if (supabase) await supabase.from('andiie_chats').delete().eq('id', id);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({ name: file.name, type: file.type, rawFile: file }));
      setAttachments(prev => [...prev, ...filesArray]);
    }
    e.target.value = null; 
  };
  const hapusAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const bacaFile = async (file) => {
    if (file.name.endsWith('.zip') || file.type.includes('zip')) {
      try {
        const zip = new JSZip(); const loadedZip = await zip.loadAsync(file);
        let extractedText = ""; const MAX_CHARS = 150000; let isLimitReached = false;
        for (const relativePath of Object.keys(loadedZip.files)) {
          if (isLimitReached) break;
          const zipEntry = loadedZip.files[relativePath];
          if (zipEntry.dir) continue;
          const badFolders = ['node_modules/', '.git/', 'venv/', 'dist/', 'build/', '.next/', 'out/', '__pycache__/'];
          if (badFolders.some(folder => relativePath.includes(folder))) continue;
          const isImageOrBinary = /\.(png|jpg|jpeg|gif|mp4|exe|pdf|ico|svg|lock|map|ttf|woff|woff2|eot|log)$/i.test(relativePath);
          if (isImageOrBinary) continue;
          const fileContent = await zipEntry.async('string');
          extractedText += `\n\n--- [FILE DARI ZIP: ${relativePath}] ---\n${fileContent}\n`;
          if (extractedText.length > MAX_CHARS) {
            extractedText += `\n\n[PERINGATAN SISTEM: Proyek ZIP terlalu besar. Pemotongan otomatis dilakukan.]`; isLimitReached = true;
          }
        }
        return { type: 'text', name: file.name + " (Extracted)", content: extractedText };
      } catch (error) { return { type: 'text', name: file.name, content: `[Gagal memproses ZIP: ${error.message}]` }; }
    } 
    return new Promise((resolve) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) { reader.onload = (e) => resolve({ type: 'image', name: file.name, content: e.target.result }); reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') { reader.onload = (e) => resolve({ type: 'application/pdf', name: file.name, content: e.target.result }); reader.readAsDataURL(file); 
      } else { reader.onload = (e) => resolve({ type: 'text', name: file.name, content: e.target.result }); reader.readAsText(file); }
    });
  };

  const unduhGambar = async (url) => {
    try {
      const respon = await fetch(url);
      if (!respon.ok) throw new Error("Diblokir CORS");
      const blob = await respon.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = "hasil-media-ai.png";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) { window.open(url, '_blank'); }
  };

  const kirimPesan = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isStreaming) return;
    const instruksiUser = input || "Tolong analisis file lampiran ini."; 
    setInput(""); setIsStreaming(true); setActiveRoute(null);

    const fileYangDiproses = await Promise.all(attachments.map(a => bacaFile(a.rawFile)));
    const historyKirim = [...messages]; 

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString(); setCurrentSessionId(sessionId);
      const judulBaru = instruksiUser.length > 25 ? instruksiUser.substring(0, 25) + "..." : instruksiUser;
      setSessions(prev => [{ id: sessionId, title: judulBaru, messages: [] }, ...prev]);
    }

    const teksTampilan = attachments.length > 0 ? `📎 [MENGIRIM ${attachments.length} FILE]\n${instruksiUser}` : instruksiUser;
    setMessages(prev => [...prev, { role: "user", text: teksTampilan }, { role: "ai", text: "" }]);

    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY || ""; 

    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const controller = new AbortController();
      const isMultimediaModel = ["openai/dall-e-3", "suno-api-custom", "sora", "veo", "wan", "seedance", "riverflow"].some(m => selectedModel.includes(m));
      const timeoutId = setTimeout(() => controller.abort(), isMultimediaModel ? 180000 : 8000); 

      const respon = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instruksi: instruksiUser, history: historyKirim, paksa_model: selectedModel, kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026", persona: selectedPersona, attachments: fileYangDiproses 
        }), signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!respon.ok) throw new Error("Server Lokal Menolak");

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
        } else { bufferText += chunk; }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: bufferText };
          return newMessages;
        });
      }
    } catch (error) {
      setActiveRoute("OPENROUTER DARURAT (LAPTOP MATI)");
      try {
        if(!OPENROUTER_API_KEY) throw new Error("VITE_OPENROUTER_KEY belum diisi di Vercel!");
        const openRouterMessages = historyKirim.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text }));
        openRouterMessages.push({ role: "user", content: teksTampilan });
        const fallbackModel = selectedModel === "google/gemma-4-31b-it" ? "google/gemma-4-31b-it" : "qwen/qwen-3-30b-it";

        const responOpenRouter = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST", headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: fallbackModel, messages: openRouterMessages, stream: true })
        });
        const reader = responOpenRouter.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let bufferText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.includes('[DONE]')) break;
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.choices[0].delta.content) {
                  bufferText += data.choices[0].delta.content;
                  setMessages(prev => {
                    const newMsg = [...prev]; newMsg[newMsg.length - 1].text = bufferText; return newMsg;
                  });
                }
              } catch (e) {}
            }
          }
        }
      } catch (fatalError) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: `❌ Sistem Gagal: Laptop Mati & API tidak merespons. Error: ${fatalError.message}` };
          return newMessages;
        });
      }
    } finally { setIsStreaming(false); setAttachments([]); }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-[#131314] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e1f20] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Lock className="text-white" size={28} /></div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-white mb-2">AI Coder Studio</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Hanya untuk Andiie & Project ABAPE</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" className="w-full bg-[#131314] border border-gray-700 rounded-xl p-3.5 outline-none focus:border-blue-500 text-white" onChange={(e) => setLoginData({...loginData, username: e.target.value})} />
            <input type="password" placeholder="Sandi" className="w-full bg-[#131314] border border-gray-700 rounded-xl p-3.5 outline-none focus:border-blue-500 text-white" onChange={(e) => setLoginData({...loginData, password: e.target.value})} />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">Masuk</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden selection:bg-blue-500/30 relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} className="fixed md:relative inset-y-0 left-0 w-72 bg-[#1e1f20] flex flex-col border-r border-white/5 shadow-2xl z-50 shrink-0">
              <div className="p-4 flex justify-between items-center">
                <button onClick={buatChatBaru} className="flex-1 flex items-center gap-3 bg-[#131314] hover:bg-[#282a2c] px-4 py-3 rounded-2xl text-sm font-medium transition-colors border border-gray-700/50 shadow-sm"><Plus size={18} className="text-[#a8c7fa]" /> Chat baru</button>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-2 p-2 text-gray-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
                <div className="text-xs text-gray-500 font-bold px-2 py-2 uppercase tracking-widest">Riwayat</div>
                {sessions.map(sesi => (
                  <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${currentSessionId === sesi.id ? 'bg-[#282a2c] text-blue-300 shadow-inner' : 'hover:bg-white/5 text-gray-400'}`}>
                    <div className="flex items-center gap-3 overflow-hidden"><MessageSquare size={16} className="shrink-0" /><span className="truncate text-sm font-medium">{sesi.title}</span></div>
                    <button onClick={(e) => hapusChat(e, sesi.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5"><button onClick={handleLogout} className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-left px-2">Log out (Andiie)</button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 bg-[#131314] relative">
        <header className="flex items-center justify-between p-4 bg-[#131314]/80 backdrop-blur-md z-10 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (<button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#282a2c] rounded-full transition-colors text-gray-400"><Menu size={20} /></button>)}
            <span className="font-medium text-lg tracking-tight hidden sm:block">AI Coder Studio <span className="text-blue-500 text-xs font-bold">PRO</span></span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Trik UI: Tombol Mode Coding Utama */}
            <button 
              onClick={() => setSelectedModel("auto_coding")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedModel === "auto_coding" ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm" : "bg-[#1e1f20] border-gray-700 text-gray-400 hover:text-white"}`}
              title="Prioritas: Qwen Lokal -> Qwen Cloud"
            >
              <Code size={14} /> Mode Coding
            </button>
            
            <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className="bg-[#1e1f20] border border-gray-700 text-purple-400 text-xs font-semibold rounded-full px-3 py-2 outline-none hidden md:block">
              <option value="default">👤 Asisten Umum</option><option value="kartos">🤖 Ahli Robotika</option><option value="seiso">🏨 IT Hotel</option>
            </select>
            
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-[#1e1f20] border border-gray-700 text-[#a8c7fa] text-xs font-semibold rounded-full px-3 py-2 outline-none max-w-[150px] md:max-w-xs truncate">
              <optgroup label="📝 Text & General">
                <option value="auto">✨ Auto Smart Manager</option>
                <option value="google/gemma-4-31b-it">🔵 Google: Gemma 4 31B (Free)</option>
              </optgroup>
              <optgroup label="💻 Coding & Logic">
                <option value="auto_coding">⚡ Auto Coding (Lokal/Cloud)</option>
                <option value="anthropic/claude-opus-4.6">🧠 Claude Opus 4.6</option>
                <option value="anthropic/claude-sonnet-4.6">⚡ Claude Sonnet 4.6</option>
                <option value="openai/gpt-5.3-codex">🚀 GPT-5.3 Codex</option>
                <option value="qwen/qwen3-coder-next">☁️ Qwen3 Coder Next</option>
                <option value="lokal">💻 Qwen 30B (Lokal Ollama)</option>
              </optgroup>
              <optgroup label="🎨 Gambar (Images)">
                <option value="sourceful/riverflow-v2-pro">🌊 Riverflow V2 Pro</option>
                <option value="google/gemini-3.1-flash-image-preview">🖼️ Gemini 3.1 Flash</option>
                <option value="openai/dall-e-3">🎨 DALL-E 3 (OpenAI API)</option>
              </optgroup>
              <optgroup label="🎬 Video Generation">
                <option value="bytedance/seedance-2.0">💃 ByteDance: Seedance 2.0</option>
                <option value="alibaba/wan-2.7">🎥 Alibaba: Wan 2.7</option>
                <option value="openai/sora-2-pro">🌌 OpenAI: Sora 2 Pro</option>
                <option value="google/veo-3.1">📽️ Google: Veo 3.1</option>
              </optgroup>
              <optgroup label="🎵 Lagu & Audio">
                <option value="google/lyria-3-clip-preview">🎼 Google: Lyria 3</option>
                <option value="suno-api-custom">🎸 Suno API (sunoapi.org)</option>
              </optgroup>
            </select>
          </div>
        </header>

        <div className="flex-1 flex flex-row overflow-hidden relative">
          <main className={`flex-1 overflow-y-auto scroll-smooth pb-40 transition-all ${isPreviewOpen && window.innerWidth > 768 ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>
            <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
              {messages.length === 0 && (
                <div className="mt-16 md:mt-24 px-2 text-center md:text-left">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Halo, Andi.</h1>
                  <h2 className="text-2xl md:text-4xl font-medium text-gray-600 tracking-tight">Apa yang kita bangun hari ini?</h2>
                </div>
              )}
              <div className="space-y-10 mt-6">
                {messages.map((chat, idx) => (
                  <div key={idx} className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {chat.role === 'ai' && (
                      <div className="w-8 h-8 shrink-0 flex items-start justify-center pt-1 hidden md:flex">
                        {isStreaming && idx === messages.length - 1 ? <Loader2 className="animate-spin text-blue-400" size={22} /> : <Sparkles className="text-blue-400" size={22} />}
                      </div>
                    )}
                    <div className={`max-w-[90%] md:max-w-[85%] ${chat.role === 'user' ? 'bg-[#282a2c] px-5 py-3 md:px-6 md:py-4 rounded-[24px] rounded-br-md text-[15px] shadow-sm' : 'text-[15px] leading-relaxed w-full'}`}>
                      {chat.role === 'ai' ? (
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                          <ReactMarkdown 
                            urlTransform={(value) => value} 
                            components={{
                              a(props) {
                                if (props.children && String(props.children).includes("AUDIO_PLAYER")) {
                                  return (
                                    <div className="bg-[#1e1f20] p-4 rounded-2xl mt-4 border border-white/10 shadow-2xl flex flex-col gap-3 w-full md:max-w-md">
                                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <Music size={14} className="text-blue-400"/> Suno Music Player
                                      </div>
                                      <audio controls src={props.href} className="w-full h-12 rounded-lg outline-none" preload="auto">
                                        Browser Anda tidak mendukung pemutar audio ini.
                                      </audio>
                                      <a href={props.href} target="_blank" rel="noreferrer" download="lagu-suno.mp3" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95">
                                        <Download size={16}/> Download MP3
                                      </a>
                                    </div>
                                  );
                                }
                                
                                if (props.children && String(props.children).includes("VIDEO_PLAYER")) {
                                  return (
                                    <div className="bg-[#1e1f20] p-4 rounded-2xl mt-4 border border-white/10 shadow-2xl w-full md:max-w-xl">
                                      <video controls src={props.href} className="w-full rounded-lg outline-none bg-black" preload="auto" autoPlay loop muted>
                                        Browser Anda tidak mendukung pemutar video ini.
                                      </video>
                                      <a href={props.href} target="_blank" rel="noreferrer" download="video-ai.mp4" className="mt-3 flex items-center justify-center gap-2 bg-[#282a2c] hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-gray-700">
                                        <Download size={16}/> Download Video
                                      </a>
                                    </div>
                                  );
                                }
                                
                                return <a {...props} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer" />;
                              },
                              
                              img(props) {
                                return (
                                  <div className="relative group inline-block my-4">
                                    <img {...props} className="rounded-xl border border-white/10 shadow-lg max-w-full h-auto" />
                                    <button onClick={() => unduhGambar(props.src)} className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md" title="Unduh Gambar"><Download size={18} /></button>
                                  </div>
                                );
                              },
                              code(props) {
                                const {children, className, ...rest} = props;
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                const isRenderable = match && (match[1] === 'html' || match[1] === 'xml');
                                return match ? (
                                  <div className="rounded-xl border border-gray-700/50 my-6 bg-[#1e1f20] overflow-hidden shadow-2xl">
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#282a2c] border-b border-gray-800">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{match[1]}</span>
                                      {isRenderable && (<button onClick={() => { setPreviewCode(codeString); setIsPreviewOpen(true); setActiveCanvasTab("preview"); }} className="flex items-center gap-1.5 text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-md font-medium"><Play size={12} fill="currentColor" /> Preview</button>)}
                                    </div>
                                    <SyntaxHighlighter {...rest} children={codeString} language={match[1]} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.2rem', fontSize: '0.85em' }} />
                                  </div>
                                ) : <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-sm">{children}</code>;
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

          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className={`flex flex-col bg-[#1e1f20] shadow-2xl z-40 ${window.innerWidth <= 768 ? 'absolute inset-0 w-full' : 'w-1/2 relative border-l border-white/10'}`}>
                <div className="bg-[#131314] border-b border-white/5 p-2 flex justify-between items-center shrink-0">
                  <div className="flex bg-[#1e1f20] p-1 rounded-lg">
                    <button onClick={() => setActiveCanvasTab("preview")} className={`px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 ${activeCanvasTab === "preview" ? "bg-blue-600/20 text-blue-400 shadow" : "text-gray-400 hover:text-gray-200"}`}><Play size={14} /> Preview</button>
                    <button onClick={() => setActiveCanvasTab("code")} className={`px-4 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 ${activeCanvasTab === "code" ? "bg-[#282a2c] text-white shadow" : "text-gray-400 hover:text-gray-200"}`}><Code size={14} /> Code</button>
                  </div>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 mr-1"><X size={18} /></button>
                </div>
                <div className="flex-1 relative bg-[#1e1f20]">
                  {activeCanvasTab === "code" ? (<textarea value={previewCode} onChange={(e) => setPreviewCode(e.target.value)} className="absolute inset-0 w-full h-full bg-transparent text-[#a8c7fa] font-mono text-[13px] p-5 outline-none resize-none" spellCheck="false" />) : (<div className="absolute inset-0 bg-white"><iframe title="CanvasPreview" srcDoc={previewCode} className="w-full h-full border-none" sandbox="allow-scripts allow-modals allow-same-origin" /></div>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:pb-8 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="bg-[#282a2c] border border-gray-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300 shadow-lg"><span className="truncate max-w-[120px] font-medium">{file.name}</span><button onClick={() => hapusAttachment(idx)} className="hover:text-red-400 bg-white/5 rounded-full p-0.5"><X size={12}/></button></div>
                ))}
              </div>
            )}
            <div className="bg-[#1e1f20] rounded-[28px] p-2 flex items-end gap-2 shadow-2xl border border-white/10 focus-within:border-blue-500/50 transition-all duration-300">
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white rounded-full"><Paperclip size={22} /></button>
              <textarea className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] md:text-[16px] text-[#e3e3e3] placeholder-gray-500 py-3 outline-none resize-none max-h-32 min-h-[44px]" placeholder="Tanya Qwen 3..." rows="1" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPesan(); } }} disabled={isStreaming} />
              <button onClick={kirimPesan} disabled={isStreaming || !input.trim()} className="p-3 bg-white text-black rounded-full hover:bg-gray-200 disabled:bg-gray-800 transition-all active:scale-90">{isStreaming ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}</button>
            </div>
            <div className="text-center text-[10px] text-gray-600 mt-3 font-bold tracking-widest uppercase">{activeRoute ? `JALUR: ${activeRoute}` : "SISTEM SIAP"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}